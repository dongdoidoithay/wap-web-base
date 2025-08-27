'use client';

interface PerformanceIndicatorsProps {
  lastResponseTime: number;
  cacheStatus: string;
}

export function PerformanceIndicators({
  lastResponseTime,
  cacheStatus
}: PerformanceIndicatorsProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Performance indicator */}
      {lastResponseTime > 0 && (
        <span className={`px-2 py-1 rounded text-xs ${
          lastResponseTime < 1000 ? 'bg-success/20 text-success' :
          lastResponseTime < 3000 ? 'bg-warning/20 text-warning' :
          'bg-error/20 text-error'
        }`}>
          {lastResponseTime}ms
        </span>
      )}
      {cacheStatus && (
        <span className={`px-2 py-1 rounded text-xs ${
          cacheStatus === 'HIT' ? 'bg-info/20 text-info' :
          cacheStatus === 'MISS' ? 'bg-warning/20 text-warning' :
          cacheStatus === 'SERVER-SIDE' ? 'bg-success/20 text-success' :
          'bg-surface border border-light text-muted'
        }`}>
          {cacheStatus === 'HIT' ? '📦 Cache' : 
           cacheStatus === 'MISS' ? '🌐 Fresh' : 
           cacheStatus === 'SERVER-SIDE' ? '⚡ Server' : 
           '❓ Unknown'}
        </span>
      )}
    </div>
  );
}