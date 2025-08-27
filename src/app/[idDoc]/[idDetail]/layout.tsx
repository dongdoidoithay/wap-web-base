import { Metadata } from 'next';
import { headers } from 'next/headers';
import { getDomainConfigSync } from '../../../lib/domain-config';

interface ChapterReadingLayoutProps {
  params: Promise<{
    idDoc: string;
    IdDetail: string;
  }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: { params: Promise<{ idDoc: string; IdDetail: string }> }): Promise<Metadata> {
  const headersList = await headers();
  const hostname = headersList.get('host') || '';
  const config = getDomainConfigSync(hostname);
  
  // Await params before accessing properties
  const resolvedParams = await params;

  try {
    // Extract chapter number from IdDetail
    const chapterMatch = resolvedParams.IdDetail.match(/(?:chapter-)?(\d+)/);
    const chapterNumber = chapterMatch ? parseInt(chapterMatch[1]) : 1;
    
    // Mock story name (in real implementation, fetch from API)
    const storyName = `Truyện ${resolvedParams.idDoc}`;
    const chapterName = `Chương ${chapterNumber}`;

    const title = `${chapterName} - ${storyName} | ${config.name}`;
    const description = `Đọc ${chapterName} của truyện ${storyName} tại ${config.name}. Nội dung chất lượng cao, cập nhật mới nhất.`;
    const keywords = [
      storyName,
      chapterName,
      'đọc truyện',
      'chương',
      'truyện online',
      config.name
    ];

    return {
      title,
      description,
      keywords: keywords,
      creator: config.name,
      publisher: config.name,
      metadataBase: new URL(`https://${config.domain}`),
      alternates: {
        canonical: `/${resolvedParams.idDoc}/${resolvedParams.IdDetail}`,
      },
      openGraph: {
        title,
        description,
        url: `https://${config.domain}/${resolvedParams.idDoc}/${resolvedParams.IdDetail}`,
        siteName: config.name,
        images: [
          {
            url: config.seo.ogImage,
            width: 1200,
            height: 630,
            alt: `${chapterName} - ${storyName}`,
          },
        ],
        locale: 'vi_VN',
        type: 'article',
        section: 'Truyện',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [config.seo.ogImage],
        creator: config.seo.twitterHandle,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      other: {
        'article:section': 'Truyện',
        'article:tag': chapterName,
      },
    };
  } catch (error) {
    console.error('Error generating chapter metadata:', error);
    
    // Fallback metadata
    return {
      title: `Đọc truyện | ${config.name}`,
      description: `Đọc truyện online tại ${config.name}`,
      robots: {
        index: false,
        follow: true,
      },
    };
  }
}

export default function ChapterReadingLayout({ children }: ChapterReadingLayoutProps) {
  return children;
}