import os
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_API_KEY_FALLBACK = os.getenv("GROQ_API_KEY_FALLBACK")
GROQ_BASE_URL = "https://api.groq.com/openai/v1"
MODEL_NAME = "llama-3.3-70b-versatile"

def get_llm(temperature: float = 0.1):
    # Main LLM
    main_llm = ChatOpenAI(
        model=MODEL_NAME,
        temperature=temperature,
        api_key=GROQ_API_KEY,
        base_url=GROQ_BASE_URL,
        max_retries=2
    )
    
    if GROQ_API_KEY_FALLBACK:
        # Fallback mechanism in case the primary rate limits
        fallback_llm = ChatOpenAI(
            model=MODEL_NAME,
            temperature=temperature,
            api_key=GROQ_API_KEY_FALLBACK,
            base_url=GROQ_BASE_URL,
            max_retries=2
        )
        return main_llm.with_fallbacks([fallback_llm])
        
    return main_llm

brain_llm = get_llm(temperature=0.1)
agent_llm = get_llm(temperature=0.5)
