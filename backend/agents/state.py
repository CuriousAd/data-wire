from typing import TypedDict, List, Optional, Any, Literal, Annotated
import operator
from langchain_core.messages import BaseMessage

class NewsItem(TypedDict):
    title: str
    source: str
    date: str
    summary: str
    severity: str

class AgentFinding(TypedDict):
    agent_name: str
    finding: str
    confidence: float
    evidence: str
    news_context: Optional[str]
    suggested_viz: Optional[str]
    challenges: Optional[List[str]]

class DataWireState(TypedDict):
    messages: List[BaseMessage]
    user_query: str
    dataset_id: str
    data_schema: List[dict]
    data_sample: List[dict]
    query_type: str
    active_agents: List[str]
    extracted_keywords: List[str]
    agent_findings: Annotated[List[AgentFinding], operator.add]
    debate_round: int
    final_text: str
    final_viz: Optional[dict]
    final_viz_type: str
    news_severity: str
