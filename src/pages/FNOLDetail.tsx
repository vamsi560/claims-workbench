import { useQuery } from '@tanstack/react-query';
import { fnolApi } from '../lib/api';
import { Timeline } from '../components/Timeline';
import { StatusBadge } from '../components/StatusBadge';
import { ArrowLeft, Clock, Coins, Zap } from 'lucide-react';

interface FNOLDetailProps {
  fnolId: string;
  onBack: () => void;
}

export function FNOLDetail({ fnolId, onBack }: FNOLDetailProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['fnol-detail', fnolId],
    queryFn: () => fnolApi.getFNOLDetail(fnolId),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center text-gray-600">
        Failed to load FNOL details
      </div>
    );
  }

  const formatDuration = (ms: number | null) => {
    if (!ms) return 'N/A';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const totalLLMCost = data.llm_metrics.reduce(
    (sum, m) => sum + parseFloat(m.cost_usd),
    0
  );

  const totalTokens = data.llm_metrics.reduce((sum, m) => sum + m.total_tokens, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">FNOL Detail</h1>
            <p className="mt-1 text-gray-600">{fnolId}</p>
          </div>
        </div>
        <StatusBadge status={data.trace.status} size="lg" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Duration</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {formatDuration(data.trace.total_duration_ms)}
              </p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">LLM Cost</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                ${totalLLMCost.toFixed(4)}
              </p>
            </div>
            <Coins className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Tokens</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {totalTokens.toLocaleString()}
              </p>
            </div>
            <Zap className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Processing Timeline
          </h2>
          <Timeline stages={data.stage_executions} />
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Trace Information
            </h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-600">FNOL ID</dt>
                <dd className="text-sm text-gray-900 mt-1">{data.trace.fnol_id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-600">Start Time</dt>
                <dd className="text-sm text-gray-900 mt-1">
                  {formatDate(data.trace.start_time)}
                </dd>
              </div>
              {data.trace.end_time && (
                <div>
                  <dt className="text-sm font-medium text-gray-600">End Time</dt>
                  <dd className="text-sm text-gray-900 mt-1">
                    {formatDate(data.trace.end_time)}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-600">Status</dt>
                <dd className="text-sm text-gray-900 mt-1">
                  <StatusBadge status={data.trace.status} size="sm" />
                </dd>
              </div>
            </dl>
          </div>

          {data.llm_metrics.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                LLM Metrics
              </h2>
              <div className="space-y-4">
                {data.llm_metrics.map((metric) => (
                  <div
                    key={metric.id}
                    className="p-4 bg-gray-50 rounded-md border border-gray-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {metric.stage_name.replace(/_/g, ' ')}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {metric.model_name}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-green-600">
                        ${parseFloat(metric.cost_usd).toFixed(4)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                      <div>
                        <span className="text-gray-600">Tokens:</span>
                        <span className="ml-1 font-medium text-gray-900">
                          {metric.total_tokens}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Latency:</span>
                        <span className="ml-1 font-medium text-gray-900">
                          {metric.latency_ms}ms
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Version:</span>
                        <span className="ml-1 font-medium text-gray-900">
                          {metric.prompt_version}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Temp:</span>
                        <span className="ml-1 font-medium text-gray-900">
                          {metric.temperature}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
