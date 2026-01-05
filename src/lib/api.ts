import axios from 'axios';
import type {
  FNOLListResponse,
  FNOLDetail,
  LLMMetricsOverview,
  FailureAnalytics,
  DashboardStats,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ParsedEmailPayload {
  subject: string;
  body: string;
  attachments: string[];
  sender: string;
  received_at: string;
}

export const fnolApi = {
  listFNOLs: async (params: {
    page?: number;
    page_size?: number;
    status?: string;
    search?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<FNOLListResponse> => {
    const { data } = await api.get('/api/fnols', { params });
    return data;
  },

  getFNOLDetail: async (fnolId: string): Promise<FNOLDetail> => {
    const { data } = await api.get(`/api/fnols/${fnolId}`);
    return data;
  },

  getLLMMetrics: async (): Promise<LLMMetricsOverview> => {
    const { data } = await api.get('/api/metrics/llm');
    return data;
  },

  getFailureAnalytics: async (): Promise<FailureAnalytics> => {
    const { data } = await api.get('/api/analytics/failures');
    return data;
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    const { data } = await api.get('/api/dashboard/stats');
    return data;
  },

  ingestFNOL: async (payload: ParsedEmailPayload): Promise<any> => {
    const { data } = await api.post('/api/fnol-ingest', payload);
    return data;
  },
};
