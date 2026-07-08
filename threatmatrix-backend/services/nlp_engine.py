"""NLP Engine — see full implementation in threatmatrix-news/backend/services/nlp_engine.py"""
import re, os, logging, asyncio
from functools import lru_cache
from typing import Optional
from concurrent.futures import ThreadPoolExecutor

import spacy, nltk
from langdetect import detect, LangDetectException
from sentence_transformers import SentenceTransformer, util
from transformers import pipeline

logger = logging.getLogger("threatmatrix.nlp")
_executor = ThreadPoolExecutor(max_workers=2)
_classifier = _sentiment = _ner_model = _embedder = None

FAKE_NEWS_MODEL = os.getenv("FAKE_NEWS_MODEL", "hamzab/roberta-fake-news-classification")
SENTIMENT_MODEL = "distilbert-base-uncased-finetuned-sst-2-english"
EMBED_MODEL     = "all-MiniLM-L6-v2"

def load_models():
    global _classifier, _sentiment, _ner_model, _embedder
    logger.info("Loading NLP models...")
    try:
        _classifier = pipeline("text-classification", model=FAKE_NEWS_MODEL, truncation=True, max_length=512)
    except Exception as e:
        logger.warning(f"Primary classifier failed ({e}), using fallback")
        _classifier = pipeline("text-classification", model="mrm8488/bert-tiny-finetuned-fake-news", truncation=True, max_length=512)
    _sentiment = pipeline("sentiment-analysis", model=SENTIMENT_MODEL, truncation=True, max_length=512)
    try:
        _ner_model = spacy.load("en_core_web_sm")
    except OSError:
        os.system("python -m spacy download en_core_web_sm")
        _ner_model = spacy.load("en_core_web_sm")
    _embedder = SentenceTransformer(EMBED_MODEL)
    nltk.download("stopwords", quiet=True); nltk.download("punkt", quiet=True)
    logger.info("✅ All models ready")

def clean_text(text): return re.sub(r'\s+', ' ', re.sub(r'[^\w\s\.\!\?]', ' ', re.sub(r'http\S+', '', text))).strip()
def detect_language(text):
    try: return detect(text)
    except: return "en"

def extract_keywords(text, top_n=8):
    if not _ner_model: return []
    doc = _ner_model(text[:1000]); kw = set()
    for ent in doc.ents: kw.add(ent.text.strip())
    for chunk in doc.noun_chunks:
        if len(chunk.text.split()) <= 4 and len(chunk.text) > 3: kw.add(chunk.text.strip())
    return [k for k in kw if len(k) > 2][:top_n]

def extract_entities(text):
    if not _ner_model: return []
    doc = _ner_model(text[:1500]); seen = set(); entities = []
    for ent in doc.ents:
        key = (ent.text.strip(), ent.label_)
        if key not in seen and len(ent.text.strip()) > 1:
            seen.add(key)
            entities.append({"text": ent.text.strip(), "label": ent.label_, "description": spacy.explain(ent.label_) or ent.label_})
    return entities[:15]

def extract_claims(text):
    if not _ner_model: return [text[:200]]
    doc = _ner_model(text[:2000]); claims = []
    for sent in doc.sents:
        has_entity = any(e.label_ in ("ORG","PERSON","GPE","EVENT","DATE","NORP") for e in sent.ents)
        has_verb = any(t.pos_ == "VERB" for t in sent)
        if has_entity and has_verb and len(sent.text.split()) > 5: claims.append(sent.text.strip())
        if len(claims) >= 3: break
    return claims or [text[:200]]

def _run_classifier(text):
    cleaned = clean_text(text)[:512]
    cls = _classifier(cleaned)[0]
    label = cls["label"].upper(); raw = cls["score"]
    fake_prob = raw if ("FAKE" in label or label in ("LABEL_1","1")) else 1 - raw
    sent = _sentiment(cleaned)[0]
    return {"fake_probability": round(fake_prob, 4), "sentiment": sent["label"], "sentiment_score": round(sent["score"], 4)}

async def classify_text(text):
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(_executor, _run_classifier, text)

def compute_semantic_similarity(text, refs):
    if not _embedder or not refs: return 0.0
    try:
        q = _embedder.encode(text[:512], convert_to_tensor=True)
        r = _embedder.encode([t[:512] for t in refs[:5]], convert_to_tensor=True)
        return round(float(util.cos_sim(q, r)[0].max().item()), 4)
    except: return 0.0

def compute_trust_score(fake_prob, sim, fc_count, art_count):
    return max(0, min(100, round((1-fake_prob)*50 + sim*20 + min(fc_count*5,15) + min(art_count*1.5,15))))

def compute_risk_level(fake_prob, trust):
    if fake_prob >= 0.75 or trust <= 25: return "High"
    if fake_prob >= 0.45 or trust <= 55: return "Medium"
    return "Low"

def map_prediction_label(fake_prob, fc_verdict=None):
    if fc_verdict and "false" in fc_verdict.lower(): return "Fake"
    if fc_verdict and "true"  in fc_verdict.lower(): return "Real"
    if fake_prob >= 0.75: return "Fake"
    if fake_prob >= 0.50: return "Misleading"
    if fake_prob >= 0.30: return "Partially True"
    return "Real"
