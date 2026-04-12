import os
import logging
from contextlib import asynccontextmanager
import structlog
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from database.connection import init_db
from api import upload, status, chat

load_dotenv()

# -------------------------------------------------------
# Structured Logging Configuration
# Set LOG_FORMAT=json in production; defaults to colored dev output
# -------------------------------------------------------
LOG_FORMAT = os.getenv("LOG_FORMAT", "dev")

shared_processors = [
    structlog.contextvars.merge_contextvars,
    structlog.stdlib.add_log_level,
    structlog.stdlib.add_logger_name,
    structlog.processors.TimeStamper(fmt="%H:%M:%S"),
    structlog.processors.StackInfoRenderer(),
    structlog.processors.UnicodeDecoder(),
]

if LOG_FORMAT == "json":
    # Production: machine-readable JSON lines
    shared_processors.append(structlog.processors.JSONRenderer())
else:
    # Development: colorful, human-readable console output
    shared_processors.append(structlog.dev.ConsoleRenderer(
        colors=True,
        exception_formatter=structlog.dev.plain_traceback,
    ))

structlog.configure(
    processors=shared_processors,
    wrapper_class=structlog.stdlib.BoundLogger,
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

# Also route standard library logging (uvicorn, sqlalchemy) through structlog
logging.basicConfig(format="%(message)s", level=logging.INFO)

logger = structlog.get_logger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("system.startup")
    await init_db()
    yield
    # Shutdown
    logger.info("system.shutdown")

app = FastAPI(title="Data-Wire API", lifespan=lifespan)

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    # If the detail is already a dict (our standard format), use it. Otherwise wrap it.
    if isinstance(exc.detail, dict) and "code" in exc.detail:
        payload = {"success": False, "code": exc.detail.get("code"), "message": exc.detail.get("message")}
    else:
        payload = {"success": False, "code": "HTTP_ERROR", "message": str(exc.detail)}
    return JSONResponse(status_code=exc.status_code, content=payload)

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error("system.unhandled_exception", error=str(exc))
    payload = {
        "success": False,
        "code": "INTERNAL_SERVER_ERROR",
        "message": "A critical system error occurred. Please try again."
    }
    return JSONResponse(status_code=500, content=payload)

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
