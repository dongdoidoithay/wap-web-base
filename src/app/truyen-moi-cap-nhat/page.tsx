'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { SEOHead } from '@/components/seo-head';
import { useDomain } from '@/hooks/use-domain';
import { StoryListSkeleton } from '@/components/loading-skeleton';
import { ApiErrorBoundary } from '@/components/api-error-boundary';

// UI Components
import { 
  Header, 
  FooterNav,
  StorySection,
  StoryList,
  Pagination
} from '@/components/ui';

// Services
import { fetchLatestStories } from '@/services/story-api.service';

// Types
import type { StoryItem } from '@/types';

// Latest Stories data structure
interface LatestStoriesData {
  stories: StoryItem[];
  total: number;
  totalPages: number;
  currentPage: number;
  loading: boolean;
  error: string | null;
  responseTime?: number;
}

/**
 * Latest Updated Stories Page Component
 * Features:
 * 1. Domain-based configuration loading
 * 2. Progressive data loading
 * 3. URL-based pagination support
 * 4. SEO optimization
 * 5. Error handling and loading states
 * 6. Search page styling consistency
 */
export default function LatestStoriesPage() {
  // ========================
  // 1. DOMAIN CONFIGURATION
  // ========================
  const domainConfig = useDomain();
  const isConfigLoading = !domainConfig;
  
  // ========================
  // 2. URL PARAMETERS
  // ========================
  const searchParams = useSearchParams();
  const pageParam = searchParams.get('page') || '1';
  const currentPage = Math.max(0, parseInt(pageParam, 10) - 1); // Convert to 0-based indexing

  // ========================
  // 3. STATE MANAGEMENT
  // ========================
  const [latestData, setLatestData] = useState<LatestStoriesData>({
    stories: [],
    total: 0,
    totalPages: 0,
    currentPage: 0,
    loading: false,
    error: null
  });
  
  // Abort controller for cancelling requests
  const abortControllerRef = useRef<AbortController | null>(null);

  // Constants
  const ITEMS_PER_PAGE = 22;

  // ========================
  // 4. DATA FETCHING
  // ========================
  
  const fetchLatestStoriesData = useCallback(async (page: number = 0) => {
    // Cancel any existing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    console.log(`🔍 Fetching latest stories: page ${page + 1}`);
    
    // Set loading state
    setLatestData(prev => ({
      ...prev,
      loading: true,
      error: null,
      currentPage: page
    }));
    
    try {
      const result = await fetchLatestStories(ITEMS_PER_PAGE, page);
      
      if (result.success) {
        setLatestData(prev => ({
          ...prev,
          stories: result.data || [],
          total: result.total || 0,
          totalPages: result.totalPage || 0,
          loading: false,
          error: null,
          responseTime: result.responseTime
        }));
        
        console.log(`✅ Latest stories loaded: ${result.data?.length || 0} stories found`);
      } else {
        throw new Error(result.message || 'Failed to fetch latest stories');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('❌ Latest stories fetch error:', errorMessage);
      
      setLatestData(prev => ({
        ...prev,
        stories: [],
        total: 0,
        totalPages: 0,
        loading: false,
        error: errorMessage
      }));
    }
  }, []);

  // ========================
  // 5. EVENT HANDLERS
  // ========================
  
  const handlePageChange = useCallback((newPage: number) => {
    // Update URL with new page
    const url = new URL(window.location.href);
    url.searchParams.set('page', (newPage + 1).toString());
    window.history.pushState({}, '', url.toString());
    
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Fetch new page data
    fetchLatestStoriesData(newPage);
  }, []);

  const handleRefresh = useCallback(() => {
    // Use current state value without depending on it
    setLatestData(prev => {
      const refreshPage = prev.currentPage;
      // Call fetch with current page immediately
      setTimeout(() => fetchLatestStoriesData(refreshPage), 0);
      return prev;
    });
  }, []); // No dependencies to avoid cycles

  // ========================
  // 6. EFFECTS
  // ========================
  
  // Stable initialization - fetch initial data when domain config is ready
  useEffect(() => {
    fetchLatestStoriesData(currentPage);
    /* if (domainConfig && !isConfigLoading) {
      // Use setTimeout to avoid direct state updates during render
      const timeoutId = setTimeout(() => {
        fetchLatestStoriesData(currentPage);
      }, 0);
      
      return () => clearTimeout(timeoutId);
    } */
  }, [pageParam]); // Safe dependencies

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // ========================
  // 7. SEO DATA
  // ========================
  
  const seoData = React.useMemo(() => {
    if (!domainConfig) {
      return {
        title: 'Truyện Mới Cập Nhật...',
        description: 'Đang tải...',
        canonical: ''
      };
    }
    
    const title = `Truyện Mới Cập Nhật - ${domainConfig.name}`;
    const description = `Khám phá ${latestData.total > 0 ? latestData.total : ''} truyện mới cập nhật trên ${domainConfig.name}. Đọc ngay những chương mới nhất của các bộ truyện hot.`;
    const canonical = `https://${domainConfig.domain}/truyen-moi-cap-nhat`;
    
    return { title, description, canonical };
  }, [domainConfig, latestData.total]);

  // ========================
  // 8. LOADING STATE
  // ========================
  
  if (isConfigLoading || !domainConfig) {
    return (
      <div className="min-h-dvh bg-background text-body-primary flex items-center justify-center">
        <div className="text-center">
          <div className="text-muted">Đang tải cấu hình...</div>
        </div>
      </div>
    );
  }

  // ========================
  // 9. RENDER
  // ========================
  
  return (
    <>
      {/* SEO HEAD */}
      <SEOHead 
        title={seoData.title}
        description={seoData.description}
        canonical={seoData.canonical}
      />
      
      <div className="min-h-dvh bg-background text-body-primary">
        {/* HEADER */}
        <Header config={domainConfig} />
        
        <main>
          <div className="container mx-auto px-4 py-6 max-w-4xl pb-24">
              {/* PAGE HEADER */}
              <div className="mx-auto max-w-screen-sm px-3 pt-6 pb-4">
                <div className="text-center">
                  <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">
                    🔥 Truyện Mới Cập Nhật
                  </h1>
                  <p className="text-muted">
                    {latestData.total > 0 ? (
                      <>Khám phá <strong>{latestData.total}</strong> truyện mới cập nhật{latestData.responseTime && <span className="text-xs"> ({latestData.responseTime}ms)</span>}</>
                    ) : latestData.loading ? (
                      'Đang tải danh sách truyện...'
                    ) : (
                      'Danh sách truyện mới cập nhật'
                    )}
                  </p>
                </div>
              </div>

              {/* BREADCRUMB */}
              <nav className="mx-auto max-w-screen-sm px-3 py-3 space-x-2 text-sm text-muted">
                <Link href="/" className="hover:text-primary transition-colors">
                  Trang chủ
                </Link>
                <span>›</span>
                <span className="text-body-primary font-medium">Truyện mới cập nhật</span>
              </nav>

              {/* LATEST STORIES CONTENT */}
              <div className="px-3">
                <ApiErrorBoundary>
                  {/* Status Message */}
                  <div className="mb-4 text-center">
                    {latestData.loading ? (
                      <p className="text-muted">
                        🔄 Đang tải truyện mới cập nhật...
                      </p>
                    ) : latestData.error ? (
                      <p className="text-red-500">
                        ❌ Lỗi tải dữ liệu: {latestData.error}
                      </p>
                    ) : latestData.stories.length > 0 ? (
                      <p className="text-muted">
                        ✅ Hiển thị <strong>{latestData.stories.length}</strong> truyện (trang {latestData.currentPage + 1} / {latestData.totalPages})
                        {latestData.responseTime && (
                          <span className="text-xs"> ({latestData.responseTime}ms)</span>
                        )}
                      </p>
                    ) : (
                      <p className="text-muted">
                        📚 Không có truyện nào
                      </p>
                    )}
                  </div>

                  {/* Stories Section */}
                  <StorySection
                    title={`📚 Danh sách truyện mới cập nhật`}
                    error={latestData.error}
                    actions={
                      latestData.stories.length > 0 ? (
                        <button
                          onClick={handleRefresh}
                          disabled={latestData.loading}
                          className="text-sm text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          🔄 Làm mới
                        </button>
                      ) : null
                    }
                  >
                    {latestData.loading && (
                      <StoryListSkeleton count={ITEMS_PER_PAGE} />
                    )}
                    
                    {!latestData.loading && latestData.stories.length > 0 && (
                      <>
                        <StoryList
                          stories={latestData.stories}
                          showImages={true}
                          loading={false}
                        />
                        
                        {latestData.totalPages > 1 && (
                          <Pagination
                            currentPage={latestData.currentPage}
                            totalPages={latestData.totalPages}
                            loading={latestData.loading}
                            onPageChange={handlePageChange}
                          />
                        )}
                      </>
                    )}

                    {!latestData.loading && latestData.stories.length === 0 && !latestData.error && (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">😔</div>
                        <h3 className="text-lg font-medium text-body-primary mb-2">
                          Chưa có truyện mới cập nhật
                        </h3>
                        <p className="text-muted mb-6">
                          Hãy quay lại sau để xem những truyện mới nhất
                        </p>
                        <div className="space-y-2 text-sm text-muted">
                          <p>💡 <strong>Gợi ý:</strong></p>
                          <ul className="list-disc list-inside space-y-1 text-left max-w-md mx-auto">
                            <li>Thử làm mới trang để tải lại dữ liệu</li>
                            <li>Kiểm tra kết nối mạng của bạn</li>
                            <li>Quay lại sau để xem cập nhật mới</li>
                          </ul>
                        </div>
                        
                        <div className="mt-8">
                          <Link 
                            href="/" 
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                          >
                            🏠 Về trang chủ
                          </Link>
                        </div>
                      </div>
                    )}
                  </StorySection>
                </ApiErrorBoundary>
              </div>
          </div>
        </main>
        
        {/* FOOTER */}
        <FooterNav />
      </div>

      {/* Loading indicator for ongoing fetches */}
      {latestData.loading && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Đang tải truyện...</span>
          </div>
        </div>
      )}
    </>
  );
}