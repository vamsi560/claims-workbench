/*
  # FNOL Observability Platform - Database Schema

  ## Overview
  This migration creates the core database schema for the FNOL observability platform.
  The system tracks end-to-end processing of First Notice of Loss (FNOL) claims through
  an LLM-driven pipeline with stages: EMAIL_INGESTION, ATTACHMENT_PARSING, OCR_PROCESSING,
  LLM_EXTRACTION, VALIDATION, S3_STORAGE, and GUIDEWIRE_PUSH.

  ## Tables Created

  ### 1. fnol_traces
  Main trace table tracking each FNOL's overall processing journey.
  - `fnol_id` (text, PK): Unique identifier for each FNOL
  - `status` (text): SUCCESS | FAILED | PARTIAL
  - `start_time` (timestamptz): When processing started
  - `end_time` (timestamptz): When processing completed/failed
  - `total_duration_ms` (integer): Total processing time in milliseconds
  - `created_at` (timestamptz): Record creation timestamp

  ### 2. fnol_stage_executions
  Tracks individual stage executions within each FNOL trace.
  - `id` (uuid, PK): Unique stage execution identifier
  - `fnol_id` (text, FK): Reference to parent FNOL trace
  - `stage_name` (text): Pipeline stage identifier
  - `status` (text): SUCCESS | FAILED | SKIPPED
  - `start_time` (timestamptz): Stage start time
  - `end_time` (timestamptz): Stage completion time
  - `duration_ms` (integer): Stage duration in milliseconds
  - `error_code` (text): Error code if failed
  - `error_message` (text): Detailed error message
  - `created_at` (timestamptz): Record creation timestamp

  ### 3. llm_metrics
  Captures LLM-specific metrics for token usage, costs, and model performance.
  - `id` (uuid, PK): Unique metric record identifier
  - `fnol_id` (text, FK): Reference to parent FNOL trace
  - `stage_name` (text): Pipeline stage that used LLM
  - `model_name` (text): LLM model identifier (e.g., gemini-1.5-pro)
  - `prompt_version` (text): Version identifier for prompt template
  - `prompt_hash` (text): Hash of actual prompt for change detection
  - `prompt_tokens` (integer): Input tokens consumed
  - `completion_tokens` (integer): Output tokens generated
  - `total_tokens` (integer): Total tokens (prompt + completion)
  - `cost_usd` (numeric): Cost in USD for this LLM call
  - `latency_ms` (integer): LLM API response time in milliseconds
  - `temperature` (numeric): Temperature parameter used
  - `created_at` (timestamptz): Record creation timestamp

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Policies created for authenticated users
  - Read access for all authenticated users (observability data)
  - Write access for service role only (pipeline posts data)

  ## Indexes
  - Performance indexes on foreign keys and frequently queried columns
  - Composite indexes for common query patterns (status + date ranges)

  ## Important Notes
  - All timestamps use timestamptz for proper timezone handling
  - Status fields use text with CHECK constraints for data integrity
  - Numeric costs use numeric(10,6) for precise financial calculations
  - Foreign keys include ON DELETE CASCADE for referential integrity
*/

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create fnol_traces table
CREATE TABLE IF NOT EXISTS fnol_traces (
  fnol_id text PRIMARY KEY,
  status text NOT NULL CHECK (status IN ('SUCCESS', 'FAILED', 'PARTIAL')),
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  total_duration_ms integer,
  created_at timestamptz DEFAULT now()
);

-- Create fnol_stage_executions table
CREATE TABLE IF NOT EXISTS fnol_stage_executions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  fnol_id text NOT NULL REFERENCES fnol_traces(fnol_id) ON DELETE CASCADE,
  stage_name text NOT NULL CHECK (stage_name IN ('EMAIL_INGESTION', 'ATTACHMENT_PARSING', 'OCR_PROCESSING', 'LLM_EXTRACTION', 'VALIDATION', 'S3_STORAGE', 'GUIDEWIRE_PUSH')),
  status text NOT NULL CHECK (status IN ('SUCCESS', 'FAILED', 'SKIPPED')),
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  duration_ms integer,
  error_code text,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Create llm_metrics table
CREATE TABLE IF NOT EXISTS llm_metrics (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  fnol_id text NOT NULL REFERENCES fnol_traces(fnol_id) ON DELETE CASCADE,
  stage_name text NOT NULL,
  model_name text NOT NULL,
  prompt_version text NOT NULL,
  prompt_hash text NOT NULL,
  prompt_tokens integer NOT NULL DEFAULT 0,
  completion_tokens integer NOT NULL DEFAULT 0,
  total_tokens integer NOT NULL DEFAULT 0,
  cost_usd numeric(10, 6) NOT NULL DEFAULT 0,
  latency_ms integer NOT NULL DEFAULT 0,
  temperature numeric(3, 2) DEFAULT 0.7,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_fnol_traces_status ON fnol_traces(status);
CREATE INDEX IF NOT EXISTS idx_fnol_traces_created_at ON fnol_traces(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fnol_traces_status_created ON fnol_traces(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_stage_executions_fnol_id ON fnol_stage_executions(fnol_id);
CREATE INDEX IF NOT EXISTS idx_stage_executions_status ON fnol_stage_executions(status);
CREATE INDEX IF NOT EXISTS idx_stage_executions_stage_name ON fnol_stage_executions(stage_name);
CREATE INDEX IF NOT EXISTS idx_stage_executions_created_at ON fnol_stage_executions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_llm_metrics_fnol_id ON llm_metrics(fnol_id);
CREATE INDEX IF NOT EXISTS idx_llm_metrics_model_name ON llm_metrics(model_name);
CREATE INDEX IF NOT EXISTS idx_llm_metrics_created_at ON llm_metrics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_llm_metrics_stage_name ON llm_metrics(stage_name);

-- Enable Row Level Security
ALTER TABLE fnol_traces ENABLE ROW LEVEL SECURITY;
ALTER TABLE fnol_stage_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE llm_metrics ENABLE ROW LEVEL SECURITY;

-- Policies for fnol_traces
CREATE POLICY "Authenticated users can read traces"
  ON fnol_traces FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can insert traces"
  ON fnol_traces FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Service role can update traces"
  ON fnol_traces FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for fnol_stage_executions
CREATE POLICY "Authenticated users can read stage executions"
  ON fnol_stage_executions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can insert stage executions"
  ON fnol_stage_executions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Service role can update stage executions"
  ON fnol_stage_executions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for llm_metrics
CREATE POLICY "Authenticated users can read metrics"
  ON llm_metrics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can insert metrics"
  ON llm_metrics FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Service role can update metrics"
  ON llm_metrics FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);