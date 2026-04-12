import os
from contextlib import asynccontextmanager
import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from backend.database.connection import init_db
from backend.api import upload, status, chat

load_dotenv()
logger = structlog.get_logger(__name__)

# Apply structlog config
structlog.configure(
    processors=[
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer()
    ]
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("system.startup")
    await init_db()
    yield
    # Shutdown
    logger.info("system.shutdown")

app = FastAPI(title="Data-Wire API", lifespan=lifespan)

# CORS configuration
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(upload.router)
app.include_router(status.router)
app.include_router(chat.router)

@app.get("/health")
async def health_check():
    return {"status": "ok", "version": "1.0.0"}
