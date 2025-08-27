import React from 'react';

// Enhanced loading skeleton with better animations
export function LoadingSkeleton({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`animate-pulse space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-surface rounded-md w-3/4"></div>
          <div className="h-3 bg-surface rounded-md w-1/2"></div>
        </div>
      ))}
    </div>
  );
}

// Page loading state
export function PageLoadingState() {
  return (
    <div className="min-h-dvh bg-background text-body-primary flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <div className="text-muted">Đang tải dữ liệu...</div>
      </div>
    </div>
  );
}

// Error state component
export function ErrorState({ 
  title = 'Đã xảy ra lỗi', 
  message = 'Không thể tải dữ liệu. Vui lòng thử lại sau.',
  onRetry,
  showRetry = true 
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}) {
  return (
    <div className="text-center py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-4xl mb-4">😵</div>
        <h3 className="text-lg font-semibold text-error mb-2">{title}</h3>
        <p className="text-muted mb-4">{message}</p>
        {showRetry && onRetry && (
          <button 
            onClick={onRetry}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            🔄 Thử lại
          </button>
        )}
      </div>
    </div>
  );
}

// Empty state component
export function EmptyState({ 
  title = 'Không có dữ liệu',
  message = 'Chưa có nội dung để hiển thị.',
  icon = '📭'
}: {
  title?: string;
  message?: string;
  icon?: string;
}) {
  return (
    <div className="text-center py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-4xl mb-4">{icon}</div>
        <h3 className="text-lg font-semibold text-muted mb-2">{title}</h3>
        <p className="text-body-secondary">{message}</p>
      </div>
    </div>
  );
}

// Performance indicator component
export function PerformanceIndicator({ 
  responseTime, 
  cacheStatus 
}: { 
  responseTime: number; 
  cacheStatus: string; 
}) {
  const getResponseTimeColor = (time: number) => {
    if (time < 1000) return 'text-success bg-success/20';
    if (time < 3000) return 'text-warning bg-warning/20';
    return 'text-error bg-error/20';
  };

  const getCacheStatusColor = (status: string) => {
    if (status === 'HIT') return 'text-info bg-info/20';
    if (status === 'MISS') return 'text-warning bg-warning/20';
    return 'text-muted bg-surface';
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      {responseTime > 0 && (
        <span className={`px-2 py-1 rounded ${getResponseTimeColor(responseTime)}`}>
          ⚡ {responseTime}ms
        </span>
      )}
      <span className={`px-2 py-1 rounded ${getCacheStatusColor(cacheStatus)}`}>
        {cacheStatus === 'HIT' ? '📦 Cached' : 
         cacheStatus === 'MISS' ? '🌐 Fresh' : '❓ Unknown'}
      </span>
    </div>
  );
}

// Progressive loading component
export function ProgressiveLoader({ 
  isLoading,
  progress = 0,
  children,
  fallback
}: {
  isLoading: boolean;
  progress?: number;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  if (isLoading) {
    return (
      <div className="relative">
        {fallback || <LoadingSkeleton />}
        {progress > 0 && (
          <div className="absolute top-0 left-0 w-full h-1 bg-surface">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
}