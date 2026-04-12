from typing import List, Literal, Optional
from pydantic import BaseModel, Field
import structlog
import json

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

def route_query_logic(user_query: str) -> dict:
    routing_prompt = f"""You are the router for a multi-agent AI pipeline.
    
User Query: "{user_query}"

Determine the active agents needed:
- Simple data point/aggregation (e.g. "What is the average X?") → ['analyst_agent']
- Trends/Growth/Scenarios → ['analyst_agent', 'investor_agent']
- Risk/External/Comparisons/Broad → ['analyst_agent', 'investor_agent', 'geo_politics_agent']

DO NOT OVER-ROUTE. Simple queries MUST strictly use only the analyst_agent to save resources.
"""
    structured_llm = brain_llm.with_structured_output(RouteOutput)
    try:
        result = structured_llm.invoke(routing_prompt)
        return result.model_dump()
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

def synthesize_findings_logic(user_query: str, findings: List[dict]) -> dict:
    findings_str = json.dumps(findings, indent=2)
    
    synth_prompt = f"""You are the Master Synthesizer.
    
User Query: "{user_query}"
Agent Findings: {findings_str}

1. Create a cohesive Markdown report summarizing the findings. Use bullet points and headers. Do not repeat raw tool data.
2. Design ONE corresponding interactive chart (`VizConfig`) that visualizes the core data perfectly. 
   - Fill out `title`, `x_label`, and `y_label` clearly.
3. Assign an overall severity (CRITICAL, HIGH, MEDIUM, LOW).
"""
    
    structured_llm = brain_llm.with_structured_output(SynthesizerOutput)
    try:
        result = structured_llm.invoke(synth_prompt)
        return result.model_dump()
    except Exception as e:
        logger.error("brain.synthesizer.failed", error=str(e))
        # Fallback to prevent complete failure if LLM hallucinates JSON
        return {
            "markdown_report": f"**Analysis Error:** Failed to synthesize the final report due to model format constraints.\n\nRaw exception: {str(e)}",
            "viz_config": None, # Frontend will handle this gracefully
            "severity": "LOW"
        }
