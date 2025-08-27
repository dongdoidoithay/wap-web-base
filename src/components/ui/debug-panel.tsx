'use client';

interface DebugPanelProps {
  hasInitialLoad: boolean;
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalItems: number;
  totalPages: number;
  latestStoriesCount: number;
  initialStoriesCount: number;
  topFollowCount: number;
  topDayCount: number;
  lastResponseTime: number;
  cacheStatus: string;
  onManualApiCall: () => void;
  onTestDirectApi: () => void;
  onClearCache?: () => void;
}

export function DebugPanel({
  hasInitialLoad,
  loading,
  error,
  currentPage,
  totalItems,
  totalPages,
  latestStoriesCount,
  initialStoriesCount,
  topFollowCount,
  topDayCount,
  lastResponseTime,
  cacheStatus,
  onManualApiCall,
  onTestDirectApi,
  onClearCache
}: DebugPanelProps) {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="mx-auto max-w-screen-sm px-3">
      <details className="bg-surface border border-light rounded-lg p-3">
        <summary className="cursor-pointer text-sm font-medium text-body-primary">
          🐛 Debug Info (Development Only)
        </summary>
        <div className="mt-2 text-xs text-muted space-y-1">
          <div>Has Initial Load: {hasInitialLoad ? 'Yes' : 'No'}</div>
          <div>Loading: {loading ? 'Yes' : 'No'}</div>
          <div>Error: {error || 'None'}</div>
          <div>Current Page: {currentPage}</div>
          <div>Total Items: {totalItems}</div>
          <div>Total Pages: {totalPages}</div>
          <div>Latest Stories Count: {latestStoriesCount}</div>
          <div>Initial Stories Count: {initialStoriesCount}</div>
          <div>Top Follow Count: {topFollowCount}</div>
          <div>Top Day Count: {topDayCount}</div>
          <div>Last Response Time: {lastResponseTime}ms</div>
          <div>Cache Status: <span className={`font-medium ${
            cacheStatus === 'HIT' ? 'text-success' : 
            cacheStatus === 'MISS' ? 'text-warning' : 
            cacheStatus === 'SERVER-SIDE' ? 'text-info' :
            cacheStatus === 'DISABLED' ? 'text-error' :
            'text-muted'
          }`}>{cacheStatus}</span></div>
          <button
            onClick={onManualApiCall}
            className="mt-2 px-2 py-1 bg-info text-white rounded text-xs hover:bg-info/90 mr-2"
          >
            🔄 Manual API Call
          </button>
          <button
            onClick={onTestDirectApi}
            className="mt-2 px-2 py-1 bg-warning text-white rounded text-xs hover:bg-warning/90 mr-2"
          >
            🧪 Test Direct API
          </button>
          {onClearCache && (
            <button
              onClick={onClearCache}
              className="mt-2 px-2 py-1 bg-error text-white rounded text-xs hover:bg-error/90"
            >
              🔄 Refresh Data
            </button>
          )}
        </div>
      </details>
    </div>
  );
}