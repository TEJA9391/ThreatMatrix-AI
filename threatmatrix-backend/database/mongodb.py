"""MongoDB async layer"""
import os, logging
from datetime import datetime, timezone
from typing import Optional
import motor.motor_asyncio
from bson import ObjectId

logger = logging.getLogger("threatmatrix.db")
MONGODB_URI = os.getenv("MONGODB_URI","mongodb://localhost:27017")
MONGODB_DB  = os.getenv("MONGODB_DB","threatmatrix")
_client = _db = None

async def connect_db():
    global _client, _db
    try:
        _client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
        _db = _client[MONGODB_DB]
        await _client.admin.command("ping")
        await _db.analyses.create_index("timestamp")
        logger.info(f"✅ MongoDB: {MONGODB_DB}")
    except Exception as e:
        logger.warning(f"⚠️ MongoDB unavailable ({e}) — running without persistence"); _db = None

async def disconnect_db():
    if _client: _client.close()

async def save_analysis(result):
    if not _db: return "no-db"
    try:
        result["timestamp"] = datetime.now(timezone.utc).isoformat()
        ins = await _db.analyses.insert_one(result); return str(ins.inserted_id)
    except Exception as e: logger.warning(f"DB save: {e}"); return "error"

async def get_history(limit=50, skip=0):
    if not _db: return []
    try:
        cursor = _db.analyses.find({}, {"_id":1,"text":1,"prediction":1,"confidence":1,"risk_level":1,"trust_score":1,"timestamp":1,"language":1})\
                              .sort("timestamp",-1).skip(skip).limit(limit)
        docs = await cursor.to_list(length=limit)
        for d in docs: d["id"] = str(d.pop("_id"))
        return docs
    except Exception as e: logger.warning(f"DB history: {e}"); return []

async def get_analysis_by_id(aid):
    if not _db: return None
    try:
        doc = await _db.analyses.find_one({"_id": ObjectId(aid)})
        if doc: doc["id"] = str(doc.pop("_id"))
        return doc
    except: return None

async def get_stats():
    if not _db: return {"total":0,"fake":0,"real":0,"misleading":0,"partially_true":0,"high_risk":0,"medium_risk":0,"low_risk":0}
    try:
        pipe = [{"$group":{"_id":None,"total":{"$sum":1},"fake":{"$sum":{"$cond":[{"$eq":["$prediction","Fake"]},1,0]}},"real":{"$sum":{"$cond":[{"$eq":["$prediction","Real"]},1,0]}},"misleading":{"$sum":{"$cond":[{"$eq":["$prediction","Misleading"]},1,0]}},"partially_true":{"$sum":{"$cond":[{"$eq":["$prediction","Partially True"]},1,0]}},"high_risk":{"$sum":{"$cond":[{"$eq":["$risk_level","High"]},1,0]}},"medium_risk":{"$sum":{"$cond":[{"$eq":["$risk_level","Medium"]},1,0]}},"low_risk":{"$sum":{"$cond":[{"$eq":["$risk_level","Low"]},1,0]}}}}]
        res = await _db.analyses.aggregate(pipe).to_list(length=1)
        if res: r=res[0]; r.pop("_id",None); return r
    except Exception as e: logger.warning(f"DB stats: {e}")
    return {}

async def get_recent_trend(days=7):
    if not _db: return []
    try:
        pipe = [{"$addFields":{"day":{"$substr":["$timestamp",0,10]}}},{"$group":{"_id":"$day","total":{"$sum":1},"fake":{"$sum":{"$cond":[{"$eq":["$prediction","Fake"]},1,0]}},"real":{"$sum":{"$cond":[{"$eq":["$prediction","Real"]},1,0]}}}},{"$sort":{"_id":1}},{"$limit":days}]
        docs = await _db.analyses.aggregate(pipe).to_list(length=days)
        return [{"date":d["_id"],"total":d["total"],"fake":d["fake"],"real":d["real"]} for d in docs]
    except: return []
