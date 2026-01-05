interface StatusBadgeProps {
  status: 'SUCCESS' | 'FAILED' | 'PARTIAL' | 'SKIPPED';
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const statusConfig = {
    SUCCESS: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      label: 'Success',
    },
    FAILED: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      label: 'Failed',
    },
    PARTIAL: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      label: 'Partial',
    },
    SKIPPED: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      label: 'Skipped',
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${config.bg} ${config.text} ${sizeClasses[size]}`}
    >
      {config.label}
    </span>
  );
}
