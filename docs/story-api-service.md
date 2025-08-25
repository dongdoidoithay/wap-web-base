# Story API Service Architecture

This document describes the separated API data handling and caching architecture implemented for the WAP Web Base project.

## 📁 File Structure

```
src/
├── services/
│   └── story-api.service.ts          # Core API service with caching
├── hooks/
│   └── use-stories.ts                # React hooks for components
├── components/
│   ├── examples/
│   │   └── story-service-examples.tsx # Usage examples
│   └── api-data-handler.tsx          # Updated to use service
└── app/
    └── page.tsx                      # Updated to use service
```

## 🏗️ Architecture Overview

### 1. Core Service Layer (`story-api.service.ts`)

**Purpose:** Centralized API data handling with built-in caching and performance optimization.

**Key Features:**
- ✅ In-memory LRU-style caching
- ✅ Automatic response time tracking
- ✅ Enhanced fetch with timeout and compression
- ✅ Configurable cache TTL per endpoint
- ✅ Data transformation and mapping
- ✅ Error handling and retry logic
- ✅ Cache management utilities

**Main Functions:**
```typescript
// Server-side API calls (for SSR/SSG)
fetchLatestStories(limit, page, useCache)
fetchTopFollowStories(limit, page, useCache)
fetchTopDayStories(limit, useCache)

// Client-side API calls
clientApiCall(endpoint, cacheKey, useCache)

// Cache management
clearCache()
getCacheStats()
invalidateCache(pattern)
```

### 2. React Hooks Layer (`use-stories.ts`)

**Purpose:** React-specific data management with state and lifecycle integration.

**Key Features:**
- ✅ Automatic pagination management
- ✅ URL synchronization
- ✅ Loading and error states
- ✅ Performance metrics tracking
- ✅ Cache control from components

**Main Hooks:**
```typescript
// For paginated story lists
useStories({
  limit: 22,
  initialPage: 0,
  autoFetch: true,
  cacheEnabled: true
})

// For static story lists
useStaticStories(endpoint, cacheKey, autoFetch)
```

### 3. Component Integration

Components can now use the service in three ways:

1. **React Hooks (Recommended)**
2. **Direct Service Calls**
3. **Updated ApiDataHandler Component**

## 🚀 Usage Examples

### Example 1: Using Hooks (Recommended)

```tsx
import { useStories } from '@/hooks/use-stories';

function StoriesComponent() {
  const {
    stories,
    loading,
    error,
    currentPage,
    totalPages,
    hasNext,
    hasPrev,
    nextPage,
    prevPage,
    refresh
  } = useStories({
    limit: 20,
    initialPage: 0,
    autoFetch: true
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {stories.map(story => (
        <div key={story.idDoc}>{story.title}</div>
      ))}
      
      <button onClick={prevPage} disabled={!hasPrev}>
        Previous
      </button>
      <span>Page {currentPage + 1} of {totalPages}</span>
      <button onClick={nextPage} disabled={!hasNext}>
        Next
      </button>
    </div>
  );
}
```

### Example 2: Direct Service Usage

```tsx
import { fetchLatestStories } from '@/services/story-api.service';

// Server-side (SSR/SSG)
export async function getServerSideProps() {
  const result = await fetchLatestStories(22, 0, true);
  
  return {
    props: {
      stories: result.data,
      total: result.total
    }
  };
}

// Client-side
async function loadStories() {
  const result = await fetchLatestStories(10, 0, false);
  if (result.success) {
    setStories(result.data);
  }
}
```

### Example 3: Cache Management

```tsx
import { clearCache, getCacheStats } from '@/services/story-api.service';

function AdminPanel() {
  const handleClearCache = () => {
    clearCache();
    console.log('Cache cleared');
  };

  const handleCacheStats = () => {
    const stats = getCacheStats();
    console.log('Cache stats:', stats);
  };

  return (
    <div>
      <button onClick={handleClearCache}>Clear Cache</button>
      <button onClick={handleCacheStats}>Show Cache Stats</button>
    </div>
  );
}
```

## ⚡ Performance Features

### Caching Strategy
- **Latest Stories:** 5 minutes TTL
- **Top Follow Stories:** 10 minutes TTL
- **Top Day Stories:** 1 hour TTL
- **LRU Cleanup:** Max 50 cache entries

### Performance Monitoring
- Response time tracking
- Cache hit/miss indicators
- Performance badges in development mode
- Debug logging with timestamps

### Network Optimization
- HTTP keep-alive connections
- Compression headers (gzip, deflate, br)
- 3-second request timeout
- AbortController for proper cancellation

## 🔧 Configuration

### API Configuration
```typescript
const API_CONFIG = {
  baseUrl: 'http://localhost:9000/api/six-vn',
  timeout: 3000,
  defaultHeaders: {
    'Content-Type': 'application/json',
  },
  cache: {
    enabled: true,
    defaultTtl: 300000, // 5 minutes
    maxEntries: 50,
  },
};
```

### Updating Configuration
```typescript
import { updateApiConfig } from '@/services/story-api.service';

updateApiConfig({
  timeout: 5000,
  cache: {
    enabled: false
  }
});
```

## 🐛 Debugging

### Development Debug Panel
The service includes comprehensive debugging tools:

- Response time indicators
- Cache status badges
- Manual API call testing
- Cache statistics
- Direct API testing

### Debug Logging
All API calls are logged with:
- Request URL and parameters
- Response time and status
- Cache hit/miss information
- Error details and stack traces

## 🔄 Migration Guide

### From Old Implementation

**Before:**
```tsx
// Direct fetch calls in components
const response = await fetch('/api/stories/latest');
const data = await response.json();
```

**After:**
```tsx
// Using hooks
const { stories, loading, error } = useStories();

// Or direct service
import { fetchLatestStories } from '@/services/story-api.service';
const result = await fetchLatestStories(22, 0);
```

### Breaking Changes
- `StoryItem` interface updated (id → idDoc)
- API response structure standardized
- Component props may need updating

## 🧪 Testing

### Manual Testing
```tsx
import { testApiCall } from '@/hooks/use-stories';

// Test API endpoint
await testApiCall();
```

### Performance Testing
- Monitor response times in debug panel
- Check cache hit rates
- Verify TTL behavior

## 📈 Benefits

1. **Code Organization:** Separated concerns between data fetching and UI
2. **Performance:** Built-in caching reduces API calls
3. **Reusability:** Hooks can be used across multiple components
4. **Maintainability:** Centralized API logic is easier to update
5. **Developer Experience:** Comprehensive debugging and monitoring tools
6. **Type Safety:** Full TypeScript support with proper interfaces
7. **Error Handling:** Consistent error states and retry mechanisms

## 🔮 Future Enhancements

- [ ] Redis cache integration for production
- [ ] Optimistic updates for better UX
- [ ] Background refresh capabilities
- [ ] GraphQL integration support
- [ ] Request deduplication
- [ ] Offline support with IndexedDB
- [ ] Real-time updates with WebSockets

## 📞 Support

For questions or issues with the Story API Service:

1. Check the debug panel for detailed error information
2. Review console logs for API call traces
3. Use the test API functionality to isolate issues
4. Verify cache statistics for performance problems

---

*This architecture follows the project's memory knowledge requirements for API performance optimization and comprehensive data handling.*