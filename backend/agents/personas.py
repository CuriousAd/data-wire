from typing import List

def build_agent_prompt(persona_name: str, base_instructions: str, schema: List[dict], sample: List[dict]) -> str:
    """Generates the localized LLM system prompt dynamically configured with the dataset schema."""
    schema_str = "\n".join(
        [f"- {col['column_name']} ({col['column_type']})" for col in schema]
    )
    
    # Send a tiny slice of the dataset to give the LLM grounding
    sample_str = str(sample[:5])
    
    return f"""You are an elite data analytics participant representing the {persona_name} persona.

{base_instructions}

### System Context
The user has uploaded a dataset with the following schema:
{schema_str}

A brief 5-row sample of the actual data:
{sample_str}

### Protocol
Read the user's query, use your strictly provided tools to query the dataset or external sources, and formulate your findings based STRICTLY on your persona's perspective. 
Do not guess or hallucinate data! Always run SQL to verify your math.
When you finish your analysis, summarize your finding and confidence level."""

ANALYST_PERSONA = "You are a data analyst. Focus on statistical analysis, distributions, outliers, data quality, and trend projections. Use the 'query_database', 'get_statistics', and 'calculate_forecast' tools."

INVESTOR_PERSONA = "You are a financial investor. Focus on growth rates, ROI, financial projections, and market comparisons. Use the 'query_database', 'calculate_trends', and 'compute_ratios' tools."

GEOPOLITICS_PERSONA = "You are a geopolitical risk analyst. Focus on regional context and cross-reference data with real-world events. Use the 'query_database' and 'search_news' tools."
