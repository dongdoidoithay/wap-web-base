'use client';

import React, { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SEOHead } from '@/components/seo-head';
import { useDomain } from '@/hooks/use-domain';
import { StoryListSkeleton } from '@/components/loading-skeleton';
import { ApiErrorBoundary } from '@/components/api-error-boundary';
import { Header, FooterNav } from '@/components/ui';
import { fetchStoryDetail, fetchStoryListChapter } from '@/services/story-detail.service';
import { getCachedStoryDetail } from '@/lib/cached-story-detail';

interface StoryReadingPageProps {
  params: Promise<{
    idDoc: string;
    idDetail: string;
  }>;
}

// Interfaces based on the actual API response
interface DetailDocument {
  slug: string;
  idDetail: string;
  idDoc: string;
  nameChapter: string;
  nameSeoChapter: string | null;
  nameDoc: string;
  view: number;
  value: any;
  date: string;
  url: string;
  urlDowload: string;
  source: string;
  lang: string;
  upVote: number;
  downVote: number;
  level: number;
  site: any;
  idDetailNext: string | null;
  idDetailPrev: string | null;
  nameDetailNext: string | null;
  nameDetailPrev: string | null;
  totalChapters: number;
  currentChapterIndex: number;
}

interface InfoDoc {
  idDoc: string;
  name: string;
  nameOther: string;
  nameSeo: string;
  image: string;
  desc: string;
  sortDesc: string;
  auth: string;
  authName: string;
  genres: string;
  genresName: string;
  year: string;
  view: number;
  art: string;
  artName: string;
  status: string;
  statusName: string;
  date: string;
  type: string;
  typeName: string | null;
  url: string;
  tags: any;
  rate: number;
  postedBy: any;
  serialization: any;
  lang: string;
  idDocRef: string;
  upVote: number;
  downVote: number;
  commentCount: number;
  followCount: number;
  descSeo: string;
  descSeoFull: string;
  keySeo: string;
  detail_documents: any[];
}

interface StoryDetailData {
  detail_documents: DetailDocument;
  chapterList: any[];
  infoDoc: InfoDoc;
}

export default function StoryReadingPage({ params: paramsPromise }: StoryReadingPageProps) {
  // Unwrap params Promise using React.use() as required in Next.js 15+
  const params = React.use(paramsPromise);
console.log('reading---1')

  // ========================
  // 1. DOMAIN CONFIGURATION
  // ========================
  const domainConfig = useDomain();
  const isConfigLoading = !domainConfig;

  // ========================
  // 2. STATE MANAGEMENT
  // ========================
  const [state, setState] = useState({
    storyDetail: null as StoryDetailData | null,
    loading: true,
    error: null as string | null,
    initialized: false,
  });

  // Chapter list popup state
  const [chapterListState, setChapterListState] = useState({
    isOpen: false,
    loading: false,
    chapters: null as any,
    error: null as string | null,
  });

  // ========================
  // 3. DATA LOADING
  // ========================
  useEffect(() => {
    const loadChapterContent = async () => {
      console.log('reading---1#',params);
      if (!params.idDoc || !params.idDetail ) return;

      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        // Use cached data from layout instead of calling API again
        const result = await getCachedStoryDetail(params.idDoc, params.idDetail);
        console.log('reading---2 (using cached data)',result);
        if (result.success && result.data) {
          // Handle the API response structure
          const apiData = result.data as any;
          
          // The fetchStoryDetail should return the full API response structure
          if (apiData && apiData.data && apiData.data.detail_documents) {
            setState(prev => ({
              ...prev,
              storyDetail: apiData.data,
              loading: false,
              initialized: true,
              error: null
            }));
          } else {
            notFound();
          }
        } else {
          notFound();
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load chapter';
        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage,
          initialized: true
        }));
      }
    };

      if(!isConfigLoading)
      loadChapterContent();
  }, [params.idDoc ,params.idDetail,isConfigLoading]);

  // ========================
  // 4. CHAPTER LIST FUNCTIONS
  // ========================
  const handleOpenChapterList = async () => {
    console.log('chapter',chapterListState.chapters);
    if (chapterListState.chapters?.data) {
      // If chapters already loaded, just open popup
      setChapterListState(prev => ({ ...prev, isOpen: true }));
      return;
    }

    // Show loading state and open popup
    setChapterListState(prev => ({ 
      ...prev, 
      isOpen: true, 
      loading: true, 
      error: null 
    }));

    try {
      const result = await fetchStoryListChapter(params.idDoc);
      
      if (result.success && result.data) {
        console.log('result.data', result.data);
        setChapterListState(prev => ({
          ...prev,
          chapters: result.data,
          loading: false,
          error: null
        }));
      } else {
        setChapterListState(prev => ({
          ...prev,
          loading: false,
          error: result.message || 'Không thể tải danh sách chương'
        }));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi khi tải danh sách chương';
      setChapterListState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
    }
  };

  const handleCloseChapterList = () => {
    setChapterListState(prev => ({ ...prev, isOpen: false }));
  };

  // Keyboard support for closing popup
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && chapterListState.isOpen) {
        handleCloseChapterList();
      }
    };

    if (chapterListState.isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when popup is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [chapterListState.isOpen]);

  // ========================
  // 5. LOADING STATE
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
          title="Đang tải chương..."
          description="Đang tải nội dung chương"
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

  if (state.error || !state.storyDetail) {
    return (
      <>
        <SEOHead 
          title="Lỗi tải chương"
          description="Không thể tải nội dung chương"
        />
        <div className="min-h-dvh bg-background text-body-primary">
          <Header config={domainConfig} />
          <main className="container mx-auto px-4 py-6">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-primary mb-4">
                Không tìm thấy chương
              </h1>
              <p className="text-muted mb-6">
                {state.error || 'Chương không tồn tại hoặc đã bị xóa'}
              </p>
              <Link 
                href={`/${params.idDoc}`}
                className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Về trang truyện
              </Link>
            </div>
          </main>
          <FooterNav />
        </div>
      </>
    );
  }

  const { detail_documents, infoDoc } = state.storyDetail;
  
  // Format content with proper line breaks
  const formatContent = (content: string) => {
    return content
      .split('\r\n\r\n')
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0)
      .map(paragraph => `<p>${paragraph.replace(/\r\n/g, '<br>')}</p>`)
      .join('\n');
  };
  
  const formattedContent = formatContent(detail_documents.source);

  // ========================
  // 5. RENDER CHAPTER CONTENT
  // ========================
  return (
    <>
      {/* Enhanced SEO HEAD with AI Bot Support */}
      <SEOHead 
        title={`${detail_documents.nameChapter} - ${infoDoc.name} | ${domainConfig.name}`}
        description={`Đọc ${detail_documents.nameChapter} của truyện ${infoDoc.name} tại ${domainConfig.name}. Nội dung chất lượng cao, cập nhật mới nhất.`}
        keywords={[infoDoc.name, detail_documents.nameChapter, 'đọc truyện', 'chương', domainConfig.name]}
        canonical={`https://${domainConfig.domain}/${params.idDoc}/${params.idDetail}`}
        article={{
          author: infoDoc.authName || 'Admin',
          publishedTime: detail_documents.date,
          modifiedTime: detail_documents.date,
          section: 'Truyện',
          tags: [infoDoc.name, detail_documents.nameChapter, 'chapter']
        }}
        breadcrumbs={[
          { name: 'Trang chủ', url: '/' },
          { name: infoDoc.name, url: `/${params.idDoc}` },
          { name: detail_documents.nameChapter, url: `/${params.idDoc}/${params.idDetail}` }
        ]}
        customSchema={{
          "@context": "https://schema.org",
          "@type": "Chapter",
          "name": detail_documents.nameChapter,
          "isPartOf": {
            "@type": "Book",
            "name": infoDoc.name,
            "url": `https://${domainConfig.domain}/${params.idDoc}`
          },
          "position": detail_documents.currentChapterIndex + 1,
          "url": `https://${domainConfig.domain}/${params.idDoc}/${params.idDetail}`,
          "datePublished": detail_documents.date,
          "inLanguage": "vi-VN"
        }}
      />

      <div className="min-h-dvh bg-background text-body-primary">
        {/* HEADER */}
        <Header config={domainConfig} />

        <main>
          <ApiErrorBoundary>
            <div className="container mx-auto px-4 py-6 max-w-4xl">
              
              {/* BREADCRUMB */}
              <nav className="flex items-center space-x-2 text-sm text-muted mb-6">
                <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
                <span>›</span>
                <Link href={`/${params.idDoc}`} className="hover:text-primary transition-colors">
                  {infoDoc.name}
                </Link>
                <span>›</span>
                <span className="text-body-primary font-medium">{detail_documents.nameChapter}</span>
              </nav>

              {/* CHAPTER HEADER */}
              <div className="text-center mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">
                  {detail_documents.nameChapter}
                </h1>
                <p className="text-muted">
                  Truyện: <Link href={`/${params.idDoc}`} className="hover:text-primary transition-colors font-medium">
                    {infoDoc.name}
                  </Link>
                </p>
                <div className="text-sm text-muted mt-2">
                  Chương {detail_documents.currentChapterIndex + 1} / {detail_documents.totalChapters} •
                  Tác giả: {infoDoc.authName} •
                  Lượt xem: {detail_documents.view.toLocaleString()}
                </div>
              </div>

              {/* NAVIGATION CONTROLS */}
              <div className="flex flex-wrap justify-between items-center gap-4 mb-8 p-4 bg-card rounded-lg border">
                <div className="flex gap-2">
                  {detail_documents.idDetailPrev ? (
                    <Link
                      href={`/${params.idDoc}/${detail_documents.idDetailPrev}`}
                      className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors text-sm"
                    >
                      ← {detail_documents.nameDetailPrev || 'Chương trước'}
                    </Link>
                  ) : (
                    <span className="px-4 py-2 bg-muted/50 text-muted rounded-lg text-sm cursor-not-allowed">
                      ← Chương trước
                    </span>
                  )}
                  
                  <button
                    onClick={handleOpenChapterList}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
                  >
                    📚 Danh sách chương
                  </button>
                </div>

                <div>
                  {detail_documents.idDetailNext && (
                    <Link
                      href={`/${params.idDoc}/${detail_documents.idDetailNext}`}
                      className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors text-sm"
                    >
                      {detail_documents.nameDetailNext || 'Chương sau'} →
                    </Link>
                  )}
                </div>
              </div>

              {/* CHAPTER CONTENT */}
              <div className="bg-card rounded-lg p-6 md:p-8 shadow-sm border">
                <div 
                  className="prose prose-lg max-w-none text-body-primary leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: formattedContent }}
                />
              </div>

              {/* BOTTOM NAVIGATION */}
              <div className="flex flex-wrap justify-between items-center gap-4 mt-8 p-4 bg-card rounded-lg border">
                <div className="flex gap-2">
                  {detail_documents.idDetailPrev ? (
                    <Link
                      href={`/${params.idDoc}/${detail_documents.idDetailPrev}`}
                      className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors text-sm"
                    >
                      ← {detail_documents.nameDetailPrev || 'Chương trước'}
                    </Link>
                  ) : (
                    <span className="px-4 py-2 bg-muted/50 text-muted rounded-lg text-sm cursor-not-allowed">
                      ← Chương trước
                    </span>
                  )}
                  
                  <button
                    onClick={handleOpenChapterList}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
                  >
                    📚 Danh sách chương
                  </button>
                </div>

                <div>
                  {detail_documents.idDetailNext && (
                    <Link
                      href={`/${params.idDoc}/${detail_documents.idDetailNext}`}
                      className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors text-sm"
                    >
                      {detail_documents.nameDetailNext || 'Chương sau'} →
                    </Link>
                  )}
                </div>
              </div>

              {/* STORY INFO BOX */}
              <div className="mt-8 p-4 bg-card rounded-lg border">
                <h3 className="font-bold text-primary mb-2">Về truyện này</h3>
                <p className="text-sm text-muted mb-3">
                  Bạn đang đọc <strong>{detail_documents.nameChapter}</strong> thuộc truyện <strong>{infoDoc.name}</strong>
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <span className="font-medium">Tác giả:</span> {infoDoc.authName}
                  </div>
                  <div>
                    <span className="font-medium">Thể loại:</span> {infoDoc.genresName}
                  </div>
                  <div>
                    <span className="font-medium">Trạng thái:</span> {infoDoc.statusName}
                  </div>
                  <div>
                    <span className="font-medium">Lượt xem:</span> {infoDoc.view.toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/${params.idDoc}`}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
                  >
                    📖 Thông tin truyện
                  </Link>
                  <Link
                    href="/"
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors text-sm"
                  >
                    🏠 Trang chủ
                  </Link>
                </div>
              </div>

            </div>
          </ApiErrorBoundary>
        </main>

        {/* FOOTER */}
        <FooterNav />
      </div>

      {/* CHAPTER LIST POPUP */}
      {chapterListState.isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            // Close popup when clicking on backdrop
            if (e.target === e.currentTarget) {
              handleCloseChapterList();
            }
          }}
        >
          <div className="bg-background border rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
            {/* Popup Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold text-primary">
                Danh sách chương - {state.storyDetail?.infoDoc.name}
              </h2>
              <button
                onClick={handleCloseChapterList}
                className="text-muted hover:text-body-primary transition-colors p-2"
              >
                ✕
              </button>
            </div>
            
            {/* Popup Content */}
            <div className="flex-1 overflow-auto p-4">
              {chapterListState.loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted">Đang tải danh sách chương...</p>
                  </div>
                </div>
              ) : chapterListState.error ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <p className="text-red-500 mb-4">{chapterListState.error}</p>
                    <button
                      onClick={handleOpenChapterList}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Thử lại
                    </button>
                  </div>
                </div>
              ) : chapterListState.chapters?.data ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {chapterListState.chapters.data.map((chapter: any, index: number) => (
                    <Link
                      key={chapter.idDetail || index}
                      href={`/${params.idDoc}/${chapter.idDetail}`}
                      onClick={handleCloseChapterList}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors group ${
                        chapter.idDetail === params.idDetail 
                          ? 'border-blue-500' 
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <span className={`text-sm ${
                        chapter.idDetail === params.idDetail 
                          ? 'font-bold text-blue-600' 
                          : 'font-medium group-hover:text-primary'
                      }`}>
                        {chapter.nameChapter || `Chương ${index + 1}`}
                      </span>
                      <span className="text-xs text-muted">
                        { new Date(chapter.date).toLocaleDateString("vi-VN")|| ''}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <p className="text-muted">Không có chương nào</p>
                </div>
              )}
            </div>
            
            {/* Popup Footer */}
            <div className="border-t p-4">
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleCloseChapterList}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}