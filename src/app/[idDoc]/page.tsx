'use client';

import React, { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { SEOHead } from '@/components/seo-head';
import { useDomain } from '@/hooks/use-domain';
import { StoryListSkeleton } from '@/components/loading-skeleton';
import { ApiErrorBoundary } from '@/components/api-error-boundary';
import { Header, FooterNav } from '@/components/ui';
import { fetchStoryDetailDev as fetchStoryDetail } from '../../services/story-detail.service';
import type { StoryDetail } from '../../types';

interface StoryInfoPageProps {
  params: {
    idDoc: string;
  };
}

export default function StoryInfoPage({ params }: StoryInfoPageProps) {
  // ========================
  // 1. DOMAIN CONFIGURATION
  // ========================
  const domainConfig = useDomain();
  const isConfigLoading = !domainConfig;

  // ========================
  // 2. STATE MANAGEMENT
  // ========================
  const [state, setState] = useState({
    story: null as StoryDetail | null,
    loading: true,
    error: null as string | null,
    initialized: false,
  });

  // ========================
  // 3. DATA LOADING
  // ========================
  useEffect(() => {
    const loadStoryDetail = async () => {
      if (!params.idDoc || !domainConfig) return;

      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const result = await fetchStoryDetail(params.idDoc);
        
        if (result.success && result.data) {
          setState(prev => ({
            ...prev,
            story: result.data,
            loading: false,
            initialized: true,
            error: null
          }));
        } else {
          // Story not found
          notFound();
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load story';
        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage,
          initialized: true
        }));
      }
    };

    if (!isConfigLoading && domainConfig) {
      loadStoryDetail();
    }
  }, []);
  //params.idDoc, domainConfig, isConfigLoading
  // ========================
  // 4. LOADING STATE
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

  if (state.loading) {
    return (
      <>
        <SEOHead 
          title="Đang tải..."
          description="Đang tải thông tin truyện"
        />
        <div className="min-h-dvh bg-background text-body-primary">
          <Header config={domainConfig} />
          <main className="container mx-auto px-4 py-6">
            <StoryListSkeleton count={1} />
          </main>
          <FooterNav />
        </div>
      </>
    );
  }

  if (state.error || !state.story) {
    return (
      <>
        <SEOHead 
          title="Lỗi tải truyện"
          description="Không thể tải thông tin truyện"
        />
        <div className="min-h-dvh bg-background text-body-primary">
          <Header config={domainConfig} />
          <main className="container mx-auto px-4 py-6">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-primary mb-4">
                Không tìm thấy truyện
              </h1>
              <p className="text-muted mb-6">
                {state.error || 'Truyện không tồn tại hoặc đã bị xóa'}
              </p>
              <a 
                href="/" 
                className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Về trang chủ
              </a>
            </div>
          </main>
          <FooterNav />
        </div>
      </>
    );
  }

  const story = state.story;

  // ========================
  // 5. RENDER STORY INFO
  // ========================
  return (
    <>
      {/* SEO HEAD */}
      <SEOHead 
        title={`${story.name} | ${domainConfig.name}`}
        description={story.sortDesc || `Đọc truyện ${story.name} tại ${domainConfig.name}`}
        keywords={[story.name, story.authName || '', story.genresName || '', 'truyện', 'đọc truyện']}
        ogImage={story.image || story.thumbnail}
        canonical={`https://${domainConfig.domain}/${params.idDoc}`}
      />

      <div className="min-h-dvh bg-background text-body-primary">
        {/* HEADER */}
        <Header config={domainConfig} />

        <main>
          <ApiErrorBoundary>
            <div className="container mx-auto px-4 py-6">
              
              {/* BREADCRUMB */}
              <nav className="flex items-center space-x-2 text-sm text-muted mb-6">
                <a href="/" className="hover:text-primary transition-colors">Trang chủ</a>
                <span>›</span>
                <span className="text-body-primary font-medium">{story.name}</span>
              </nav>

              {/* STORY INFO */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                
                {/* STORY IMAGE */}
                <div className="lg:col-span-1">
                  <div className="relative aspect-[3/4] bg-muted rounded-lg overflow-hidden shadow-lg">
                    {story.image || story.thumbnail ? (
                      <img
                        src={story.image || story.thumbnail}
                        alt={story.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted">
                        <span>Không có ảnh</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* STORY DETAILS */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* TITLE & BASIC INFO */}
                  <div>
                    <h1 className="text-3xl font-bold text-primary mb-4 leading-tight">
                      {story.name}
                    </h1>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      
                      {story.authName && (
                        <div className="flex items-center">
                          <span className="font-medium text-muted min-w-[100px]">Tác giả:</span>
                          <span className="text-body-primary">{story.authName}</span>
                        </div>
                      )}
                      
                      {story.genresName && (
                        <div className="flex items-center">
                          <span className="font-medium text-muted min-w-[100px]">Thể loại:</span>
                          <span className="text-body-primary">{story.genresName}</span>
                        </div>
                      )}
                      
                      {story.statusName && (
                        <div className="flex items-center">
                          <span className="font-medium text-muted min-w-[100px]">Trạng thái:</span>
                          <span className="text-body-primary">{story.statusName}</span>
                        </div>
                      )}
                      
                      {typeof story.chapters === 'number' && (
                        <div className="flex items-center">
                          <span className="font-medium text-muted min-w-[100px]">Số chương:</span>
                          <span className="text-body-primary">{story.chapters.toLocaleString()}</span>
                        </div>
                      )}
                      
                      {typeof story.views === 'number' && (
                        <div className="flex items-center">
                          <span className="font-medium text-muted min-w-[100px]">Lượt xem:</span>
                          <span className="text-body-primary">{story.views.toLocaleString()}</span>
                        </div>
                      )}
                      
                      {typeof story.follows === 'number' && (
                        <div className="flex items-center">
                          <span className="font-medium text-muted min-w-[100px]">Theo dõi:</span>
                          <span className="text-body-primary">{story.follows.toLocaleString()}</span>
                        </div>
                      )}
                      
                      {story.updatedAt && (
                        <div className="flex items-center">
                          <span className="font-medium text-muted min-w-[100px]">Cập nhật:</span>
                          <span className="text-body-primary">
                            {new Date(story.updatedAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      )}
                      
                      {story.lastChapter && (
                        <div className="flex items-center">
                          <span className="font-medium text-muted min-w-[100px]">Chương mới:</span>
                          <span className="text-body-primary">{story.lastChapter}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* DESCRIPTION */}
                  {story.sortDesc && (
                    <div>
                      <h2 className="text-xl font-bold text-primary mb-3">Tóm tắt</h2>
                      <div className="prose prose-sm max-w-none text-body-primary">
                        <p className="leading-relaxed">{story.sortDesc}</p>
                      </div>
                    </div>
                  )}

                  {/* ACTION BUTTONS */}
                  <div className="flex flex-wrap gap-4 pt-4">
                    <a 
                      href={`/${params.idDoc}/chapter-1`}
                      className="flex-1 min-w-[200px] bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors text-center"
                    >
                      🎯 Đọc từ đầu
                    </a>
                    <a 
                      href={`/${params.idDoc}/latest`}
                      className="flex-1 min-w-[200px] bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-medium hover:bg-secondary/90 transition-colors text-center"
                    >
                      📚 Đọc chương mới nhất
                    </a>
                  </div>
                </div>
              </div>

              {/* CHAPTERS LIST */}
              <div className="bg-card rounded-lg p-6 shadow-sm border">
                <h2 className="text-xl font-bold text-primary mb-4">Danh sách chương</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {/* Mock chapter list for demonstration */}
                  {Array.from({ length: story.chapters || 10 }, (_, index) => (
                    <a
                      key={index + 1}
                      href={`/${params.idDoc}/chapter-${index + 1}`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-primary/5 transition-colors group"
                    >
                      <span className="text-sm font-medium group-hover:text-primary">
                        Chương {index + 1}
                      </span>
                      <span className="text-xs text-muted">
                        {new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN')}
                      </span>
                    </a>
                  )).slice(0, 20)}
                </div>
                
                {(story.chapters || 0) > 20 && (
                  <div className="text-center mt-4">
                    <button className="px-6 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors">
                      Xem thêm chương ({(story.chapters || 0) - 20} chương còn lại)
                    </button>
                  </div>
                )}
              </div>

            </div>
          </ApiErrorBoundary>
        </main>

        {/* FOOTER */}
        <FooterNav />
      </div>
    </>
  );
}