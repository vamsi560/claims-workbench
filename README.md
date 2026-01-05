# FNOL Observability Platform

A production-grade observability dashboard for LLM-driven insurance FNOL (First Notice of Loss) claims processing. This system provides comprehensive monitoring, tracing, and analytics for end-to-end FNOL processing pipelines.

## Overview

This platform is designed to observe and monitor an LLM-driven insurance claims processing system that:
- Ingests FNOL data from emails and attachments
- Uses LangChain + Gemini for field extraction
- Stores data in Azure Storage
- Pushes structured FNOL to Guidewire ClaimsCenter

The observability platform tracks:
- ✅ End-to-end FNOL traceability across all pipeline stages
- ✅ Failure monitoring and analytics by stage
- ✅ LLM token usage and cost tracking
- ✅ Latency monitoring and performance metrics
- ✅ Prompt and model version tracking
- ✅ Audit-grade structured logging

## Architecture

### Tech Stack

#### Backend
- **Python 3.11** with FastAPI
- **PostgreSQL** (via Supabase) for data persistence
- **SQLAlchemy** for ORM
- **OpenTelemetry** for distributed tracing
- **Prometheus** for metrics collection
- **Structured JSON logging** with PII masking

#### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Query** (@tanstack/react-query) for data fetching
- **Recharts** for data visualization
- **Axios** for API communication

### Pipeline Stages

The system tracks the following FNOL processing stages:
1. **EMAIL_INGESTION** - Initial email receipt and parsing
2. **ATTACHMENT_PARSING** - Document extraction from attachments
3. **OCR_PROCESSING** - Optical character recognition with LLM assistance
4. **LLM_EXTRACTION** - Structured field extraction using Gemini
5. **VALIDATION** - Data validation and quality checks
6. **S3_STORAGE** - Storage of processed data
7. **GUIDEWIRE_PUSH** - Integration with Guidewire ClaimsCenter

### Database Schema

Three core tables:

**fnol_traces** - Main trace for each FNOL
- fnol_id (PK)
- status (SUCCESS | FAILED | PARTIAL)
- start_time, end_time
- total_duration_ms

**fnol_stage_executions** - Individual stage executions
- id (PK)
- fnol_id (FK)
- stage_name
- status, start_time, end_time, duration_ms
- error_code, error_message

**llm_metrics** - LLM-specific metrics
- id (PK)
- fnol_id (FK)
- model_name, prompt_version, prompt_hash
- prompt_tokens, completion_tokens, total_tokens
- cost_usd, latency_ms, temperature

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- PostgreSQL database (Supabase provided)

### 1. Database Setup

The database is already provisioned via Supabase. The schema migration has been applied automatically.

To populate with sample data:

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env and add your DATABASE_URL (from Supabase)

# Run seed script
python seed_data.py
```

### 2. Backend Setup

```bash
cd backend

# Ensure virtual environment is activated
source venv/bin/activate

# Start the FastAPI server
python -m app.main
```

The API will be available at `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

### 3. Frontend Setup

```bash
# From project root
npm install

# Create environment file
cp .env.example .env
# Edit .env and set:
# VITE_API_URL=http://localhost:8000

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## API Endpoints

### FNOL Management

**GET /api/fnols**
- List all FNOLs with pagination
- Query params: `page`, `page_size`, `status`, `search`, `date_from`, `date_to`
- Returns: Paginated list with failure stage information

**GET /api/fnols/{fnol_id}**
- Get detailed trace for specific FNOL
- Returns: Complete trace with all stage executions and LLM metrics

### Metrics & Analytics

**GET /api/metrics/llm**
- LLM usage overview
- Returns: Total tokens, costs, trends, model distribution

**GET /api/analytics/failures**
- Failure analytics
- Returns: Failures by stage, top error codes, failure trends

**GET /api/dashboard/stats**
- Dashboard summary statistics
- Returns: Today's FNOL count, success rate, avg processing time

### Observability

**GET /metrics**
- Prometheus metrics endpoint
- Exposes: Processing duration, failures, token usage, costs, latency

**GET /health**
- Health check endpoint

## Frontend Features

### Dashboard Page
- Total FNOLs processed today
- Success vs failure rate
- Average processing time
- Manual review percentage
- Status distribution visualization

### FNOL List Page
- Searchable and filterable table
- Status badges
- Processing duration
- Failure stage identification
- Pagination

### FNOL Detail Page
- Interactive timeline of stage executions
- Error details and stack traces
- LLM metrics per stage (tokens, cost, latency)
- Trace metadata

### LLM Metrics Page
- Token usage trends (line chart)
- Cost analysis over time
- Model distribution (pie chart)
- Usage details by model (bar chart)
- Detailed metrics table

## Observability Features

### Structured Logging
- JSON format for machine parsing
- PII masking (email, SSN, phone, credit cards)
- Contextual fields: fnol_id, stage, prompt_version, model_name
- Configurable log levels

### Distributed Tracing
- OpenTelemetry instrumentation
- One trace per FNOL
- One span per pipeline stage
- Automatic FastAPI and SQLAlchemy instrumentation

### Prometheus Metrics
- `fnol_processing_duration_ms` - Processing time histogram
- `fnol_failure_total` - Failure counter by stage and error code
- `llm_tokens_total` - Token consumption counter
- `llm_cost_total` - Cost accumulator
- `llm_latency_ms` - LLM API latency histogram

## Development

### Running Tests

```bash
# Backend
cd backend
pytest

# Frontend
npm run test
```

### Type Checking

```bash
# Frontend
npm run typecheck
```

### Linting

```bash
# Frontend
npm run lint
```

### Building for Production

```bash
# Frontend
npm run build

# Backend - use gunicorn or uvicorn
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## Security Considerations

- **PII Masking**: All logs automatically mask sensitive information
- **Row Level Security**: Supabase RLS policies enforce data access controls
- **API Authentication**: Ready for JWT/API key authentication (implement as needed)
- **CORS**: Configured for development; restrict origins in production
- **SQL Injection**: Protected via SQLAlchemy parameterized queries

## Extending the System

### Adding New Pipeline Stages

1. Update `PIPELINE_STAGES` in backend/app/models.py CHECK constraint
2. Update frontend stage display logic
3. Add corresponding observability instrumentation in FNOL pipeline

### Adding New LLM Models

1. Update cost calculation in LLM metrics collection
2. Add model to cost trend analysis queries
3. Update frontend model distribution visualizations

### Custom Metrics

Add new Prometheus metrics in `backend/app/observability/metrics.py`:

```python
from prometheus_client import Counter, Histogram, Gauge

my_custom_metric = Counter(
    'my_metric_name',
    'Description',
    ['label1', 'label2']
)
```

## Monitoring Production

### Key Metrics to Watch

1. **Success Rate**: Should be > 90%
2. **Avg Processing Time**: Baseline and alert on deviations
3. **LLM Cost per FNOL**: Monitor for cost anomalies
4. **Failure Rate by Stage**: Identify bottlenecks
5. **Token Usage**: Prevent runaway costs

### Alert Recommendations

- FNOL processing time > 2 minutes
- Failure rate > 10% in any 5-minute window
- LLM API latency > 10 seconds
- Any stage with > 20% failure rate

## Troubleshooting

### Backend won't start
- Check DATABASE_URL is correctly set in .env
- Ensure PostgreSQL is accessible
- Verify Python dependencies are installed

### Frontend shows "Failed to load"
- Verify backend is running at http://localhost:8000
- Check VITE_API_URL in .env
- Check browser console for CORS errors

### No data appears
- Run seed_data.py to populate sample data
- Check database connection
- Verify API endpoints return data: curl http://localhost:8000/api/fnols

## License

Proprietary - Internal use only

## Support

For issues and questions, contact the platform engineering team.
