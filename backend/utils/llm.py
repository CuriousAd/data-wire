import os
import random
from langchain_openrouter import ChatOpenRouter
from dotenv import load_dotenv

from database.redis import get_redis_client

load_dotenv()

# 4 API keys for OpenRouter load balancing
OR_KEYS = [
    os.getenv("OPENROUTER_API_KEY_1"),
    os.getenv("OPENROUTER_API_KEY_2"),
    os.getenv("OPENROUTER_API_KEY_3"),
    os.getenv("OPENROUTER_API_KEY_4"),
]
# Filter out any None values in case some keys are missing
OR_KEYS = [k for k in OR_KEYS if k]

MODEL_NAME = "openai/gpt-oss-120b"

def get_random_key():
    return random.choice(OR_KEYS) if OR_KEYS else None

def _make_llm(temperature: float = 0.1):
    # Use a random key for load balancing to prevent rate limits
    api_key = get_random_key()
    
    # We can create fallbacks with other keys if needed, but since it's the same model, 
    # it'll be faster to retry using the agent's logic or a simple fallback chain.
    fallbacks = []
    if len(OR_KEYS) > 1:
        # Create a fallback with another key
        other_keys = [k for k in OR_KEYS if k != api_key]
        fallback_llm = ChatOpenRouter(
            model=MODEL_NAME,
            temperature=temperature,
            api_key=random.choice(other_keys),
            max_retries=2
        )
        fallbacks.append(fallback_llm)

    main_llm = ChatOpenRouter(
        model=MODEL_NAME,
        temperature=temperature,
        api_key=api_key,
        max_retries=2
    )
    
    if fallbacks:
        return main_llm.with_fallbacks(fallbacks)
    return main_llm

# Brain (120B) — used for routing + synthesis
brain_llm = _make_llm(temperature=0.1)

# Agents (120B)
analyst_llm  = _make_llm(temperature=0.4)
investor_llm = _make_llm(temperature=0.4)
geopol_llm   = _make_llm(temperature=0.4)
