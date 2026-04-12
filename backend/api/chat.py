import json
import asyncio
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sse_starlette.sse import EventSourceResponse
import structlog
import hashlib
import re

from database.connection import get_db
from database.redis import get_redis_client
from database.models import Dataset, DatasetColumn, DatasetProfile
from agents.workflow import app_workflow
from agents.state import DataWireState

def normalize_query(query: str) -> str:
    query = query.lower()
    query = re.sub(r'[^a-z0-9\s]', '', query)
    words = query.split()
    stop_words = {"what", "is", "the", "a", "an", "of", "and", "in", "to", "show", "me", "give", "tell", "are", "do", "does", "did", "please", "can", "you", "find"}
    filtered = sorted([w for w in words if w not in stop_words])
    return "_".join(filtered)

logger = structlog.get_logger(__name__)
router = APIRouter()

class ChatRequest(BaseModel):
    query: str
    dataset_id: str

@router.post("/api/chat")
async def chat_endpoint(request: Request, body: ChatRequest, db: AsyncSession = Depends(get_db)):
    """Receives query, maps to dataset context, and streams LangGraph events to frontend via SSE."""
    # 1. Fetch Dataset context explicitly
    dataset_result = await db.execute(select(Dataset).where(Dataset.id == body.dataset_id))
    dataset = dataset_result.scalar_one_or_none()
    
    if not dataset or dataset.status != "ready":
        raise HTTPException(status_code=400, detail={"message": "Dataset not found or not ready.", "code": "DATASET_NOT_READY"})
        
    # Get schema manually from db so LLM knows columns
    cols_result = await db.execute(select(DatasetColumn).where(DatasetColumn.dataset_id == body.dataset_id))
    cols = cols_result.scalars().all()
    schema_info = [{"column_name": c.name, "column_type": c.dtype} for c in cols]
    
    # Get pre-computed profile (from ydata-profiling during ingestion)
    profile_result = await db.execute(select(DatasetProfile).where(DatasetProfile.dataset_id == body.dataset_id))
    profile = profile_result.scalar_one_or_none()
    profile_json = profile.profile_json if profile else None
    
    # 2. Build initial state
    initial_state = DataWireState(
        messages=[],
        user_query=body.query,
        dataset_id=body.dataset_id,
        data_schema=schema_info,
        data_sample=[], # Skipping explicit injection for now, tools will query logic directly
        data_profile=profile_json,
        query_type="general",
        active_agents=[],
        extracted_keywords=[],
        agent_findings=[],
        debate_round=0,
        final_text="",
        final_viz=None,
        final_viz_type="none",
        news_severity="LOW"
    )

    norm_text = normalize_query(body.query)
    cache_key = f"workflow:{body.dataset_id}:{hashlib.md5(norm_text.encode()).hexdigest()}"
    redis_client = get_redis_client()

    async def event_generator():
        try:
            if redis_client:
                cached = redis_client.get(cache_key)
                if cached:
                    logger.info("workflow.cache_hit", key=cache_key)
                    yield {
                        "event": "result",
                        "data": json.dumps({
                            "success": True,
                            "code": "INSIGHTS_GENERATED",
                            "message": "Insights instantly pulled from semantic cache.",
                            **json.loads(cached)
                        })
                    }
                    return

            # .astream() yields chunks representing the state diff sequentially updated by the nodes
            async for payload in app_workflow.astream(initial_state, stream_mode="updates"):
                if await request.is_disconnected():
                    logger.info("sse.client_disconnected")
                    break
                    
                # Payload is a dict with node name as key: {'brain_router': {...}}
                for node_name, state_update in payload.items():
                    if node_name == "brain_router":
                        yield {
                            "event": "routing",
                            "data": json.dumps({
                                "query_type": state_update.get("query_type"),
                                "active_agents": state_update.get("active_agents")
                            })
                        }
                    
                    elif node_name in ["analyst_agent", "investor_agent", "geo_politics_agent"]:
                        findings = state_update.get("agent_findings", [])
                        if findings:
                            yield {
                                "event": "agent_finding",
                                "data": json.dumps({
                                    "agent_name": node_name,
                                    # Handle both TypedDict dict fallback and standard objects during parallel append
                                    "finding": findings[0]["finding"] if isinstance(findings[0], dict) else getattr(findings[0], 'finding', '')
                                })
                            }
                            
                    elif node_name == "synthesizer":
                        yield {
                            "event": "synthesizing",
                            "data": "{}"
                        }
                        
                        viz_config = state_update.get("final_viz")
                        # Handle potential Pydantic model vs dict
                        viz_json = viz_config if isinstance(viz_config, dict) else (viz_config.model_dump() if viz_config else None)
                        
                        out_data = {
                            "text": state_update.get("final_text"),
                            "viz": viz_json,
                            "news_severity": state_update.get("news_severity")
                        }
                        
                        if redis_client:
                            redis_client.setex(cache_key, 7200, json.dumps(out_data))
                        
                        yield {
                            "event": "result",
                            "data": json.dumps({
                                "success": True,
                                "code": "INSIGHTS_GENERATED",
                                "message": "Insights successfully derived from the data debate.",
                                **out_data
                            })
                        }
                    
                # Let asynchronous event loop flush SSE bits immediately
                await asyncio.sleep(0.01)
                
        except Exception as e:
            logger.error("sse.stream_failed", error=str(e))
            yield {
                "event": "error",
                "data": json.dumps({
                    "success": False,
                    "code": "AI_ENGINE_ERROR",
                    "message": "The AI reasoning pipeline encountered garbled output or a processing error. Please try rephrasing your request.",
                    "details": str(e)
                })
            }

    return EventSourceResponse(event_generator())
