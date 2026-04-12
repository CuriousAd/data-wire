from typing import List
import json


# ---------------------------------------------------------------------------
# Analyst Persona
# ---------------------------------------------------------------------------
ANALYST_PERSONA = """You are a senior quantitative data analyst.

Your Analytical Framework:
1. **Hypothesis & Query** — Answer the user's question by formulating a hypothesis. Use SQL (`query_database`) to slice, aggregate, and analyze. Use `get_statistics` for descriptives.
2. **Trend & Forecast** — If temporal, use `calculate_forecast`. Report R².
"""

# ---------------------------------------------------------------------------
# Investor Persona
# ---------------------------------------------------------------------------
INVESTOR_PERSONA = """You are a financial analyst and investment strategist.

Your Analytical Framework:
1. **Metric Identification** — Identify proxy metrics for revenue, margin, growth, or unit economics.
2. **Growth & Trend** — Use `calculate_trends` and compare ratios using `compute_ratios`.
3. **Scenario & Risk** — Formulate Bull, Base, and Bear scenarios based on data. State Upside, Downside, and Catalysts.
"""

# ---------------------------------------------------------------------------
# Geopolitics Persona
# ---------------------------------------------------------------------------
GEOPOLITICS_PERSONA = """You are a geopolitical risk analyst.

Your Analytical Framework:
1. **News Correlation** — Use `search_news` to find recent events related to the dataset domain.
2. **Data-Driven Validation** — Use `query_database` to verify whether news-driven hypotheses are supported by actual data.
3. **Risk Classification** — Classify the primary risk as CRITICAL, HIGH, MEDIUM, or LOW, explaining the impact pathway.
"""


# ---------------------------------------------------------------------------
# Prompt Builder
# ---------------------------------------------------------------------------
def _format_sample_as_markdown(sample: List[dict], max_rows: int = 3, max_cols: int = 15) -> str:
    """Converts a highly trimmed sample of data into a readable markdown table."""
    rows = sample[:max_rows]
    if not rows:
        return "_No sample data available._"

    all_headers = list(rows[0].keys())
    headers = all_headers[:max_cols]
    omitted = len(all_headers) - len(headers)

    # Header row
    header_line = "| " + " | ".join(str(h) for h in headers)
    if omitted > 0:
        header_line += " | *(...)*"
    header_line += " |"

    separator = "| " + " | ".join("---" for _ in headers)
    if omitted > 0:
        separator += " | ---"
    separator += " |"

    # Data rows
    data_lines = []
    for row in rows:
        cells = []
        for h in headers:
            val = row.get(h, "")
            s = str(val)
            # Extremely tight truncation for sample cells
            cells.append(s[:30] + "…" if len(s) > 30 else s)
        
        line = "| " + " | ".join(cells)
        if omitted > 0:
            line += f" | +{omitted} cols"
        line += " |"
        data_lines.append(line)

    return "\n".join([header_line, separator] + data_lines)


def _format_profile_summary(profile_json: dict, schema: List[dict]) -> str:
    """Formats the pre-computed ydata-profiling output into a readable summary for the LLM.
    
    This uses the PIPELINE's profile (computed from 10,000 rows) — NOT a re-derivation
    from the tiny 5-row sample. This avoids redundant work.
    """
    if not profile_json or "variables" not in profile_json:
        return "_No profile data available._"

    variables = profile_json["variables"]
    lines = []

    for col_info in schema:
        col = col_info["column_name"]
        col_type = col_info["column_type"]
        var_stats = variables.get(col, {})

        n_missing = var_stats.get("n_missing", "?")
        n_unique = var_stats.get("n_unique", "?")
        stat = f"- **{col}** ({col_type}) — {n_missing} missing, {n_unique} unique"

        # Add numeric range if the profile captured it
        if var_stats.get("mean") is not None:
            mean = var_stats["mean"]
            v_min = var_stats.get("min", "?")
            v_max = var_stats.get("max", "?")
            stat += f", mean={mean:.2f}, range [{v_min} – {v_max}]"

        lines.append(stat)

    return "\n".join(lines)


def build_agent_prompt(
    persona_name: str,
    base_instructions: str,
    schema: List[dict],
    sample: List[dict],
    dataset_id: str = "",
    profile_json: dict = None,
) -> str:
    """Generates the localized LLM system prompt dynamically configured with the dataset schema.
    
    Args:
        profile_json: Pre-computed ydata-profiling output from the ingestion pipeline.
                      If provided, used for column stats instead of re-deriving from sample.
    """

    # Strict 25-column cap to protect the 6k token limit for 8B models
    safe_schema = schema[:25]
    if len(schema) > 25:
        schema_str = "\n".join([f"- {col['column_name']} ({col['column_type']})" for col in safe_schema])
        schema_str += f"\n- *(... {len(schema) - 25} more columns omitted for brevity. You can still query them!)*"
    else:
        schema_str = "\n".join([f"- {col['column_name']} ({col['column_type']})" for col in schema])

    sample_table = _format_sample_as_markdown(sample)
    column_stats = _format_profile_summary(profile_json or {}, safe_schema)

    # Only include sample section if we actually have sample data to show
    sample_section = ""
    if sample:
        sample_section = f"""
#### Sample Data (first 3 rows, truncated)
{sample_table}
"""

    # Derive the actual Postgres table name so the LLM uses it exactly
    table_name = f"dataset_{dataset_id.replace('-', '_')}" if dataset_id else "UNKNOWN"

    return f"""You are an elite data analytics participant representing the **{persona_name}** persona.

{base_instructions}

---

### Dataset Overview
- **Columns**: {len(schema)}
- **SQL table name**: `{table_name}`
- **dataset_id**: `{dataset_id}`

#### Schema
{schema_str}

#### Column Quality Summary (pre-computed by ingestion pipeline)
{column_stats}
{sample_section}

---

### Important Context
The data has already been **cleaned, deduplicated, and profiled** by the ingestion pipeline. \
Do NOT waste tool calls on basic data quality checks — that work is done. \
Focus your tool usage entirely on **answering the user's question** through analysis, \
aggregation, and reasoning.

### Mandatory Rules
1. When calling any tool that requires a `dataset_id` parameter, use exactly: `{dataset_id}`
2. When writing SQL queries, the table name is exactly: `{table_name}`
3. **CRITICAL POSTGRES RULE**: You MUST wrap all column names in double quotes in your SQL queries (e.g., `SELECT "currentPrice" FROM...`). Postgres is case-sensitive, and failing to quote camelCase columns will cause your tool to crash.
4. **Never guess or hallucinate data.** Always run SQL via `query_database` to verify your claims.
5. If a query returns unexpected results, re-examine your SQL and retry before giving up.
6. When you finish your analysis, provide your response in this structure:

   **Summary**: 2-3 sentence headline of your finding.

   **Detailed Analysis**: Full explanation with data citations.

   **Confidence**: A number between 0.0 and 1.0, with justification.

   **Challenges & Limitations**: 2-3 weaknesses or alternative explanations.

   **Suggested Visualization**: Chart type and which columns to plot.
"""
