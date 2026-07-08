"""ThreatMatrix FastAPI main — full pipeline"""
import os, asyncio, logging, time, uuid
from contextlib import asynccontextmanager
from typing import Optional
from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from pydantic import BaseModel, Field

from services.nlp_engine import (load_models, classify_text, extract_keywords,
    extract_entities, extract_claims, detect_language, compute_semantic_similarity,
    compute_trust_score, compute_risk_level, map_prediction_label)
from services.verification import (fetch_fact_checks, fetch_related_articles,
    fetch_wikipedia_context, rate_source_credibility)
from database.mongodb import (connect_db, disconnect_db, save_analysis,
    get_history, get_analysis_by_id, get_stats, get_recent_trend)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(levelname)s: %(message)s")
logger = logging.getLogger("threatmatrix")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS","http://localhost:5173,http://localhost:3000,http://localhost:5174").split(",")

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db(); load_models(); logger.info("✅ ThreatMatrix ready"); yield; await disconnect_db()

app = FastAPI(title="ThreatMatrix API", version="2.0.0", lifespan=lifespan)
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(CORSMiddleware, allow_origins=ALLOWED_ORIGINS, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

class AnalyzeRequest(BaseModel):
    text: str = Field(..., min_length=20, max_length=8000)
    language: Optional[str] = None

@app.get("/")
async def root(): return {"name": "ThreatMatrix API", "status": "operational"}

@app.get("/api/health")
async def health(): return {"status": "ok"}

@app.post("/api/analyze")
async def analyze(req: AnalyzeRequest, background_tasks: BackgroundTasks):
    t0 = time.monotonic()
    try:
        lang     = req.language or detect_language(req.text)
        keywords = extract_keywords(req.text)
        entities = extract_entities(req.text)
        claims   = extract_claims(req.text)
        entity_names = [e["text"] for e in entities if e["label"] in ("PERSON","ORG","GPE","NORP","EVENT")]
        query = " ".join(keywords[:5]) or req.text[:100]

        cls, fact_checks, related_articles, wiki_context = await asyncio.gather(
            classify_text(req.text),
            fetch_fact_checks(query, lang),
            fetch_related_articles(keywords, lang),
            fetch_wikipedia_context(entity_names),
        )
        fake_prob = cls["fake_probability"]
        refs = [a.get("content","") or a.get("description","") for a in related_articles]
        sim = compute_semantic_similarity(req.text, refs)

        fc_verdict = None
        if fact_checks:
            vs = [fc["verdict"].lower() for fc in fact_checks]
            if any("false" in v or "fake" in v for v in vs): fc_verdict = "false"
            elif any("true" in v for v in vs): fc_verdict = "true"

        trust = compute_trust_score(fake_prob, sim, len(fact_checks), len(related_articles))
        risk  = compute_risk_level(fake_prob, trust)
        pred  = map_prediction_label(fake_prob, fc_verdict)
        conf  = round(min(abs(fake_prob-0.5)*2 + min(len(fact_checks)*0.05,0.20), 1.0), 4)

        for art in related_articles:
            art["credibility"] = rate_source_credibility(art.get("source",""))

        explanation = {
            "ai_model_used": "RoBERTa Fake News Classifier",
            "fake_probability_reason": f"Model assigned {fake_prob*100:.1f}% fake probability",
            "fact_check_impact": f"{len(fact_checks)} fact-check result(s) — verdict: {fc_verdict or 'None'}",
            "semantic_similarity_note": f"{sim*100:.0f}% similarity to trusted sources. {'Low — may indicate fabricated content.' if sim < 0.3 else 'Good alignment.'}",
            "key_entities_flagged": entity_names[:5],
            "extracted_claims": claims,
            "risk_reasoning": f"Risk={risk} from AI score ({fake_prob:.2f}) and trust ({trust}/100)",
            "sentiment_analysis": f"{cls['sentiment']} ({cls['sentiment_score']*100:.0f}%)",
        }

        result = {"id": str(uuid.uuid4()), "text": req.text[:1000], "prediction": pred,
                  "confidence": conf, "fake_probability": fake_prob, "trust_score": trust,
                  "risk_level": risk, "sentiment": cls["sentiment"], "sentiment_score": cls["sentiment_score"],
                  "language": lang, "keywords": keywords, "entities": entities, "claims": claims,
                  "fact_checks": fact_checks, "related_articles": related_articles,
                  "wiki_context": wiki_context, "semantic_similarity": sim,
                  "explanation": explanation, "processing_time_ms": round((time.monotonic()-t0)*1000)}

        background_tasks.add_task(save_analysis, result.copy())
        return result
    except Exception as e:
        logger.exception(e); raise HTTPException(500, str(e))

@app.get("/api/history")
async def history(limit: int = Query(20, ge=1, le=100), skip: int = Query(0, ge=0)):
    return await get_history(limit=limit, skip=skip)

@app.get("/api/history/{analysis_id}")
async def history_detail(analysis_id: str):
    doc = await get_analysis_by_id(analysis_id)
    if not doc: raise HTTPException(404, "Not found")
    return doc

@app.get("/api/stats")
async def stats():
    return {"counts": await get_stats(), "trend": await get_recent_trend(7)}

@app.get("/api/trending")
async def trending():
    history = await get_history(limit=10)
    high_risk = [h for h in history if h.get("risk_level") == "High"]
    live = await fetch_related_articles(["misinformation","fake news","fact check","debunked"], "en")
    return {"from_db": high_risk[:5], "live_feed": live[:6]}

@app.get("/api/languages")
async def languages():
    return {"supported":[{"code":"en","name":"English"},{"code":"hi","name":"Hindi"},{"code":"te","name":"Telugu"}]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
