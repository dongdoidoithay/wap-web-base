import { Metadata } from 'next';
import { headers } from 'next/headers';
import { getDomainConfigSync } from '@/lib/domain-config';
import { getCachedStoryDetail } from '@/lib/cached-story-detail';
import { fetchStoryDetail } from '@/services/story-detail.service';
import { TextConstants } from '@/lib/text-constants';

interface ChapterReadingLayoutProps {
  params: Promise<{
    idDoc: string;
    idDetail: string;
  }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: { params: Promise<{ idDoc: string; idDetail: string }> }): Promise<Metadata> {
  const headersList = await headers();
  const hostname = headersList.get('host') || '';
  const config = getDomainConfigSync(hostname);
  
  // Await params before accessing properties
  const resolvedParams = await params;

  try {
    // Fetch real story data using cached function
    const storyResult = await getCachedStoryDetail(resolvedParams.idDoc,resolvedParams.idDetail,'');
    console.log('reading---3',storyResult);
    if (storyResult.success && storyResult.data) {
      const apiData = storyResult.data as any;
      
      if (apiData?.data?.detail_documents && apiData?.data?.infoDoc) {
        const { detail_documents, infoDoc } = apiData.data;
        
        const title = `${detail_documents.nameChapter} - ${infoDoc.name} | ${config.name}`;


        const description = TextConstants.chapterDetail.seo_description.vi
          .replace('{chapterName}', detail_documents.nameChapter)
          .replace('{storyName}', infoDoc.name)
          .replace('{domainName}', config.name);
        const keywords = [
          infoDoc.name,
          detail_documents.nameChapter,
          infoDoc.authName,
          infoDoc.genresName,
          TextConstants.chapterDetail.seo_keyword_story.vi,
          TextConstants.chapterDetail.seo_keyword_chapter.vi,
          config.name
        ].filter(Boolean);

        return {
          title,
          description,
          keywords: keywords,
          creator: infoDoc.authName || config.name,
          publisher: config.name,
          metadataBase: new URL(`https://${config.domain}`),
          alternates: {
            canonical: `/${resolvedParams.idDoc}/${resolvedParams.idDetail}`,
          },
          openGraph: {
            title,
            description,
            url: `https://${config.domain}/${resolvedParams.idDoc}/${resolvedParams.idDetail}`,
            siteName: config.name,
            images: [
              {
                url: infoDoc.image || config.seo?.ogImage || '',
                width: 1200,
                height: 630,
                alt: `${detail_documents.nameChapter} - ${infoDoc.name}`,
              },
            ],
            locale: 'vi_VN',
            type: 'article',
            section: TextConstants.chapterDetail.seo_section.vi,
          },
          twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [infoDoc.image || config.seo?.ogImage || ''],
            creator: config.seo?.twitterHandle,
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
            'article:section': TextConstants.chapterDetail.seo_section.vi,
            'article:tag': detail_documents.nameChapter,
            'article:author': infoDoc.authName,
            'article:published_time': detail_documents.date,
          },
        };
      }
    }
    
    // Fallback to original logic if API fails

    
    const storyName = `${TextConstants.chapterDetail.story_label.vi} ${resolvedParams.idDoc}`;
    const chapterName = `${TextConstants.chapterDetail.chapter_label.vi} ${resolvedParams.idDetail}`;

    const title = `${chapterName} - ${storyName} | ${config.name}`;
    const description = TextConstants.chapterDetail.seo_description.vi
      .replace('{chapterName}', chapterName)
      .replace('{storyName}', storyName)
      .replace('{domainName}', config.name);
    const keywords = [
      storyName,
      chapterName,
      TextConstants.chapterDetail.seo_keyword_story.vi,
      TextConstants.chapterDetail.seo_keyword_chapter.vi,
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
        canonical: `/${resolvedParams.idDoc}/${resolvedParams.idDetail}`,
      },
      openGraph: {
        title,
        description,
        url: `https://${config.domain}/${resolvedParams.idDoc}/${resolvedParams.idDetail}`,
        siteName: config.name,
        images: [
          {
            url: config.seo?.ogImage || '',
            width: 1200,
            height: 630,
            alt: `${chapterName} - ${storyName}`,
          },
        ],
        locale: 'vi_VN',
        type: 'article',
        section: TextConstants.chapterDetail.seo_section.vi,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [config.seo?.ogImage || ''],
        creator: config.seo?.twitterHandle,
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
        'article:section': TextConstants.chapterDetail.seo_section.vi,
        'article:tag': chapterName,
      },
    };
  } catch (error) {
    console.error('Error generating chapter metadata:', error);
    
    // Fallback metadata
    return {
      title: `${TextConstants.chapterDetail.read_chapter.vi} | ${config.name}`,
      description: `${TextConstants.chapterDetail.read_chapter_online.vi} ${config.name}`,
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