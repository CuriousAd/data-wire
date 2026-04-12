import os
import httpx
import hashlib
import structlog
from urllib.parse import quote_plus
from tenacity import retry, stop_after_attempt, wait_exponential
from redis import Redis
from dotenv import load_dotenv

load_dotenv()
logger = structlog.get_logger(__name__)

NEWSDATA_API_KEY = os.getenv("NEWSDATA_API_KEY")
REDIS_URL = os.getenv("REDIS_URL")

# Initialize Redis (Upstash)
redis_client = None
if REDIS_URL:
    try:
        redis_client = Redis.from_url(REDIS_URL, decode_responses=True)
    except Exception as e:
        logger.error("redis.connection_failed", error=str(e))

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
def fetch_news_api(query: str):
    """Fetch news from NewsData.io with exponential backoff retry."""
    url = f"https://newsdata.io/api/1/latest?apikey={NEWSDATA_API_KEY}&q={quote_plus(query)}&language=en"
    response = httpx.get(url, timeout=10.0)
    response.raise_for_status()
    return response.json()

def search_news(keywords: list[str], max_results: int = 5) -> str:
    """
    Searches recent news articles and formats them for the agent.
    Utilizes Redis for 1-hour caching.
    """
    if not NEWSDATA_API_KEY:
        return "News API key not configured."
        
    query = " OR ".join(keywords)
    cache_key = f"news:{hashlib.md5(query.encode()).hexdigest()}"
    
    if redis_client:
        cached = redis_client.get(cache_key)
        if cached:
            logger.info("news.cache_hit", query=query)
            return cached
            
    logger.info("news.cache_miss", query=query)
    try:
        data = fetch_news_api(query)
        results = data.get('results', [])[:max_results]
        
        if not results:
            return "No relevant news found for the given keywords."
            
        formatted_news = []
        for article in results:
            title = article.get('title', 'No Title')
            source = article.get('source_id', 'Unknown')
            pub_date = article.get('pubDate', '')
            desc = article.get('description') or article.get('content', '')
            # Briefly truncate description
            desc = desc[:300] + "..." if len(desc) > 300 else desc
            
            formatted_news.append(f"Title: {title}\nSource: {source} ({pub_date})\nSummary: {desc}\n---")
            
        final_text = "\n".join(formatted_news)
        
        if redis_client:
            redis_client.setex(cache_key, 3600, final_text) # 1 hour TTL
            
        return final_text
    except Exception as e:
        logger.error("news.fetch_failed", query=query, error=str(e))
        return "Failed to retrieve news due to an external API error."
