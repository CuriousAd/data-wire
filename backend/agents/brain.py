from typing import List, Literal, Optional
from pydantic import BaseModel, Field
import structlog
import json

from backend.utils.llm import brain_llm
from backend.agents.viz_schema import VizConfig

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
    """Uses the Brain LLM to determine active agents."""
    routing_prompt = f"""You are the master router for a multi-agent AI pipeline.
    
User Query: "{user_query}"

Analyze the query and determine the routing.
Rules:
- Simple data/stats queries → ['analyst_agent']
- Future/Growth/Trends/Finance → ['analyst_agent', 'investor_agent']
- Risk, Regional, Wars, Comparisons → ['analyst_agent', 'investor_agent', 'geo_politics_agent']
- If General / Unsure → ['analyst_agent', 'investor_agent', 'geo_politics_agent']

Return precisely the structure required.
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
    """Consumes all findings from agents and designs the final frontend payload."""
    findings_str = json.dumps(findings, indent=2)
    
    synth_prompt = f"""You are the Master Synthesizer for Data-Wire.
    
User Query: "{user_query}"

Agent Findings:
{findings_str}

Your Job:
1. Create a robust, cohesive Markdown report summarizing the multi-perspective insights.
2. Design exactly ONE corresponding interactive chart (VizConfig) that visualizes the core data perfectly in the UI.
3. Assign a risk severity:
   - CRITICAL: Direct immediate impact.
   - HIGH: Impact within 3-6 months.
   - MEDIUM: Indirect or long-term.
   - LOW: Minimal direct impact.
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
