import os
import time
import structlog
from redis import Redis
from dotenv import load_dotenv

load_dotenv()
logger = structlog.get_logger(__name__)

REDIS_URL = os.getenv("REDIS_URL")

_redis_client = None
_last_health_check = 0
_HEALTH_CHECK_INTERVAL = 60  # Only ping Redis every 60 seconds, not on every call

def get_redis_client():
    """Returns a Redis client singleton, or None if unavailable.
    
    Performs a health check ping every 60 seconds to detect dead connections.
    Auto-recovers by resetting the singleton on failure.
    """
    global _redis_client, _last_health_check
    if not REDIS_URL:
        return None
        
    now = time.time()
    
    if _redis_client is None:
        try:
            _redis_client = Redis.from_url(REDIS_URL, decode_responses=True, socket_timeout=3)
            _redis_client.ping()
            _last_health_check = now
            logger.info("redis.connection_established")
        except Exception as e:
            logger.error("redis.connection_failed", error=str(e))
            _redis_client = None
    elif now - _last_health_check > _HEALTH_CHECK_INTERVAL:
        # Periodic health check to detect dead connections
        try:
            _redis_client.ping()
            _last_health_check = now
        except Exception:
            logger.warning("redis.connection_lost_reconnecting")
            _redis_client = None
            return get_redis_client()  # Retry once
            
    return _redis_client
