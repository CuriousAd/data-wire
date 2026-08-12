import os
import ssl
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/datawire")

# Modify URL for asyncpg if standard postgres is provided
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
elif DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)

# Supabase requires SSL context, but without strictly verifying certs in some async drivers
# For asyncpg, we add connect_args
engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    pool_size=5,        # Small pool size for Render/Supabase free tier
    max_overflow=10,
    connect_args={"ssl": "require"} if DATABASE_URL and "supabase" in DATABASE_URL else {}
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine, class_=AsyncSession, expire_on_commit=False
)

async def init_db():
    from .models import Base
    async with engine.begin() as conn:
        # User requested to skip Alembic for now, so we use create_all
        await conn.run_sync(Base.metadata.create_all)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
