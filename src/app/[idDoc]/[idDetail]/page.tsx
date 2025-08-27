'use client';

import React, { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SEOHead } from '@/components/seo-head';
import { useDomain } from '@/hooks/use-domain';
import { StoryListSkeleton } from '@/components/loading-skeleton';
import { ApiErrorBoundary } from '@/components/api-error-boundary';
import { Header, FooterNav } from '@/components/ui';

interface StoryReadingPageProps {
  params: {
    idDoc: string;
    idDetail: string;
  };
}

interface ChapterContent {
  id: string;
  name: string;
  content: string;
  storyId: string;
  storyName: string;
  chapterNumber: number;
  nextChapter?: string;
  prevChapter?: string;
  createdAt: string;
}

// Mock function to fetch chapter content
async function fetchChapterContent(idDoc: string, idDetail: string): Promise<{
  data: ChapterContent | null;
  success: boolean;
  message?: string;
}> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
  
  // Simulate occasional errors for testing
  if (Math.random() < 0.05) {
    return {
      data: null,
      success: false,
      message: 'Network error'
    };
  }

  // Extract chapter number from IdDetail
  const chapterMatch = idDetail.match(/(?:chapter-)?(\d+)/);
  const chapterNumber = chapterMatch ? parseInt(chapterMatch[1]) : 1;
  
  // Generate mock chapter content
  const mockContent = `
<h2>Chương ${chapterNumber}: Khởi đầu mới</h2>

<p>Trong một buổi sáng đầy nắng, ánh sáng vàng óng chiếu qua khung cửa sổ, tạo nên những vệt sáng lung linh trên sàn nhà. Không khí trong lành mang theo hương thơm nhẹ của những bông hoa nở rộ trong vườn.</p>

<p>Nhân vật chính của chúng ta, một người trẻ tuổi đầy hoài bão, đang đứng bên cửa sổ nhìn ra khu vườn xinh đẹp. Trong tâm trí, những kế hoạch cho tương lai đang dần hình thành, như những tia sáng đầu tiên của bình minh.</p>

<p>"Hôm nay sẽ là một ngày đặc biệt," họ thầm nghĩ, một nụ cười tự nhiên nở trên môi. Đây chính là lúc để bắt đầu cuộc hành trình mới, một chương mới trong cuốn sách cuộc đời.</p>

<p>Xa xa, tiếng chim hót líu lo hòa cùng tiếng gió thổi qua những tán lá xanh mướt. Mọi thứ dường như đang chuẩn bị cho một khởi đầu tươi đẹp, đầy hứa hẹn.</p>

<p>Nhưng như mọi câu chuyện tuyệt vời, phía trước vẫn còn những thử thách đang chờ đợi. Những bài học quan trọng về cuộc sống, tình bạn, và sự trưởng thành sẽ dần được hé lộ qua từng trang sách.</p>

<p>Trong khoảnh khắc yên bình này, ai có thể ngờ rằng những diễn biến thú vị và bất ngờ sắp diễn ra? Hãy cùng theo dõi và khám phá xem câu chuyện sẽ dẫn chúng ta đến đâu...</p>

<p style="text-align: center; font-weight: bold; margin-top: 2em;">--- Hết chương ${chapterNumber} ---</p>
  `.trim();

  return {
    data: {
      id: idDetail,
      name: `Chương ${chapterNumber}: Khởi đầu mới`,
      content: mockContent,
      storyId: idDoc,
      storyName: `Truyện ${idDoc}`,
      chapterNumber,
      nextChapter: `chapter-${chapterNumber + 1}`,
      prevChapter: chapterNumber > 1 ? `chapter-${chapterNumber - 1}` : undefined,
      createdAt: new Date().toISOString()
    },
    success: true
  };
}

export default function StoryReadingPage({ params }: StoryReadingPageProps) {
  // ========================
  // 1. DOMAIN CONFIGURATION
  // ========================
  const domainConfig = useDomain();
  const isConfigLoading = !domainConfig;

  // ========================
  // 2. STATE MANAGEMENT
  // ========================
  const [state, setState] = useState({
    chapter: null as ChapterContent | null,
    loading: true,
    error: null as string | null,
    initialized: false,
  });

  // ========================
  // 3. DATA LOADING
  // ========================
  useEffect(() => {
    const loadChapterContent = async () => {
      if (!params.idDoc || !params.idDetail || !domainConfig) return;

      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const result = await fetchChapterContent(params.idDoc, params.idDetail);
        
        if (result.success && result.data) {
          setState(prev => ({
            ...prev,
            chapter: result.data,
            loading: false,
            initialized: true,
            error: null
          }));
        } else {
          // Chapter not found
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

    if (!isConfigLoading && domainConfig) {
      loadChapterContent();
    }
  }, []);
  //params.idDoc, params.idDetail, domainConfig, isConfigLoading

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

  if (state.error || !state.chapter) {
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

  const chapter = state.chapter;

  // ========================
  // 5. RENDER CHAPTER CONTENT
  // ========================
  return (
    <>
      {/* Enhanced SEO HEAD with AI Bot Support */}
      <SEOHead 
        title={`${chapter.name} - ${chapter.storyName} | ${domainConfig.name}`}
        description={`Đọc ${chapter.name} của truyện ${chapter.storyName} tại ${domainConfig.name}. Nội dung chất lượng cao, cập nhật mới nhất.`}
        keywords={[chapter.storyName, chapter.name, 'đọc truyện', 'chương', domainConfig.name]}
        canonical={`https://${domainConfig.domain}/${params.idDoc}/${params.idDetail}`}
        article={{
          author: 'Admin', // Replace with actual author from story data
          publishedTime: chapter.createdAt,
          modifiedTime: chapter.createdAt,
          section: 'Truyện',
          tags: [chapter.storyName, chapter.name, 'chapter']
        }}
        breadcrumbs={[
          { name: 'Trang chủ', url: '/' },
          { name: chapter.storyName, url: `/${params.idDoc}` },
          { name: chapter.name, url: `/${params.idDoc}/${params.idDetail}` }
        ]}
        customSchema={{
          "@context": "https://schema.org",
          "@type": "Chapter",
          "name": chapter.name,
          "isPartOf": {
            "@type": "Book",
            "name": chapter.storyName,
            "url": `https://${domainConfig.domain}/${params.idDoc}`
          },
          "position": chapter.chapterNumber,
          "url": `https://${domainConfig.domain}/${params.idDoc}/${params.idDetail}`,
          "datePublished": chapter.createdAt,
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
                  {chapter.storyName}
                </Link>
                <span>›</span>
                <span className="text-body-primary font-medium">{chapter.name}</span>
              </nav>

              {/* CHAPTER HEADER */}
              <div className="text-center mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">
                  {chapter.name}
                </h1>
                <p className="text-muted">
                  Truyện: <Link href={`/${params.idDoc}`} className="hover:text-primary transition-colors font-medium">
                    {chapter.storyName}
                  </Link>
                </p>
              </div>

              {/* NAVIGATION CONTROLS */}
              <div className="flex flex-wrap justify-between items-center gap-4 mb-8 p-4 bg-card rounded-lg border">
                <div className="flex gap-2">
                  {chapter.prevChapter ? (
                    <Link
                      href={`/${params.idDoc}/${chapter.prevChapter}`}
                      className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors text-sm"
                    >
                      ← Chương trước
                    </Link>
                  ) : (
                    <span className="px-4 py-2 bg-muted/50 text-muted rounded-lg text-sm cursor-not-allowed">
                      ← Chương trước
                    </span>
                  )}
                  
                  <Link
                    href={`/${params.idDoc}`}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
                  >
                    📚 Danh sách chương
                  </Link>
                </div>

                <div>
                  {chapter.nextChapter && (
                    <Link
                      href={`/${params.idDoc}/${chapter.nextChapter}`}
                      className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors text-sm"
                    >
                      Chương sau →
                    </Link>
                  )}
                </div>
              </div>

              {/* CHAPTER CONTENT */}
              <div className="bg-card rounded-lg p-6 md:p-8 shadow-sm border">
                <div 
                  className="prose prose-lg max-w-none text-body-primary leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: chapter.content }}
                />
              </div>

              {/* BOTTOM NAVIGATION */}
              <div className="flex flex-wrap justify-between items-center gap-4 mt-8 p-4 bg-card rounded-lg border">
                <div className="flex gap-2">
                  {chapter.prevChapter ? (
                    <Link
                      href={`/${params.idDoc}/${chapter.prevChapter}`}
                      className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors text-sm"
                    >
                      ← Chương trước
                    </Link>
                  ) : (
                    <span className="px-4 py-2 bg-muted/50 text-muted rounded-lg text-sm cursor-not-allowed">
                      ← Chương trước
                    </span>
                  )}
                  
                  <Link
                    href={`/${params.idDoc}`}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
                  >
                    📚 Danh sách chương
                  </Link>
                </div>

                <div>
                  {chapter.nextChapter && (
                    <Link
                      href={`/${params.idDoc}/${chapter.nextChapter}`}
                      className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors text-sm"
                    >
                      Chương sau →
                    </Link>
                  )}
                </div>
              </div>

              {/* STORY INFO BOX */}
              <div className="mt-8 p-4 bg-card rounded-lg border">
                <h3 className="font-bold text-primary mb-2">Về truyện này</h3>
                <p className="text-sm text-muted mb-3">
                  Bạn đang đọc <strong>{chapter.name}</strong> thuộc truyện <strong>{chapter.storyName}</strong>
                </p>
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
    </>
  );
}