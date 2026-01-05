import { FNOLStageExecution } from '../types';
import { StatusBadge } from './StatusBadge';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

interface TimelineProps {
  stages: FNOLStageExecution[];
}

export function Timeline({ stages }: TimelineProps) {
  const sortedStages = [...stages].sort(
    (a, b) =>
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  const getStageIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const formatDuration = (ms: number | null) => {
    if (!ms) return 'N/A';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {sortedStages.map((stage, idx) => (
          <li key={stage.id}>
            <div className="relative pb-8">
              {idx !== sortedStages.length - 1 && (
                <span
                  className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex items-start space-x-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
                    {getStageIcon(stage.status)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {stage.stage_name.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTime(stage.start_time)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-600">
                        {formatDuration(stage.duration_ms)}
                      </span>
                      <StatusBadge status={stage.status} size="sm" />
                    </div>
                  </div>
                  {stage.error_message && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm font-medium text-red-800">
                        Error: {stage.error_code || 'Unknown'}
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        {stage.error_message}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
