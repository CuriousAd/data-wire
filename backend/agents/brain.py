from typing import List, Literal, Optional
from pydantic import BaseModel, Field
import structlog
import json
from tenacity import retry, stop_after_attempt, retry_if_exception_type, wait_exponential

from utils.llm import brain_llm
from agents.viz_schema import VizConfig

logger = structlog.get_logger(__name__)

# ----------------------------------------------------
# Router Logic
# ----------------------------------------------------
class RouteOutput(BaseModel):
    query_type: Literal['data', 'trend', 'comparison', 'risk', 'general'] = Field(
        description="The primary classification of the query."
    )
    keywords: List[str] = Field(
        description="Extracted keywords optimized for external news searching."
    )
    active_agents: List[str] = Field(
        description="List of agents to fire. Valid names: 'analyst_agent', 'investor_agent', 'geo_politics_agent'"
    )

@retry(
    stop=stop_after_attempt(2),
    wait=wait_exponential(multiplier=1, min=1, max=3),
    retry=retry_if_exception_type(ValueError),
    reraise=True
)
def _invoke_router_with_retry(prompt: str) -> dict:
    structured_llm = brain_llm.with_structured_output(RouteOutput, include_raw=True)
    res = structured_llm.invoke(prompt)
    
    parsed = res.get("parsed") if isinstance(res, dict) else res
    if parsed is None:
        raw_val = res.get("raw") if isinstance(res, dict) else None
        raise ValueError(f"Router structured LLM returned None. Raw response: {str(raw_val)[:200]}")
    
    return parsed.model_dump()

def route_query_logic(user_query: str) -> dict:
    routing_prompt = f"""You are the router for a multi-agent AI pipeline.
    
User Query: "{user_query}"

Determine the active agents needed:
- Simple data point/aggregation (e.g. "What is the average X?") → ['analyst_agent']
- Trends/Growth/Scenarios → ['analyst_agent', 'investor_agent']
- Risk/External/Comparisons/Broad → ['analyst_agent', 'investor_agent', 'geo_politics_agent']

DO NOT OVER-ROUTE. Simple queries MUST strictly use only the analyst_agent to save resources.
"""
    try:
        return _invoke_router_with_retry(routing_prompt)
    except Exception as e:
        logger.error("brain.router.failed", error=str(e))
        return {
            "query_type": "general",
            "keywords": ["finance", "analysis"],
            "active_agents": ["analyst_agent", "investor_agent", "geo_politics_agent"]
        }

# ----------------------------------------------------
# Synthesizer Logic
# ----------------------------------------------------
class SynthesizerOutput(BaseModel):
    markdown_report: str = Field(description="The final comprehensive analytical report in markdown format.")
    viz_config: VizConfig = Field(description="The structured visualization schema design.")
    severity: Literal['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] = Field(
        description="Overall geopolitical or financial risk severity determined from the findings."
    )

@retry(
    stop=stop_after_attempt(2),
    wait=wait_exponential(multiplier=1, min=1, max=3),
    retry=retry_if_exception_type(ValueError),
    reraise=True
)
def _invoke_synthesizer_with_retry(prompt: str) -> dict:
    structured_llm = brain_llm.with_structured_output(SynthesizerOutput, include_raw=True)
    res = structured_llm.invoke(prompt)
    
    parsed = res.get("parsed") if isinstance(res, dict) else res
    if parsed is None:
        raw_val = res.get("raw") if isinstance(res, dict) else None
        parsing_err = res.get("parsing_error") if isinstance(res, dict) else None
        raise ValueError(f"Synthesizer structured LLM returned None. Error: {parsing_err}. Raw: {str(raw_val)[:200]}")
    
    return parsed.model_dump()

def synthesize_findings_logic(user_query: str, findings: List[dict]) -> dict:
    findings_str = json.dumps(findings, indent=2)
    
    synth_prompt = f"""You are the Master Synthesizer.
    
User Query: "{user_query}"
Agent Findings: {findings_str}

1. Create a cohesive Markdown report summarizing the findings. Use bullet points and headers. Do not repeat raw tool data.
2. Design ONE corresponding interactive chart (`VizConfig`) that visualizes the core data perfectly. 
   - Fill out `title`, `x_label`, and `y_label` clearly.
   - Each data point MUST use `label` (string) and `value` (number) fields. Map column names to these fields.
3. Assign an overall severity (CRITICAL, HIGH, MEDIUM, LOW).
"""
    
    try:
        return _invoke_synthesizer_with_retry(synth_prompt)
    except Exception as e:
        logger.error("brain.synthesizer.failed", error=str(e))
        # Fallback to prevent complete failure if LLM fails after retries
        return {
            "markdown_report": f"### Analysis Summary\n\nThe AI analysis completed, but report formatting encountered an issue.\n\n**Details:** {str(e)}",
            "viz_config": {
                "viz_type": "table",
                "title": "Analysis Summary",
                "data": [],
                "color_scheme": "default",
                "show_legend": False,
                "stacked": False
            },
            "severity": "LOW"
        }

