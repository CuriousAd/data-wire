# Data-Wire ⚡

**Data-Wire** is a full-stack, multi-agent AI data analytics platform. Upload any CSV, ask questions in plain English, and get real-time AI-powered insights with auto-generated visualizations — powered by a LangGraph agent debate pipeline, FastAPI streaming backend, and a React + Recharts frontend.

---

## 📑 Table of Contents

- [Architecture](#️-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start (Both Servers)](#-quick-start-both-servers)
- [Backend Setup](#-backend-setup)
- [Frontend Setup](#-frontend-setup)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Deployment](#-deployment)

---

## 🏗️ Architecture

```
Browser (React + Vite)
       │  HTTP / SSE streaming
       ▼
FastAPI (Python 3.11+)
  ├── CSV upload → DuckDB processing → Supabase/Postgres
  ├── Intent router (Groq Llama 3.3)
  └── LangGraph multi-agent pipeline
        ├── 📊 Analyst Agent
        ├── 💹 Investor Agent
        └── 🌍 Geopolitical Agent
              └── NewsData API (real-time context)
```

Agents stream their outputs back to the browser via **Server-Sent Events (SSE)**, so you see the analysis as it happens.

---

## 🔌 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, Recharts, React-Markdown |
| **Backend** | FastAPI, Uvicorn, asyncio, SSE-Starlette |
| **AI / Agents** | LangGraph, LangChain-Groq (Llama 3.3) |
| **Data Processing** | DuckDB, Pandas, ydata-profiling |
| **Database** | Supabase (asyncpg / PostgreSQL) |
| **Cache / State** | Upstash Redis (TLS) |
| **News Context** | NewsData.io API |
| **Logging** | structlog (pretty dev / JSON prod) |
| **Deployment** | Render (backend) + any static host (frontend) |

---

## 🗂️ Project Structure

```
data-wire/
├── dev.sh                  # One-command dev launcher (both servers)
├── frontend/               # React + Vite app
│   ├── src/
│   │   ├── components/
│   │   │   ├── chat/       # ChatContainer, ChatInput, MessageBubble, StreamingStatus
│   │   │   ├── upload/     # UploadZone, ProcessingScreen
│   │   │   └── viz/        # ChartRenderer + 8 chart types
│   │   ├── api/            # fetch helpers (chat, upload, status)
│   │   ├── hooks/          # useChat, useUpload
│   │   ├── store/          # React Context app state
│   │   └── utils/          # color schemes, helpers
│   └── package.json
└── backend/
    ├── main.py             # FastAPI app entry point
    ├── requirements.txt
    ├── .env.example
    ├── api/                # HTTP routers & endpoint handlers
    ├── agents/             # LangGraph pipeline, agent personas, tools
    ├── services/           # CSV ingestion, DuckDB processing, profiling
    ├── database/           # asyncpg pool, SQLAlchemy models
    └── utils/              # shared helpers, API clients
```

---

## ⚡ Quick Start (Both Servers)

The fastest way to run both the backend and frontend together:

```bash
# Clone the repo
git clone https://github.com/your-username/data-wire.git
cd data-wire

# 1. Set up the backend venv (first time only)
cd backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
cp .env.example .env          # then fill in your keys (see below)
cd ..

# 2. Install frontend deps (first time only)
cd frontend && npm install && cd ..

# 3. Launch everything
chmod +x dev.sh
./dev.sh
```

`dev.sh` starts both servers in parallel and prefixes their output:
- **Backend** → `http://localhost:8000`
- **Frontend** → `http://localhost:5173`

Press **Ctrl+C** to stop both.

---

## 🐍 Backend Setup

### Prerequisites
- Python **3.11+**
- pip / virtualenv

### 1. Create a virtual environment

```bash
cd backend

# Create venv (the dev.sh script expects .venv, not venv)
python3 -m venv .venv

# Activate
source .venv/bin/activate          # macOS / Linux
# .venv\Scripts\activate           # Windows
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

Key packages installed:

| Package | Purpose |
|---|---|
| `fastapi` + `uvicorn` | HTTP server & routing |
| `sse-starlette` | Server-Sent Events streaming |
| `langchain-groq` + `langgraph` | Multi-agent pipeline |
| `duckdb` | In-process CSV processing |
| `pandas` + `ydata-profiling` | Data profiling |
| `asyncpg` + `SQLAlchemy` | Async Postgres |
| `redis` | Upstash Redis client |
| `structlog` | Structured logging |
| `tenacity` | Retry logic (Groq rate limits) |

### 3. Configure environment variables

```bash
cp .env.example .env
# Now open .env and fill in your keys (see Environment Variables section)
```

### 4. Run the backend

```bash
# With hot-reload (development)
uvicorn main:app --reload --port 8000

# Or via the activated venv directly
.venv/bin/uvicorn main:app --reload --port 8000
```

| URL | Description |
|---|---|
| `http://localhost:8000/health` | Health check |
| `http://localhost:8000/docs` | Interactive Swagger UI |
| `http://localhost:8000/redoc` | ReDoc API reference |

---

## 🎨 Frontend Setup

### Prerequisites
- **Node.js 18+** and npm

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Run the dev server

```bash
npm run dev
```

Opens at **`http://localhost:5173`** with hot module replacement.

### Other useful commands

```bash
npm run build      # Production build → dist/
npm run preview    # Preview the production build locally
npm run lint       # ESLint check
```

### Frontend environment

The frontend talks to the backend at `http://localhost:8000` by default. If you change the backend port, update the API base URL in `frontend/src/api/`.

---

## 🔑 Environment Variables

Create `backend/.env` (copy from `.env.example`):

```env
# ── LLM ────────────────────────────────────────────────────────────────────
# Get your key at https://console.groq.com
GROQ_API_KEY=gsk_...
GROQ_API_KEY_FALLBACK=gsk_...          # optional secondary key for rate-limit fallback

# ── Database ────────────────────────────────────────────────────────────────
# Use the Supabase Transaction Connection Pooler URL (port 6543, not 5432)
# https://supabase.com/dashboard/project/_/settings/database
DATABASE_URL=postgresql+asyncpg://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

# ── Cache ───────────────────────────────────────────────────────────────────
# Upstash Redis → https://console.upstash.com
# Must use rediss:// (TLS) not redis://
REDIS_URL=rediss://default:[password]@[host].upstash.io:6379

# ── News context for agents ─────────────────────────────────────────────────
# https://newsdata.io/register
NEWSDATA_API_KEY=pub_...

# ── CORS ────────────────────────────────────────────────────────────────────
# Must match the URL your browser opens the frontend on
FRONTEND_URL=http://localhost:5173
```

> **Important:** Supabase requires the Transaction **Pooler** URL on port **6543**, not the direct 5432 connection, for asyncpg compatibility.

---

## 📡 API Reference

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/api/upload` | Upload a CSV file (multipart/form-data) |
| `GET` | `/api/status/{dataset_id}` | Poll dataset processing status |
| `GET` | `/api/chat/stream` | SSE stream — send query, receive agent chunks |

The Swagger UI at `http://localhost:8000/docs` has live request/response examples for every endpoint.

---

## 🚀 Deployment

### Backend → Render

A `render.yaml` is included. Connect your GitHub repo to [Render](https://render.com), point it at `backend/`, and set the environment variables in the Render dashboard.

```yaml
# render.yaml (already in backend/)
services:
  - type: web
    name: data-wire-api
    runtime: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Frontend → Any Static Host

```bash
cd frontend
npm run build        # outputs to frontend/dist/
```

Deploy the `dist/` folder to **Vercel**, **Netlify**, **Render Static Site**, or any CDN. Set the backend API URL to your Render service URL before building.

---

## 🪪 License

MIT — do whatever you want with it.
