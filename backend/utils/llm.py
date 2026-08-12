import os
import itertools
import threading
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

load_dotenv()

# ---------------------------------------------------------------------------
# Gemini API Key Pool — Round-robin rotation for rate limit distribution
# Free tier: 15 RPM per key → 5 keys = ~75 RPM effective throughput
# ---------------------------------------------------------------------------
GEMINI_KEYS = [
    os.getenv("GEMINI_API_KEY_1"),
    os.getenv("GEMINI_API_KEY_2"),
    os.getenv("GEMINI_API_KEY_3"),
    os.getenv("GEMINI_API_KEY_4"),
    os.getenv("GEMINI_API_KEY_5"),
]
GEMINI_KEYS = [k for k in GEMINI_KEYS if k]

# Thread-safe round-robin key iterator
_key_cycle = itertools.cycle(GEMINI_KEYS) if GEMINI_KEYS else None
_key_lock = threading.Lock()

MODEL_NAME = "gemini-2.5-flash"

def _next_key() -> str:
    """Returns the next API key from the round-robin pool (thread-safe)."""
    if _key_cycle is None:
        raise RuntimeError("No GEMINI_API_KEY_* environment variables configured.")
    with _key_lock:
        return next(_key_cycle)

def _make_llm(temperature: float = 0.3):
    """Creates a ChatGoogleGenerativeAI instance with Gemini 2.5 Flash.

    Each call rotates to the next API key in the pool to distribute
    rate limit consumption across all available keys.
    """
    return ChatGoogleGenerativeAI(
        model=MODEL_NAME,
        temperature=temperature,
        max_retries=3,
        google_api_key=_next_key(),
    )

# ---------------------------------------------------------------------------
# Exported LLM instances — consumed by brain.py and workflow.py
# ---------------------------------------------------------------------------

# Brain (lower temp for deterministic routing + synthesis)
brain_llm = _make_llm(temperature=0.1)

# Agents (slightly higher temp for creative reasoning)
analyst_llm  = _make_llm(temperature=0.4)
investor_llm = _make_llm(temperature=0.4)
geopol_llm   = _make_llm(temperature=0.4)

