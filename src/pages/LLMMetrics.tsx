import { useQuery } from '@tanstack/react-query';
import { fnolApi } from '../lib/api';
import { MetricCard } from '../components/MetricCard';
import { Coins, TrendingUp, Zap, Cpu } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export function LLMMetrics() {
  const { data, isLoading } = useQuery({
    queryKey: ['llm-metrics'],
    queryFn: fnolApi.getLLMMetrics,
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
        Failed to load LLM metrics
      </div>
    );
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">LLM Metrics</h1>
        <p className="mt-2 text-gray-600">
          Monitor token usage, costs, and model performance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Tokens Today"
          value={data.total_tokens_today.toLocaleString()}
          icon={Zap}
          color="yellow"
        />
        <MetricCard
          title="Total Cost Today"
          value={`$${parseFloat(data.total_cost_today).toFixed(2)}`}
          icon={Coins}
          color="green"
        />
        <MetricCard
          title="Avg Cost per FNOL"
          value={`$${parseFloat(data.avg_cost_per_fnol).toFixed(4)}`}
          icon={TrendingUp}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Cost Trend (Last 7 Days)
          </h2>
          {data.cost_trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.cost_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  stroke="#6B7280"
                />
                <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '6px',
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cost']}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total_cost"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', r: 4 }}
                  name="Total Cost"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No cost data available
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Model Distribution
          </h2>
          {data.model_distribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.model_distribution}
                  dataKey="count"
                  nameKey="model_name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => entry.model_name}
                >
                  {data.model_distribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '6px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No model data available
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Model Usage Details
        </h2>
        {data.model_distribution.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.model_distribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="model_name"
                tick={{ fontSize: 12 }}
                stroke="#6B7280"
              />
              <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                }}
              />
              <Legend />
              <Bar
                dataKey="total_tokens"
                fill="#3B82F6"
                name="Total Tokens"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="count"
                fill="#10B981"
                name="Request Count"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            No model usage data available
          </div>
        )}
      </div>

      {data.model_distribution.length > 0 && (
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Model Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requests
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Tokens
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Tokens/Request
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.model_distribution.map((model, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Cpu className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">
                        {model.model_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {model.count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {model.total_tokens.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {Math.round(model.total_tokens / model.count).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
