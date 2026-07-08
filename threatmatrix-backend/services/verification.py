"""Verification services: Google Fact Check, NewsAPI, Wikipedia"""
import os, logging, asyncio, httpx
import wikipediaapi

logger = logging.getLogger("threatmatrix.verification")
GOOGLE_API_KEY = os.getenv("GOOGLE_FACT_CHECK_API_KEY","")
NEWS_API_KEY   = os.getenv("NEWS_API_KEY","")
GOOGLE_FC_URL  = "https://factchecktools.googleapis.com/v1alpha1/claims:search"
NEWS_API_URL   = "https://newsapi.org/v2/everything"
_wiki = wikipediaapi.Wikipedia(language="en", user_agent="ThreatMatrix/2.0")

async def fetch_fact_checks(query, lang="en"):
    if not GOOGLE_API_KEY: return []
    try:
        async with httpx.AsyncClient(timeout=10.0) as c:
            r = await c.get(GOOGLE_FC_URL, params={"query":query[:200],"key":GOOGLE_API_KEY,"languageCode":lang})
            r.raise_for_status(); data = r.json()
        out = []
        for item in data.get("claims",[])[:5]:
            for rev in item.get("claimReview",[])[:1]:
                out.append({"claim":item.get("text","")[:300],"claimant":item.get("claimant","Unknown"),
                            "publisher":rev.get("publisher",{}).get("name","Unknown"),"url":rev.get("url",""),
                            "verdict":rev.get("textualRating","Unrated"),"date":(rev.get("reviewDate","") or "")[:10]})
        return out
    except Exception as e:
        logger.warning(f"Fact Check API: {e}"); return []

async def fetch_related_articles(keywords, lang="en"):
    if not NEWS_API_KEY or not keywords: return []
    query = " OR ".join(f'"{k}"' for k in keywords[:4])
    try:
        params = {"q":query[:500],"language": lang if lang in ("en","de","es","fr") else "en",
                  "sortBy":"relevancy","pageSize":6,"apiKey":NEWS_API_KEY}
        async with httpx.AsyncClient(timeout=10.0) as c:
            r = await c.get(NEWS_API_URL, params=params); r.raise_for_status()
            data = r.json()
        return [{"title":a["title"][:200],"source":a.get("source",{}).get("name","Unknown"),"url":a["url"],
                 "description":(a.get("description") or "")[:300],"publishedAt":(a.get("publishedAt") or "")[:10],
                 "content":(a.get("content") or a.get("description") or "")[:500]}
                for a in data.get("articles",[]) if a.get("title") and a.get("url")]
    except Exception as e:
        logger.warning(f"NewsAPI: {e}"); return []

async def fetch_wikipedia_context(entities):
    results = []; loop = asyncio.get_event_loop()
    async def _one(e):
        try:
            page = await loop.run_in_executor(None, _wiki.page, e)
            if page.exists(): return {"entity":e,"summary":page.summary[:500],"url":page.fullurl}
        except: pass
    fetched = await asyncio.gather(*[_one(e) for e in entities[:4]], return_exceptions=True)
    return [f for f in fetched if isinstance(f, dict) and f]

CREDIBLE = {"bbc news","reuters","associated press","the guardian","new york times","washington post",
            "al jazeera","npr","bloomberg","financial times","nature","science","ndtv","the hindu","pti"}
LOW_CRED = {"worldnewsdailyreport","empire news","national report","huzlers","newslo","daily currant"}

def rate_source_credibility(name):
    n = name.lower()
    if any(s in n for s in CREDIBLE): return {"rating":"High","score":90,"color":"green"}
    if any(s in n for s in LOW_CRED):  return {"rating":"Low","score":10,"color":"red"}
    return {"rating":"Medium","score":50,"color":"yellow"}
