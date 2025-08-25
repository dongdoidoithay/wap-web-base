/**
 * Example component demonstrating how to use the Story API Service and hooks
 * This can be used as a reference for implementing story data fetching in other components
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { useStories, useStaticStories } from '@/hooks/use-stories';
import { StoryListSkeleton } from '@/components/loading-skeleton';
import type { StoryItem } from '@/services/story-api.service';

// Example 1: Using the useStories hook for paginated latest stories
export function LatestStoriesExample() {
  const {
    stories,
    loading,
    error,
    currentPage,
    totalPages,
    hasNext,
    hasPrev,
    lastResponseTime,
    cacheStatus,
    fetchPage,
    refresh,
    nextPage,
    prevPage,
    testApiCall,
    getCacheInfo
  } = useStories({
    limit: 10,
    initialPage: 0,
    autoFetch: true,
    cacheEnabled: true
  });

  if (loading && stories.length === 0) {
    return <StoryListSkeleton count={10} />;
  }

  if (error) {
    return (
      <div className="p-4 border border-error rounded-lg bg-error/10">
        <p className="text-error">Error: {error}</p>
        <button 
          onClick={refresh}
          className="mt-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with performance info */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Latest Stories (Hook Example)</h2>
        <div className="flex items-center gap-2 text-sm">
          {lastResponseTime > 0 && (
            <span className={`px-2 py-1 rounded ${
              lastResponseTime < 1000 ? 'bg-success/20 text-success' :
              lastResponseTime < 3000 ? 'bg-warning/20 text-warning' :
              'bg-error/20 text-error'
            }`}>
              {lastResponseTime}ms
            </span>
          )}
          <span className={`px-2 py-1 rounded ${
            cacheStatus === 'HIT' ? 'bg-info/20 text-info' :
            cacheStatus === 'MISS' ? 'bg-warning/20 text-warning' :
            'bg-surface border text-muted'
          }`}>
            {cacheStatus === 'HIT' ? '📦 Cached' : 
             cacheStatus === 'MISS' ? '🌐 Fresh' : '❓ Unknown'}
          </span>
        </div>
      </div>

      {/* Story list */}
      <div className="space-y-3">
        {stories.map((story, index) => (
          <div key={story.idDoc || index} className="border rounded-lg p-3 hover:bg-surface/50">
            <Link href={story.url || `#${story.idDoc}`} className="block">
              <h3 className="font-semibold text-primary hover:text-primary-dark">
                {story.title}
              </h3>
              {story.sortDesc && (
                <p className="text-sm text-body-secondary mt-1 line-clamp-2">
                  {story.sortDesc}
                </p>
              )}
              <div className="flex items-center gap-4 mt-2 text-xs text-muted">
                {story.authName && <span>👤 {story.authName}</span>}
                {story.genresName && <span>📁 {story.genresName}</span>}
                {story.views && <span>👁️ {story.views.toLocaleString()}</span>}
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={prevPage}
            disabled={!hasPrev || loading}
            className="px-3 py-2 rounded bg-primary text-white disabled:bg-surface disabled:text-muted"
          >
            ← Previous
          </button>
          
          <span className="px-3 py-2 text-sm">
            Page {currentPage + 1} of {totalPages}
          </span>
          
          <button
            onClick={nextPage}
            disabled={!hasNext || loading}
            className="px-3 py-2 rounded bg-primary text-white disabled:bg-surface disabled:text-muted"
          >
            Next →
          </button>
        </div>
      )}

      {/* Debug controls (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 border border-light rounded bg-surface/50">
          <h4 className="text-sm font-medium mb-2">Debug Controls</h4>
          <div className="flex gap-2">
            <button
              onClick={refresh}
              className="px-2 py-1 text-xs bg-info text-white rounded hover:bg-info/90"
            >
              🔄 Refresh
            </button>
            <button
              onClick={testApiCall}
              className="px-2 py-1 text-xs bg-warning text-white rounded hover:bg-warning/90"
            >
              🧪 Test API
            </button>
            <button
              onClick={() => console.log('Cache info:', getCacheInfo())}
              className="px-2 py-1 text-xs bg-secondary text-white rounded hover:bg-secondary/90"
            >
              📊 Cache Info
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Example 2: Using the useStaticStories hook for top follow stories
export function TopFollowStoriesExample() {
  const {
    stories,
    loading,
    error,
    lastResponseTime,
    cacheStatus,
    refresh
  } = useStaticStories(
    '/api/stories/top-follow?limit=10',
    'top-follow-10',
    true
  );

  if (loading) {
    return <div className="text-center py-4">Loading top follow stories...</div>;
  }

  if (error) {
    return (
      <div className="p-4 border border-error rounded-lg">
        <p className="text-error">Error: {error}</p>
        <button onClick={refresh} className="mt-2 px-4 py-2 bg-primary text-white rounded">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Top Follow Stories</h2>
        <div className="text-xs text-muted">
          {lastResponseTime}ms • {cacheStatus}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stories.slice(0, 10).map((story, index) => (
          <Link
            key={story.idDoc || index}
            href={story.url || `#${story.idDoc}`}
            className="block p-3 border rounded-lg hover:bg-surface/50"
          >
            <h3 className="font-semibold text-sm line-clamp-2">{story.title}</h3>
            <div className="flex items-center justify-between mt-2 text-xs text-muted">
              <span>❤️ {story.follows?.toLocaleString() || 0}</span>
              {story.status && (
                <span className="px-2 py-1 rounded bg-primary/20 text-primary">
                  {story.status}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Example 3: Direct service usage (without hooks)
export function DirectServiceExample() {
  const [stories, setStories] = React.useState<StoryItem[]>([]);
  const [loading, setLoading] = React.useState(false);

  const fetchWithService = async () => {
    setLoading(true);
    try {
      // Import and use the service directly
      const { fetchLatestStories } = await import('@/services/story-api.service');
      const result = await fetchLatestStories(5, 0, false); // 5 stories, page 0, no cache
      
      if (result.success) {
        setStories(result.data);
        console.log('Service result:', result);
      } else {
        console.error('Service error:', result.message);
      }
    } catch (error) {
      console.error('Error using service:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Direct Service Example</h2>
        <button
          onClick={fetchWithService}
          disabled={loading}
          className="px-4 py-2 bg-primary text-white rounded disabled:bg-surface disabled:text-muted"
        >
          {loading ? 'Loading...' : 'Fetch with Service'}
        </button>
      </div>

      {stories.length > 0 && (
        <div className="space-y-2">
          {stories.map((story: StoryItem, index) => (
            <div key={story.idDoc || index} className="p-2 border rounded">
              <h4 className="font-medium">{story.title}</h4>
              <p className="text-sm text-muted">{story.authName}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Combined example component
export default function StoryServiceExamples() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">Story API Service Examples</h1>
      
      <div className="grid gap-8">
        <LatestStoriesExample />
        <TopFollowStoriesExample />
        <DirectServiceExample />
      </div>
      
      <div className="mt-8 p-4 bg-surface rounded-lg">
        <h3 className="font-semibold mb-2">Usage Summary</h3>
        <ul className="text-sm space-y-1 text-body-secondary">
          <li>• <strong>useStories hook:</strong> For paginated story lists with full state management</li>
          <li>• <strong>useStaticStories hook:</strong> For simple, non-paginated story lists</li>
          <li>• <strong>Direct service calls:</strong> For custom implementations or server-side usage</li>
          <li>• <strong>Built-in caching:</strong> Automatic performance optimization with cache status indicators</li>
          <li>• <strong>Error handling:</strong> Comprehensive error states and retry mechanisms</li>
        </ul>
      </div>
    </div>
  );
}