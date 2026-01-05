export interface FNOLTrace {
  fnol_id: string;
  status: 'SUCCESS' | 'FAILED' | 'PARTIAL';
  start_time: string;
  end_time: string | null;
  total_duration_ms: number | null;
  created_at: string;
}

export interface FNOLStageExecution {
  id: string;
  fnol_id: string;
  stage_name: string;
  status: 'SUCCESS' | 'FAILED' | 'SKIPPED';
  start_time: string;
  end_time: string | null;
  duration_ms: number | null;
  error_code: string | null;
  error_message: string | null;
  created_at: string;
}

export interface LLMMetric {
  id: string;
  fnol_id: string;
  stage_name: string;
  model_name: string;
  prompt_version: string;
  prompt_hash: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost_usd: string;
  latency_ms: number;
  temperature: string | null;
  created_at: string;
}

export interface FNOLListItem {
  fnol_id: string;
  status: 'SUCCESS' | 'FAILED' | 'PARTIAL';
  total_duration_ms: number | null;
  failure_stage: string | null;
  created_at: string;
}

export interface FNOLListResponse {
  items: FNOLListItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface FNOLDetail {
  trace: FNOLTrace;
  stage_executions: FNOLStageExecution[];
  llm_metrics: LLMMetric[];
}

export interface LLMMetricsOverview {
  total_tokens_today: number;
  total_cost_today: string;
  avg_cost_per_fnol: string;
  cost_trend: Array<{ date: string; total_cost: number }>;
  model_distribution: Array<{
    model_name: string;
    count: number;
    total_tokens: number;
  }>;
}

export interface FailureAnalytics {
  failure_by_stage: Array<{ stage_name: string; failure_count: number }>;
  top_error_codes: Array<{ error_code: string; error_count: number }>;
  failure_trend: Array<{ date: string; failure_count: number }>;
}

export interface DashboardStats {
  total_fnols_today: number;
  success_count: number;
  failure_count: number;
  partial_count: number;
  avg_processing_time_ms: number | null;
  manual_review_percentage: number;
}
