import os
from langchain_groq import ChatGroq
from dotenv import load_dotenv

load_dotenv()

# 4 API keys across different Groq accounts
GROQ_API_KEY_1 = os.getenv("GROQ_API_KEY_1")  # Brain primary
GROQ_API_KEY_2 = os.getenv("GROQ_API_KEY_2")  # Brain fallback
GROQ_API_KEY_3 = os.getenv("GROQ_API_KEY_3")  # Agents primary
GROQ_API_KEY_4 = os.getenv("GROQ_API_KEY_4")  # Agents fallback

BRAIN_MODEL = "llama-3.3-70b-versatile"
AGENT_MODEL = "llama-3.1-8b-instant"

def _make_llm(model: str, api_key: str, fallback_key: str = None, temperature: float = 0.1):
    main_llm = ChatGroq(
        model=model,
        temperature=temperature,
        api_key=api_key,
        max_retries=2
    )
    if fallback_key:
        fallback_llm = ChatGroq(
            model=model,
            temperature=temperature,
            api_key=fallback_key,
            max_retries=2
        )
        return main_llm.with_fallbacks([fallback_llm])
    return main_llm

# Brain (70B) — used for routing + synthesis
brain_llm = _make_llm(BRAIN_MODEL, GROQ_API_KEY_1, GROQ_API_KEY_2, temperature=0.1)

# Each agent gets a DEDICATED key to avoid parallel rate-limit collisions
analyst_llm  = _make_llm(AGENT_MODEL, GROQ_API_KEY_3, GROQ_API_KEY_4, temperature=0.5)
investor_llm = _make_llm(AGENT_MODEL, GROQ_API_KEY_4, GROQ_API_KEY_3, temperature=0.5)
geopol_llm   = _make_llm(AGENT_MODEL, GROQ_API_KEY_1, GROQ_API_KEY_2, temperature=0.5)
