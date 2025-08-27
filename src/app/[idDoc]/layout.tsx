import { Metadata } from 'next';
import { headers } from 'next/headers';
import { getDomainConfigSync } from '../../lib/domain-config';
import { fetchStoryDetailDev } from '../../services/story-detail.service';

interface StoryInfoLayoutProps {
  params: Promise<{
    idDoc: string;
  }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: { params: Promise<{ idDoc: string }> }): Promise<Metadata> {
  const headersList = await headers();
  const hostname = headersList.get('host') || '';
  const config = getDomainConfigSync(hostname);
  
  // Await params before accessing properties
  const resolvedParams = await params;

  try {
    const storyResult = await fetchStoryDetailDev(resolvedParams.idDoc);
    const story = storyResult.success ? storyResult.data : null;
    
    if (!story) {
      return {
        title: `Không tìm thấy truyện | ${config.name}`,
        description: 'Truyện không tồn tại hoặc đã bị xóa',
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    const title = `${story.name} | ${config.name}`;
    const description = story.sortDesc || `Đọc truyện ${story.name} tại ${config.name}. ${story.authName ? `Tác giả: ${story.authName}` : ''}`;
    const keywords = [
      story.name,
      story.authName || '',
      story.genresName || '',
      'truyện',
      'đọc truyện',
      config.name
    ].filter(Boolean);

    return {
      title,
      description,
      keywords: keywords,
      authors: story.authName ? [{ name: story.authName }] : undefined,
      creator: story.authName || config.name,
      publisher: config.name,
      metadataBase: new URL(`https://${config.domain}`),
      alternates: {
        canonical: `/${resolvedParams.idDoc}`,
      },
      openGraph: {
        title,
        description,
        url: `https://${config.domain}/${resolvedParams.idDoc}`,
        siteName: config.name,
        images: story.image || story.thumbnail ? [
          {
            url: story.image || story.thumbnail || '',
            width: 600,
            height: 800,
            alt: story.name,
          },
        ] : [
          {
            url: config.seo.ogImage,
            width: 1200,
            height: 630,
            alt: config.name,
          },
        ],
        locale: 'vi_VN',
        type: 'article',
        publishedTime: story.createdAt,
        modifiedTime: story.updatedAt,
        authors: story.authName ? [story.authName] : undefined,
        section: story.genresName || 'Truyện',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: story.image || story.thumbnail ? [story.image || story.thumbnail || ''] : [config.seo.ogImage],
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
        'article:author': story.authName || '',
        'article:section': story.genresName || '',
        'article:published_time': story.createdAt || '',
        'article:modified_time': story.updatedAt || '',
      },
    };
  } catch (error) {
    console.error('Error generating story metadata:', error);
    
    // Fallback metadata
    return {
      title: `Truyện | ${config.name}`,
      description: `Đọc truyện tại ${config.name}`,
      robots: {
        index: false,
        follow: true,
      },
    };
  }
}

export default function StoryInfoLayout({ children }: StoryInfoLayoutProps) {
  return children;
}