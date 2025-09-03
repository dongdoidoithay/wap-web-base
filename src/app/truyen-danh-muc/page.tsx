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
import { fetchStoriesByMode } from '@/services/story-api.service';

// Types
import type { StoryItem } from '@/types';

// Genre Stories data structure
interface GenreStoriesData {
  stories: StoryItem[];
  total: number;
  totalPages: number;
  currentPage: number;
  loading: boolean;
  error: string | null;
  responseTime?: number;
  genreName?: string;
}

/**
 * Genre Stories Page Component
 * Features:
 * 1. Domain-based configuration loading
 * 2. Progressive data loading
 * 3. URL-based pagination support
 * 4. SEO optimization
 * 5. Error handling and loading states
 * 6. Search page styling consistency
 */
export default function MangaCatePage() {
  // ========================
  // 1. DOMAIN CONFIGURATION
  // ========================
  const domainConfig = useDomain();
  const isConfigLoading = !domainConfig;
  
  // ========================
  // 2. URL PARAMETERS
  // ========================
  const searchParams = useSearchParams();
  const genreId = searchParams.get('id') || '';
  const genreName = searchParams.get('name') || '';
  const pageParam = searchParams.get('page') || '1';
  const currentPage = Math.max(0, parseInt(pageParam, 10) - 1); // Convert to 0-based indexing

  // ========================
  // 3. STATE MANAGEMENT
  // ========================
  const [genreData, setGenreData] = useState<GenreStoriesData>({
    stories: [],
    total: 0,
    totalPages: 0,
    currentPage: 0,
    loading: false,
    error: null,
    genreName: genreName
  });
  
  // Abort controller for cancelling requests
  const abortControllerRef = useRef<AbortController | null>(null);

  // Constants
  const ITEMS_PER_PAGE = 22;

  // ========================
  // 4. DATA FETCHING
  // ========================
  
  const fetchGenreStoriesData = useCallback(async (page: number = 0) => {
    // Cancel any existing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    if (!genreId) {
      setGenreData(prev => ({
        ...prev,
        stories: [],
        total: 0,
        totalPages: 0,
        loading: false,
        error: 'Không tìm thấy thể loại'
      }));
      return;
    }
    
    console.log(`🔍 Fetching genre stories: genre ${genreId}, page ${page + 1}`);
    
    // Set loading state
    setGenreData(prev => ({
      ...prev,
      loading: true,
      error: null,
      currentPage: page
    }));
    
    try {
      const result = await fetchStoriesByMode('genres', genreId, ITEMS_PER_PAGE, page);
      
      if (result.success) {
        setGenreData(prev => ({
          ...prev,
          stories: result.data || [],
          total: result.total || 0,
          totalPages: result.totalPage || 0,
          loading: false,
          error: null,
          responseTime: result.responseTime,
          genreName: prev.genreName || genreName || (result.data.length > 0 ? result.data[0].genresName : '')
        }));
        
        console.log(`✅ Genre stories loaded: ${result.data?.length || 0} stories found`);
      } else {
        throw new Error(result.message || 'Failed to fetch genre stories');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('❌ Genre stories fetch error:', errorMessage);
      
      setGenreData(prev => ({
        ...prev,
        stories: [],
        total: 0,
        totalPages: 0,
        loading: false,
        error: errorMessage
      }));
    }
  }, [genreId, genreName]);

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
    fetchGenreStoriesData(newPage);
  }, [fetchGenreStoriesData]);

  const handleRefresh = useCallback(() => {
    // Use current state value without depending on it
    setGenreData(prev => {
      const refreshPage = prev.currentPage;
      // Call fetch with current page immediately
      setTimeout(() => fetchGenreStoriesData(refreshPage), 0);
      return prev;
    });
  }, [fetchGenreStoriesData]); // No dependencies to avoid cycles

  // ========================
  // 6. EFFECTS
  // ========================
  
  // Fetch data when genreId or pageParam changes
  useEffect(() => {
    if (genreId) {
      fetchGenreStoriesData(currentPage);
    }
  }, [genreId, currentPage, fetchGenreStoriesData]);

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
    if (!domainConfig || !genreData.genreName) {
      return {
        title: 'Truyện Theo Thể Loại...',
        description: 'Đang tải...',
        canonical: ''
      };
    }
    
    const title = `Truyện Thể Loại ${genreData.genreName} - ${domainConfig.name}`;
    const description = `Khám phá ${genreData.total > 0 ? genreData.total : ''} truyện thể loại ${genreData.genreName} trên ${domainConfig.name}. Đọc ngay những truyện mới nhất.`;
    const canonical = `https://${domainConfig.domain}/truyen-danh-muc?id=${genreId}`;
    
    return { title, description, canonical };
  }, [domainConfig, genreData.genreName, genreData.total, genreId]);

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
        noindex={!genreId}
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
                    📚 Truyện Theo Thể Loại
                  </h1>
                  {genreData.genreName && (
                    <h2 className="text-xl md:text-2xl font-semibold text-primary mb-2">
                      {genreData.genreName}
                    </h2>
                  )}
                  <p className="text-muted">
                    {genreData.total > 0 ? (
                      <>Khám phá <strong>{genreData.total}</strong> truyện{genreData.responseTime && <span className="text-xs"> ({genreData.responseTime}ms)</span>}</>
                    ) : genreData.loading ? (
                      'Đang tải danh sách truyện...'
                    ) : (
                      'Danh sách truyện theo thể loại'
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
                <span className="text-body-primary font-medium">Truyện theo thể loại</span>
                {genreData.genreName && (
                  <>
                    <span>›</span>
                    <span className="text-body-primary font-medium">{genreData.genreName}</span>
                  </>
                )}
              </nav>

              {/* GENRE STORIES CONTENT */}
              <div className="px-3">
                <ApiErrorBoundary>
                  {/* Status Message */}
                  <div className="mb-4 text-center">
                    {genreData.loading ? (
                      <p className="text-muted">
                        🔄 Đang tải truyện theo thể loại...
                      </p>
                    ) : genreData.error ? (
                      <p className="text-red-500">
                        ❌ Lỗi tải dữ liệu: {genreData.error}
                      </p>
                    ) : genreData.stories.length > 0 ? (
                      <p className="text-muted">
                        ✅ Hiển thị <strong>{genreData.stories.length}</strong> truyện (trang {genreData.currentPage + 1} / {genreData.totalPages})
                        {genreData.responseTime && (
                          <span className="text-xs"> ({genreData.responseTime}ms)</span>
                        )}
                      </p>
                    ) : (
                      <p className="text-muted">
                        📚 Không có truyện nào trong thể loại này
                      </p>
                    )}
                  </div>

                  {/* Stories Section */}
                  <StorySection
                    title={`📚 Danh sách truyện thể loại ${genreData.genreName || ''}`}
                    error={genreData.error}
                    actions={
                      genreData.stories.length > 0 ? (
                        <button
                          onClick={handleRefresh}
                          disabled={genreData.loading}
                          className="text-sm text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          🔄 Làm mới
                        </button>
                      ) : null
                    }
                  >
                    {genreData.loading && (
                      <StoryListSkeleton count={ITEMS_PER_PAGE} />
                    )}
                    
                    {!genreData.loading && genreData.stories.length > 0 && (
                      <>
                        <StoryList
                          stories={genreData.stories}
                          showImages={true}
                          loading={false}
                        />
                        
                        {genreData.totalPages > 1 && (
                          <Pagination
                            currentPage={genreData.currentPage}
                            totalPages={genreData.totalPages}
                            loading={genreData.loading}
                            onPageChange={handlePageChange}
                          />
                        )}
                      </>
                    )}

                    {!genreData.loading && genreData.stories.length === 0 && !genreData.error && (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">😔</div>
                        <h3 className="text-lg font-medium text-body-primary mb-2">
                          Không tìm thấy truyện trong thể loại này
                        </h3>
                        <p className="text-muted mb-6">
                          Hãy kiểm tra lại thông tin thể loại hoặc thử tìm kiếm với từ khóa khác
                        </p>
                        <div className="space-y-2 text-sm text-muted">
                          <p>💡 <strong>Gợi ý:</strong></p>
                          <ul className="list-disc list-inside space-y-1 text-left max-w-md mx-auto">
                            <li>Thử làm mới trang để tải lại dữ liệu</li>
                            <li>Kiểm tra kết nối mạng của bạn</li>
                            <li>Sử dụng chức năng tìm kiếm để tìm thể loại</li>
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
      {genreData.loading && (
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