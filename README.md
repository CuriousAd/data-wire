# Data-Wire

![Data-Wire Logo](docs/logo.png)
![Data-Wire Home Page](docs/home_page.png)
![Data-Wire Workspace](docs/workspace_chart.png)

## Live Demo
**Access the platform here:** [https://data-wire-gray.vercel.app/](https://data-wire-gray.vercel.app/)

> **Note on Processing Time:** When you ask a question, please allow **10-15 seconds** for the AI to generate a response. This intentional delay is the time required for our multi-agent architecture (Analyst, Investor, Geopolitical agents) to run deep analytical pipelines, perform statistical reasoning, and produce highly accurate, robust insights and visualizations.

## Overview
Data-Wire is a full-stack, multi-agent AI data analytics platform. Upload any CSV file, ask questions in plain English, and receive real-time AI-powered insights with auto-generated visualizations. The platform eliminates the need for specialized data science skills — making advanced data analysis accessible to business users, analysts, and anyone working with data.

## Features
- **CSV Data Ingestion:** Upload CSV files for automated profiling and analysis.
- **Natural Language Queries:** Ask plain English questions about the uploaded data.
- **Multi-Agent Pipeline:** LangGraph orchestrates specialized AI agents (Analyst, Investor, Geopolitical) that debate and synthesize insights.
- **Smart Routing:** Simple queries are routed to a single agent; complex queries trigger the full multi-agent debate — optimizing API usage.
- **Real-time Streaming:** Agent progress and analysis are streamed back via Server-Sent Events (SSE) with live status indicators.
- **Auto-generated Visualizations:** Dynamic charts (bar, line, area, scatter, pie, composed, map, table) are generated based on the AI's analysis using Recharts.
- **External Context:** The Geopolitical agent retrieves real-time news via the NewsData API to correlate data patterns with world events.
- **Redis Caching:** SQL query results and full workflow outputs are cached to minimize redundant API calls.

## Architecture

![Architecture Design](docs/architecture.png)

```
┌─────────────────┐     SSE Stream      ┌──────────────────────────────────────┐
│   React/Vite    │◄───────────────────►│          FastAPI Backend             │
│   Frontend      │     POST /api/chat   │                                      │
│                 │     POST /api/upload  │  ┌─────────┐   ┌───────────────┐    │
│  ┌───────────┐  │                      │  │ Brain    │──►│ Agent Nodes   │    │
│  │LeftPanel  │  │                      │  │ Router   │   │ (LangGraph)   │    │
│  │CenterPanel│  │                      │  └─────────┘   └───────┬───────┘    │
│  │RightPanel │  │                      │                        │            │
│  └───────────┘  │                      │  ┌─────────────────────▼──────────┐ │
│                 │                      │  │       Master Synthesizer       │ │
└─────────────────┘                      │  └────────────────────────────────┘ │
                                         └──────────┬──────────┬──────────────┘
                                                    │          │
                                         ┌──────────▼──┐  ┌───▼───────────┐
                                         │  Supabase   │  │ Upstash Redis │
                                         │  Postgres   │  │   (Cache)     │
                                         └─────────────┘  └───────────────┘
```

### AI Pipeline Flow
1. **Brain Router** classifies the query and selects which agents to activate.
2. **Agent Nodes** (Analyst, Investor, Geo-Politics) run in parallel via LangGraph, each with specialized tools (SQL queries, statistics, forecasting, trend analysis, news search).
3. **Master Synthesizer** aggregates all agent findings into a cohesive markdown report with a structured visualization config.
4. Results are streamed to the frontend via SSE events.

### Agent Specializations
| Agent | Role | Tools |
|---|---|---|
| **Analyst** | Statistical analysis, hypothesis testing, forecasting | `query_database`, `get_statistics`, `calculate_forecast` |
| **Investor** | Financial metrics, growth trends, scenario modelling | `query_database`, `calculate_trends`, `compute_ratios` |
| **Geo-Politics** | News correlation, risk classification, external context | `query_database`, `search_news` |

## Tech Stack
- **Frontend:** React 19, Vite, Tailwind CSS, Recharts, React-Markdown, react-simple-maps.
- **Backend:** FastAPI, Python 3.11+, Uvicorn, SSE-Starlette, structlog.
- **AI / Data:** LangGraph, LangChain, OpenRouter (`gpt-oss-120b`), DuckDB, Pandas, ydata-profiling, SciPy.
- **Database / Cache:** Supabase (PostgreSQL via asyncpg), Upstash Redis (TLS).
- **External Services:** NewsData.io API.
- **Deployment:** Render (Backend), Vercel (Frontend).

## Install and Run Instructions

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm
- API keys for Groq, Upstash Redis, NewsData API, and a Supabase connection URL.

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/data-wire.git
cd data-wire
```

### 2. Backend Setup
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

### 4. Access the Application (Local)
- **Frontend:** `http://localhost:5173`

Press **Ctrl+C** in the terminal to stop both servers.

## Usage Examples

### Using the Platform
Once the application is running at `http://localhost:5173`:
1. **Upload Data:** Drag and drop a `.csv` dataset into the upload zone.
2. **Processing:** Wait briefly for the backend to ingest and profile the data using DuckDB.
3. **Ask a Question:** Type a query into the chat interface, for example: *"Show me the trend of sales over the last 12 months."*
4. **View Insights:** The LangGraph agents will analyze the data, stream their thought process/explanations back to you, and dynamically render a visualization (like a line or bar chart).

### Example API Calls
You can test the backend API directly via the Swagger UI available at `http://localhost:8000/docs`.

**Data Upload Endpoint:**
```bash
curl -X 'POST' \
  'http://localhost:8000/api/upload' \
  -H 'accept: application/json' \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@your_dataset.csv'
```

**Health Check:**
```bash
curl -X 'GET' 'http://localhost:8000/health'
```

## Architecture Notes
The system utilizes a React/Vite web client communicating with a Python FastAPI backend. The frontend consumes Server-Sent Events (SSE) to display responses piecemeal as they are generated. The backend processes the CSV with DuckDB for fast analytics, securely queries an LLM routing intent, and delegates tasks to a LangGraph multi-agent pipeline. Redis is used to preserve transient state while Supabase persists metadata.

## Limitations
- Only CSV file format is currently supported for data upload.
- OpenRouter free tier rate limits constrain throughput (~30-50 queries/day without credits).
- The NewsData.io free tier may rate-limit intensive geopolitical correlation queries.

## Future Improvements
- Support for additional file formats (Excel, JSON, Parquet).
- Expanding the number of personas for deeper, domain-specific predictions.
- Ability to interact directly with a specific agent during conversations.
- More adaptive reasoning where agents evolve based on data patterns over time.
- Debate rounds between agents for higher-confidence outputs.
