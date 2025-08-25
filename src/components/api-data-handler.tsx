'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { StoryListSkeleton } from '@/components/loading-skeleton';
import { 
  StoryItem, 
  ApiResponse,
  clientApiCall
} from '@/services/story-api.service';

interface ApiDataHandlerProps {
  initialLatestStories: StoryItem[];
  initialTopFollow: StoryItem[];
  initialTopDay: StoryItem[];
  initialPage: number;
  initialTotal: number;
}

export function ApiDataHandler({
  initialLatestStories,
  initialTopFollow,
  initialTopDay,
  initialPage,
  initialTotal
}: ApiDataHandlerProps) {
  const [latestStories, setLatestStories] = useState<StoryItem[]>(initialLatestStories);
  const [topFollowStories, setTopFollowStories] = useState<StoryItem[]>(initialTopFollow);
  const [topDayStories, setTopDayStories] = useState<StoryItem[]>(initialTopDay);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalItems, setTotalItems] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const [showImages, setShowImages] = useState(false); // Images hidden by default
  const [lastResponseTime, setLastResponseTime] = useState<number>(0);
  const [cacheStatus, setCacheStatus] = useState<string>('');

  const itemsPerPage = 22;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Fetch data from API using the service
  const fetchApiData = async (page: number = 0, isInitial: boolean = false) => {
    if (loading && !isInitial) return;

    setLoading(true);
    setError(null);
    const startTime = Date.now();

    // Debug logging
    console.log(`[ApiDataHandler] Fetching page ${page}, isInitial: ${isInitial}`);

    try {
      // Use the service's clientApiCall function
      const apiUrl = `/api/stories/latest?limit=${itemsPerPage}&page=${page}`;
      console.log(`[ApiDataHandler] Calling API: ${apiUrl}`);
      
      const latestResult = await clientApiCall<StoryItem>(apiUrl, `latest-${itemsPerPage}-${page}`, true);
      
      setLastResponseTime(latestResult.responseTime || 0);
      setCacheStatus(latestResult.cacheStatus || 'UNKNOWN');
      
      console.log(`[ApiDataHandler] API Response status: ${latestResult.success}, Time: ${latestResult.responseTime}ms, Cache: ${latestResult.cacheStatus}`);
      
      if (latestResult.success !== false) { // Allow undefined success field
        setLatestStories(latestResult.data || []);
        setTotalItems(latestResult.total || latestResult.data?.length || 0);
        setCurrentPage(page);
        
        console.log(`[ApiDataHandler] Updated state - stories: ${latestResult.data?.length || 0}, total: ${latestResult.total || 0}`);
        
        // Update URL without page reload for non-initial loads
        if (!isInitial && typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          if (page === 0) {
            url.searchParams.delete('page');
          } else {
            url.searchParams.set('page', page.toString());
          }
          window.history.pushState({}, '', url.toString());
        }
      } else {
        throw new Error(latestResult.message || 'API returned error');
      }

    } catch (err) {
      console.error('[ApiDataHandler] Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      
      // Fallback to initial data if available
      if (isInitial && initialLatestStories.length > 0) {
        console.log(`[ApiDataHandler] Falling back to initial data: ${initialLatestStories.length} items`);
        setLatestStories(initialLatestStories);
      }
    } finally {
      setLoading(false);
      if (isInitial) {
        setHasInitialLoad(true);
      }
    }
  };

  // Initial API call on component mount
  useEffect(() => {
    console.log('[ApiDataHandler] Component mounted', {
      hasInitialLoad,
      initialStoriesLength: initialLatestStories.length,
      initialTotal,
      isDevelopment: process.env.NODE_ENV === 'development'
    });
    
    // Make API call if:
    // 1. Haven't loaded yet AND
    // 2. (No initial data OR in development mode OR initial total is 0)
    if (!hasInitialLoad && 
        (initialLatestStories.length === 0 || 
         initialTotal === 0 || 
         process.env.NODE_ENV === 'development')) {
      console.log('[ApiDataHandler] Making initial API call');
      fetchApiData(initialPage, true);
    } else {
      console.log('[ApiDataHandler] Using initial data, skipping API call');
      setHasInitialLoad(true);
    }
  }, []); // Empty dependency array to run only once on mount

  // Function to test direct API call using service
  const testDirectApiCall = async () => {
    console.log('[Debug] Testing direct API call');
    try {
      const result = await clientApiCall<StoryItem>('/api/stories/latest?limit=5&page=0', 'test-call', false);
      console.log('[Debug] Direct API response:', result);
      alert(`Direct API test result: ${result.success ? 'Success' : 'Failed'}\nData count: ${result.data?.length || 0}\nCache: ${result.cacheStatus}\nTime: ${result.responseTime}ms\nError: ${result.message || 'None'}`);
    } catch (error) {
      console.error('[Debug] Direct API test error:', error);
      alert(`Direct API test failed: ${error}`);
    }
  };

  // Function to refresh all data
  const refreshData = async () => {
    await fetchApiData(currentPage, false);
  };

  // Client-side API call for pagination
  const loadPage = async (page: number) => {
    if (loading || page < 0 || page >= totalPages) return;
    await fetchApiData(page, false);
  };

  return (
    <div className="space-y-6">
      {/* Development Debug Panel */}
      {process.env.NODE_ENV === 'development' && (
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
              <div>Latest Stories Count: {latestStories.length}</div>
              <div>Initial Stories Count: {initialLatestStories.length}</div>
              <div>Top Follow Count: {topFollowStories.length}</div>
              <div>Top Day Count: {topDayStories.length}</div>
              <div>Last Response Time: {lastResponseTime}ms</div>
              <div>Cache Status: <span className={`font-medium ${
                cacheStatus === 'HIT' ? 'text-success' : 
                cacheStatus === 'MISS' ? 'text-warning' : 'text-muted'
              }`}>{cacheStatus}</span></div>
              <button
                onClick={() => {
                  console.log('[Debug] Manual API call triggered');
                  fetchApiData(currentPage, false);
                }}
                className="mt-2 px-2 py-1 bg-info text-white rounded text-xs hover:bg-info/90 mr-2"
              >
                🔄 Manual API Call
              </button>
              <button
                onClick={testDirectApiCall}
                className="mt-2 px-2 py-1 bg-warning text-white rounded text-xs hover:bg-warning/90"
              >
                🧪 Test Direct API
              </button>
            </div>
          </details>
        </div>
      )}
      {/* Latest Stories Section */}
      <section className="mx-auto max-w-screen-sm px-3 py-3">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-body-primary">🔥 Truyện Mới Cập Nhật</h2>
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
                'bg-surface border border-light text-muted'
              }`}>
                {cacheStatus === 'HIT' ? '📦 Cache' : cacheStatus === 'MISS' ? '🌐 Fresh' : '❓ Unknown'}
              </span>
            )}
            <button
              onClick={() => setShowImages(!showImages)}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                showImages 
                  ? 'bg-info text-white hover:bg-info/90'
                  : 'bg-surface border border-light text-body-secondary hover:bg-primary/10'
              }`}
              title={showImages ? 'Ẩn ảnh' : 'Hiện ảnh'}
            >
              {showImages ? '🖼️ Ẩn ảnh' : '📝 Hiện ảnh'}
            </button>
            <button
              onClick={refreshData}
              disabled={loading}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                loading 
                  ? 'bg-surface border border-light text-muted cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary/90'
              }`}
              title="Làm mới dữ liệu"
            >
              {loading ? '🔄 Đang tải...' : '🔄 Làm mới'}
            </button>
          </div>
        </div>
        
        {error && (
          <div className="mb-4 p-3 rounded-md bg-error/10 text-error border border-error/20">
            <p className="text-sm">Lỗi: {error}</p>
          </div>
        )}
        
        {loading && (
          <StoryListSkeleton count={itemsPerPage} />
        )}
        
        {!loading && latestStories.length === 0 && !error && (
          <p className="text-muted text-center py-8">Không có dữ liệu</p>
        )}

        {!loading && latestStories.length > 0 && (
          <>
            <div className="border border-success rounded-lg overflow-hidden bg-surface">
              {latestStories.map((story, index) => (
                <div key={story.idDoc || index} className={`${index > 0 ? 'border-t border-light' : ''}`}>
                  <Link
                    href={story.url || story.slug || `#${story.idDoc}`}
                    className={`block p-3 hover:bg-primary/5 transition-colors ${
                      showImages ? 'flex gap-3' : ''
                    }`}
                  >
                    {showImages && (story.image || story.thumbnail) && (
                      <div className="flex-shrink-0">
                        <img
                          src={story.image || story.thumbnail}
                          alt={story.title}
                          loading="lazy"
                          className="h-20 w-28 rounded-lg object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/images/placeholder.jpg';
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-primary hover:text-primary-dark line-clamp-2 flex-1">
                          {story.title}
                        </h3>
                        {story.date && (
                          <time className="text-xs text-muted flex-shrink-0" dateTime={story.updatedAt}>
                            {new Date(story.date).toLocaleDateString("vi-VN")}
                          </time>
                        )}
                      </div>
                     
                      {story.sortDesc && (
                        <p className="mt-1 text-sm text-body-secondary line-clamp-1">
                          {story.sortDesc}
                        </p>
                      )}
                      
                      <div className="mt-2 flex items-center gap-4 text-xs text-muted">
                        {story.auth && (
                          <span className="flex items-center gap-1">
                            <span>👤</span>
                            <span>{story.authName}</span>
                          </span>
                        )}
                        {story.genres && (
                          <span className="flex items-center gap-1">
                            <span>📁</span>
                            <span>{story.genresName}</span>
                          </span>
                        )}
                        {story.chapters && (
                          <span className="flex items-center gap-1">
                            <span>📖</span>
                            <span>{story.chapters} chương</span>
                          </span>
                        )}
                        {story.views && (
                          <span className="flex items-center gap-1">
                            <span>👁️</span>
                            <span>{story.views.toLocaleString()}</span>
                          </span>
                        )}
                      </div>
                      
                      {story.lastChapter && (
                        <div className="mt-1 text-xs text-success">
                          <span className="inline-flex items-center gap-1">
                            <span>🆕</span>
                            <span>Chương mới: {story.lastChapter}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  onClick={() => loadPage(currentPage - 1)}
                  disabled={loading || currentPage <= 0}
                  className={`px-3 py-2 rounded-md text-sm transition-colors ${
                    currentPage > 0 && !loading
                      ? 'bg-primary text-white hover:bg-primary/90' 
                      : 'bg-surface border border-light text-muted cursor-not-allowed'
                  }`}
                >
                  ← Trước
                </button>
                
                <span className="px-3 py-2 text-sm text-body-secondary">
                  Trang {currentPage + 1} / {totalPages}
                </span>
                
                <button
                  onClick={() => loadPage(currentPage + 1)}
                  disabled={loading || currentPage >= totalPages - 1}
                  className={`px-3 py-2 rounded-md text-sm transition-colors ${
                    currentPage < totalPages - 1 && !loading
                      ? 'bg-primary text-white hover:bg-primary/90' 
                      : 'bg-surface border border-light text-muted cursor-not-allowed'
                  }`}
                >
                  Tiếp →
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Top Follow Stories */}
      {topFollowStories.length > 0 && (
        <section className="mx-auto max-w-screen-sm px-3 py-3">
          <h2 className="text-lg font-semibold mb-4 text-body-primary">🏆 Top Truyện Được Theo Dõi Nhiều</h2>
          
          <div className="grid grid-cols-2 gap-3">
            {topFollowStories.slice(0, 10).map((story, index) => (
              <Link
                key={story.idDoc || index}
                href={story.url || story.slug || `#${story.idDoc}`}
                className="block rounded-xl border border-light bg-surface p-3 shadow-sm hover:bg-primary/5 transition-colors"
              >
                {story.image || story.thumbnail ? (
                  <img
                    src={story.image || story.thumbnail}
                    alt={story.title}
                    loading="lazy"
                    className="w-full h-24 rounded-lg object-cover mb-2"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/placeholder.jpg';
                    }}
                  />
                ) : (
                  <div className="w-full h-24 rounded-lg bg-surface border border-light flex items-center justify-center mb-2">
                    <span className="text-muted">📚</span>
                  </div>
                )}
                
                <h3 className="text-sm font-semibold line-clamp-2 text-body-primary mb-1">
                  {story.title}
                </h3>
                
                <div className="flex items-center justify-between text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <span>❤️</span>
                    <span>{story.follows?.toLocaleString() || '0'}</span>
                  </span>
                  {story.status && (
                    <span className={`px-2 py-1 rounded text-xs ${
                      story.status.toLowerCase().includes('hoàn') 
                        ? 'bg-success/20 text-success' 
                        : 'bg-warning/20 text-warning'
                    }`}>
                      {story.status}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Top Day Stories */}
      {topDayStories.length > 0 && (
        <section className="mx-auto max-w-screen-sm px-3 py-3">
          <h2 className="text-lg font-semibold mb-4 text-body-primary">🔥 Top Xem Trong Ngày</h2>
          
          <div className="space-y-2">
            {topDayStories.slice(0, 15).map((story, index) => (
              <Link
                key={story.idDoc || index}
                href={story.url || story.slug || `#${story.idDoc}`}
                className="flex items-center gap-3 rounded-xl border border-light bg-surface p-3 shadow-sm hover:bg-primary/5 transition-colors"
              >
                <div className="flex-shrink-0">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                    index < 3 ? 'bg-warning text-white' : 'bg-surface border border-light text-body-secondary'
                  }`}>
                    {index + 1}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold line-clamp-1 text-body-primary">
                    {story.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted">
                    {story.views && (
                      <span className="flex items-center gap-1">
                        <span>👁️</span>
                        <span>{story.views.toLocaleString()}</span>
                      </span>
                    )}
                    {story.genres && <span>📁 {story.genresName}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}