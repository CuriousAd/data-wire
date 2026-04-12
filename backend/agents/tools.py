import os
import json
import warnings
import pandas as pd
warnings.filterwarnings('ignore', category=UserWarning, module='pandas')
from typing import List
import psycopg2
from scipy.stats import linregress
from langchain_core.tools import tool
from utils.news_client import search_news as fetch_news
import structlog
import hashlib
from database.redis import get_redis_client

logger = structlog.get_logger(__name__)
DATABASE_URL = os.getenv("DATABASE_URL").replace("+asyncpg", "") # Get sync URL for pandas

def get_sync_conn():
    return psycopg2.connect(DATABASE_URL)

@tool
def query_database(sql: str, dataset_id: str) -> str:
    """
    Executes a read-only SQL SELECT query against the dataset table.
    The table name is always 'dataset_{dataset_id.replace('-', '_')}'.
    """
    # Simple guard block for modifications
    if not sql.strip().upper().startswith("SELECT"):
        return "ERROR: Only SELECT queries are allowed."
        
    logger.info("tool.query_database", dataset_id=dataset_id, sql=sql[:50])
    
    try:
        redis_client = get_redis_client()
        cache_key = f"sql:{dataset_id}:{hashlib.md5(sql.strip().lower().encode()).hexdigest()}"
        
        if redis_client:
            cached = redis_client.get(cache_key)
            if cached:
                logger.info("tool.query_database.cache_hit", key=cache_key)
                return cached

        conn = get_sync_conn()
        # pandas read_sql handles the execution and transforms to a dataframe beautifully
        df = pd.read_sql(sql, conn)
        conn.close()
        
        if df.empty:
            result_str = "No results found."
        elif len(df) > 10:
            df_slice = df.head(10)
            result_str = df_slice.to_csv(index=False) + f"\n\n(Truncated. Displaying 10 rows of {len(df)} total rows. Refine your SQL to Aggregate/Group By if needed.)"
        else:
            result_str = df.to_csv(index=False)
            
        if redis_client:
            redis_client.setex(cache_key, 3600, result_str)
            
        return result_str
        
    except Exception as e:
        logger.error("tool.query_database.error", error=str(e)[:100])
        return f"Database Error (Retry and fix your SQL): {str(e)}"

@tool
def get_statistics(column: str, dataset_id: str) -> str:
    """Gets descriptive stats (mean, median, min, max) for a specific numerical column."""
    table_name = f"dataset_{dataset_id.replace('-', '_')}"
    try:
        conn = get_sync_conn()
        sql = f'SELECT "{column}" FROM {table_name} WHERE "{column}" IS NOT NULL'
        df = pd.read_sql(sql, conn)
        conn.close()
        
        if df.empty:
            return "No data found for the column."
            
        desc = df[column].describe()
        return desc.to_json()
    except Exception as e:
        return f"Error: {str(e)}"

@tool
def calculate_forecast(column: str, periods: int, dataset_id: str) -> str:
    """
    Calculates a linear regression forecast for a numerical column.
    Helpful for predicting future values sequentially.
    """
    table_name = f"dataset_{dataset_id.replace('-', '_')}"
    try:
        conn = get_sync_conn()
        sql = f'SELECT "{column}" FROM {table_name} WHERE "{column}" IS NOT NULL'
        df = pd.read_sql(sql, conn)
        conn.close()
        
        if df.empty or len(df) < 5:
            return "Insufficient data for forecasting (need at least 5 points)."
            
        y = df[column].values
        x = list(range(len(y)))
        
        slope, intercept, r_value, p_value, std_err = linregress(x, y)
        
        predictions = []
        for i in range(len(y), len(y) + periods):
            pred = slope * i + intercept
            predictions.append(pred)
            
        return json.dumps({
            "trend_direction": "increasing" if slope > 0 else "decreasing",
            "r_squared": r_value**2,
            "next_values": predictions
        })
    except Exception as e:
        return f"Error: {str(e)}"

@tool
def calculate_trends(column: str, dataset_id: str) -> str:
    """Calculates period-over-period percentage growth rates for a numerical column."""
    table_name = f"dataset_{dataset_id.replace('-', '_')}"
    try:
        conn = get_sync_conn()
        sql = f'SELECT "{column}" FROM {table_name} WHERE "{column}" IS NOT NULL'
        df = pd.read_sql(sql, conn)
        conn.close()
        
        if len(df) < 2:
            return "Need at least 2 periods for trend calculation."
            
        # calculate percentage change
        df['growth'] = df[column].pct_change() * 100
        avg_growth = df['growth'].mean()
        
        overall = ((df[column].iloc[-1] - df[column].iloc[0]) / df[column].iloc[0]) * 100 if df[column].iloc[0] != 0 else 0
        
        return json.dumps({
            "average_growth_rate_pct": avg_growth,
            "latest_growth_rate_pct": df['growth'].iloc[-1],
            "overall_change_pct": overall
        })
    except Exception as e:
        return f"Error: {str(e)}"

@tool
def compute_ratios(numerator_col: str, denominator_col: str, dataset_id: str) -> str:
    """Computes a ratio between two numerical columns row by row."""
    table_name = f"dataset_{dataset_id.replace('-', '_')}"
    try:
        conn = get_sync_conn()
        sql = f'SELECT "{numerator_col}", "{denominator_col}" FROM {table_name}'
        df = pd.read_sql(sql, conn)
        conn.close()
        
        # Avoid division by zero
        df['ratio'] = df[numerator_col] / df[denominator_col].replace(0, pd.NA)
        desc = df['ratio'].describe()
        return desc.to_json()
    except Exception as e:
        return f"Error: {str(e)}"

@tool
def search_news(keywords: List[str]) -> str:
    """Searches real-world news articles based on keywords to extract context and geopolitical risk."""
    return fetch_news(keywords)

# Exported lists for agent persona attachment
ANALYST_TOOLS = [query_database, get_statistics, calculate_forecast]
INVESTOR_TOOLS = [query_database, calculate_trends, compute_ratios]
GEOPOLITICS_TOOLS = [query_database, search_news]
