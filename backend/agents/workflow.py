from langgraph.graph import StateGraph, END
from langgraph.prebuilt import create_react_agent
from langchain_core.messages import HumanMessage
import structlog

from agents.state import DataWireState, AgentFinding
from agents.tools import ANALYST_TOOLS, INVESTOR_TOOLS, GEOPOLITICS_TOOLS
from agents.personas import ANALYST_PERSONA, INVESTOR_PERSONA, GEOPOLITICS_PERSONA, build_agent_prompt
from agents.brain import route_query_logic, synthesize_findings_logic
from utils.llm import agent_llm

logger = structlog.get_logger(__name__)

def brain_router_node(state: DataWireState):
    """Entry point: analyzes the query and sets up the state routing variables."""
    logger.info("workflow.router.started", query=state.get("user_query"))
    route_data = route_query_logic(state["user_query"])
    return {
        "query_type": route_data["query_type"],
        "extracted_keywords": route_data["keywords"],
        "active_agents": route_data["active_agents"]
    }

def distribute_agents(state: DataWireState):
    """Conditional edge router returning a list of active agents for parallel execution."""
    return state["active_agents"]

def create_agent_node(persona_name: str, base_persona: str, tools: list):
    """A factory that dynamically constructs a LangChain react agent node for a given persona."""
    def node(state: DataWireState):
        logger.info("workflow.agent.started", agent=persona_name)
        
        prompt = build_agent_prompt(
            persona_name, base_persona, state["data_schema"], state["data_sample"], state["dataset_id"]
        )
        
        # We leverage create_react_agent for robust tool-calling and retry loops
        agent = create_react_agent(agent_llm, tools=tools, prompt=prompt)
        
        result = agent.invoke({"messages": [HumanMessage(content=state["user_query"])]})
        final_msg = result["messages"][-1].content
        
        # Format the output to our generic AgentFinding dictionary
        finding = AgentFinding(
            agent_name=persona_name.lower().replace(" ", "_"),
            finding=final_msg,
            confidence=1.0, 
            evidence="", 
            news_context=None, 
            suggested_viz=None, 
            challenges=[]
        )
        logger.info("workflow.agent.completed", agent=persona_name)
        return {"agent_findings": [finding]}
        
    return node

analyst_node = create_agent_node("Analyst", ANALYST_PERSONA, ANALYST_TOOLS)
investor_node = create_agent_node("Investor", INVESTOR_PERSONA, INVESTOR_TOOLS)
geopol_node = create_agent_node("Geo Politics", GEOPOLITICS_PERSONA, GEOPOLITICS_TOOLS)

def synthesizer_node(state: DataWireState):
    """Aggregates parallel findings and generates the final viz and markdown report."""
    logger.info("workflow.synthesizer.started")
    report = synthesize_findings_logic(state["user_query"], state["agent_findings"])
    return {
        "final_text": report["markdown_report"],
        "final_viz": report["viz_config"],
        "news_severity": report["severity"]
    }

# ----------------------------------------------------
# Build the Graph
# ----------------------------------------------------
workflow = StateGraph(DataWireState)

workflow.add_node("brain_router", brain_router_node)
workflow.add_node("analyst_agent", analyst_node)
workflow.add_node("investor_agent", investor_node)
workflow.add_node("geo_politics_agent", geopol_node)
workflow.add_node("synthesizer", synthesizer_node)

workflow.set_entry_point("brain_router")

# LangGraph conditionally triggers nodes based on the array returned
workflow.add_conditional_edges(
    "brain_router",
    distribute_agents,
    {
        "analyst_agent": "analyst_agent",
        "investor_agent": "investor_agent",
        "geo_politics_agent": "geo_politics_agent"
    }
)

# Link all parallel processing branches to the final combiner
workflow.add_edge("analyst_agent", "synthesizer")
workflow.add_edge("investor_agent", "synthesizer")
workflow.add_edge("geo_politics_agent", "synthesizer")

workflow.add_edge("synthesizer", END)

# Compile into an executable application
app_workflow = workflow.compile()
