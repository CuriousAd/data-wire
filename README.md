# Data-Wire 🚀

**Data-Wire** is a scalable, multi-agent AI data analytics platform designed to analyze, process, and derive insights from large datasets. Inspired by advanced multi-agent workflows, it employs a split-stack architecture to ingest large CSV files, securely store them, and engage a team of specialized AI agents (e.g., analysts, investors, geopolitics experts) to debate and synthesize actionable insights in real time.

---

## 🛠️ Architecture & Scalability

Our backend is built around **FastAPI** for maximal performance and uses modern, asynchronous Python (`asyncio`, `asyncpg`) to support high concurrency. We designed the architecture to scale seamlessly beyond serverless constraints.

### 📁 Scalable Directory Structure
We utilize a domain-driven, modular folder structure that enforces a clean separation of concerns:

- **`api/`**: Contains our FastAPI routers, endpoints, and validation logic. Keeping HTTP logic separate from business logic.
- **`services/`**: The core business logic and heavy lifting. Handles large file processing (using DuckDB) before pushing optimized datasets to PostgreSQL.
- **`agents/`**: Our proprietary LangChain/LangGraph-based multi-agent debate pipeline. Contains state definitions, specialized agent personas, tool definitions, and LLM orchestration logic.
- **`database/`**: Orchestrates database connection pooling (via asyncpg), SQLAlchemy ORM models, and migrations.
- **`utils/`**: Shared helper functions, API clients, and constants.

### 📝 Structured Logging
We leverage **`structlog`** universally across the application:
- **Local Development**: Emits colorful, human-readable tracebacks natively to your terminal.
- **Production**: Automatically switches to emitting structured, machine-readable JSON payloads (`LOG_FORMAT=json`). This enables flawless ingestion into centralized log management tools (like Datadog, ELK, or CloudWatch), making debugging distributed traces and analytics natively queryable.

---

## 🔌 Key Services & Technologies

1. **Supabase (PostgreSQL)**
   Serves as our primary transactional database. We connect securely via Supabase's **IPv4 Transaction Connection Pooler** (port 6543) coupled with `asyncpg` to guarantee robust performance and eliminate connection exhaustion during asynchronous operations.

2. **Upstash Serverless Redis**
   Provides highly available, low-latency caching and state management for agent workflows. It ensures rapid state retrieval using `rediss://` for TLS-secured connections.

3. **Groq & Gemini Flash**
   Powers the AI engine. Groq (Llama 3.3) provides ultra-fast intent routing and foundational pipeline reasoning, while Gemini handles complex multimodal or deep reasoning tasks seamlessly.

4. **DuckDB**
   Employed locally within our pipeline to effortlessly handle in-memory processing of massive CSV uploads (up to 2GB), allowing us to efficiently chunk, query, and stream huge datasets without bloating RAM.

5. **NewsData API**
   Equips our Geopolitical & Investor AI agents with real-time news retrieval tools to contextualize dataset insights with the latest global events.

6. **Render**
   Our deployment target. Governed by raw infrastructure-as-code (`render.yaml`), we deploy the backend application cleanly as a standalone web service to circumvent the typical Vercel serverless timeouts associated with long-running LLM tasks.

---

## 🚀 Local Development Setup

Follow these steps to get the backend running locally.

### 1. Prerequisites
- Python 3.11+
- Git

### 2. Clone and Setup Environment
Navigate to the root `data-wire` repository and switch to the backend folder:

```bash
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS / Linux:
source venv/bin/activate

# Install all dependencies
pip install -r requirements.txt
```

### 3. Environment Variables
Create a `.env` file in the `backend/` directory. You can use the provided `.env.example` as a template. You will need to populate it with your specific service keys.

```env
# LLM
GROQ_API_KEY=your_groq_api_key
GROQ_API_KEY_FALLBACK=your_fallback_key

# Supabase Postgres (Must use the Connection Pooler URL pointing to port 6543)
DATABASE_URL=postgresql://user:pass@aws-0-xxxx.pooler.supabase.com:6543/postgres

# Upstash Redis
REDIS_URL=rediss://default:your_upstash_key@your-redis-url.upstash.io:6379

# NewsData API (For Agent web search context)
NEWSDATA_API_KEY=your_newsdata_key

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### 4. Run the API locally
Once everything is configured, ignite the server using `uvicorn`:

```bash
uvicorn main:app --reload
```

- **Health Check**: `http://127.0.0.1:8000/health`
- **Interactive Swagger Docs (Test your API!)**: `http://127.0.0.1:8000/docs`

> **Note**: We rely on standard library logging combined with Uvicorn. Upon success, you'll see a structured startup log from `structlog` and notice Uvicorn watching for local hot-reloads!
