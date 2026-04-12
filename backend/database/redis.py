import os
import structlog
from redis import Redis
from dotenv import load_dotenv

load_dotenv()
logger = structlog.get_logger(__name__)

REDIS_URL = os.getenv("REDIS_URL")

_redis_client = None

def get_redis_client():
    global _redis_client
    if not REDIS_URL:
        return None
        
    if _redis_client is None:
        try:
            _redis_client = Redis.from_url(REDIS_URL, decode_responses=True)
            logger.info("redis.connection_established")
        except Exception as e:
            logger.error("redis.connection_failed", error=str(e))
            _redis_client = None
            
    return _redis_client
