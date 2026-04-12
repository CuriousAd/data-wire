# Data-Wire

## Overview
Data-Wire is a full-stack, multi-agent AI data analytics platform. It allows users to upload any CSV file, ask questions in plain English, and receive real-time AI-powered insights with auto-generated visualizations. The platform solves the problem of needing specialized data science skills to extract insights from raw data, making advanced data analysis accessible to business users, analysts, and anyone dealing with data.

## Features
- **CSV Data Ingestion:** Upload CSV files directly into the platform for processing.
- **Natural Language Queries:** Ask plain English questions about the uploaded data.
- **Multi-Agent Pipeline:** Utilizes LangGraph for a pipeline of specialized agents (Analyst, Investor, Geopolitical).
- **Real-time Streaming Responses:** Agent outputs and analysis are streamed back to the frontend in real-time using Server-Sent Events (SSE).
- **Auto-generated Visualizations:** Dynamic charts are generated based on the AI's analysis.
- **External Real-time Context:** Retrieves current news context using the NewsData API for the Geopolitical agent.

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
Open `backend/.env` and securely add your required API keys and database URLs. Ensure the Supabase URL uses the transaction pooler (port 6543).

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```
(By default, the frontend is configured to communicate with the backend at `http://localhost:8000`).

### 4. Run the Project
The fastest way to run both backend and frontend together is using the provided launch script from the root directory:
```bash
cd ..
chmod +x dev.sh
./dev.sh
```
- **Backend:** `http://localhost:8000`
- **Frontend:** `http://localhost:5173`

Press **Ctrl+C** in the terminal to stop both servers.

## Tech Stack
- **Frontend:** React 19, Vite, Tailwind CSS, Recharts, React-Markdown.
- **Backend:** FastAPI, Python 3.11+, Uvicorn, SSE-Starlette.
- **AI / Data:** LangGraph, LangChain-Groq (Llama 3.3), DuckDB, Pandas, ydata-profiling.
- **Database / Cache:** Supabase (asyncpg / PostgreSQL), Upstash Redis (TLS).
- **External Services:** NewsData.io API.
- **Deployment:** Render (Backend).

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
- Large files may hit processing constraints due to hardware limits or Groq API token limits.
- The use of external APIs relies on free tiers which may rate limit intensive usage.

