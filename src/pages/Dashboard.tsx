import { useQuery } from '@tanstack/react-query';
import { fnolApi } from '../lib/api';
import { Cpu, MemoryStick, Network, Timer } from 'lucide-react';
import { MetricCard } from '../components/MetricCard';

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  networkIO: number;
  frontendLatency: number;
  emailIngestionLatency: number;
  emailParsingTime: number;
  llmTokens: number;
  llmLatency: number;
  llmCost: number;
}

export function Dashboard() {
  // Replace with real API call to fetch metrics from backend
  const { data: metrics, isLoading } = useQuery<SystemMetrics | null>({
    queryKey: ['system-metrics'],
    queryFn: async () => {
      // Example: fetch from /api/metrics/observability (implement this endpoint in backend)
      // const res = await fetch('/api/metrics/observability');
      // if (!res.ok) return null;
      // return res.json();
      return null; // No mock data, empty by default
    },
    refetchInterval: 5000, // Poll every 5s for live metrics
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-500">
        <div className="text-2xl font-semibold mb-2">No metrics available</div>
        <div className="text-sm">Metrics will appear here once the system is processing data.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">System & Observability Metrics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <MetricCard
          title="CPU Usage"
          value={`${metrics.cpuUsage}%`}
          icon={Cpu}
        />
        <MetricCard
          title="Memory Usage"
          value={`${metrics.memoryUsage}%`}
          icon={MemoryStick}
        />
        <MetricCard
          title="Network IO"
          value={`${metrics.networkIO} KB/s`}
          icon={Network}
        />
        <MetricCard
          title="Frontend UI Latency"
          value={`${metrics.frontendLatency} ms`}
          icon={Timer}
        />
        <MetricCard
          title="Email Ingestion Latency"
          value={`${metrics.emailIngestionLatency} s`}
          icon={Timer}
        />
        <MetricCard
          title="Email Parsing Time"
          value={`${metrics.emailParsingTime} s`}
          icon={Timer}
        />
        <MetricCard
          title="LLM Tokens"
          value={`${metrics.llmTokens}`}
          icon={Timer}
        />
        <MetricCard
          title="LLM Latency"
          value={`${metrics.llmLatency} s`}
          icon={Timer}
        />
        <MetricCard
          title="LLM Cost"
          value={`$${metrics.llmCost}`}
          icon={Timer}
        />
      </div>
    </div>
  );
}
