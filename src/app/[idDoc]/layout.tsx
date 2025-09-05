import { Metadata ,ResolvingMetadata} from 'next';
import { headers } from 'next/headers';
import { getDomainConfigSync } from '@/lib/domain-config';
import { getCachedStoryDetail } from '@/lib/cached-story-detail';
import { fetchStoryDetail } from '@/services/story-detail.service';
import { TextConstants } from '@/lib/text-constants';


type Props = {
  params: Promise<{ idDoc: string }>
  searchParams: { [key: string]: string | string[] | undefined }
}
 
export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata>  {
  const headersList = await headers();
  const hostname = headersList.get('host') || '';
  const config = getDomainConfigSync(hostname);
  
  // Await params before accessing properties
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams;
  console.log('type--->',resolvedSearchParams);
  
  // Extract the type parameter and find the corresponding API path
  let apiPath = '';
  const typeParam = resolvedSearchParams?.type as string || '';
  console.log('type parameter:', typeParam);
  
  if (typeParam && config.cateChip) {
    const chip = config.cateChip.find(item => item.id === typeParam);
    if (chip) {
      apiPath = chip["api-path"];
      console.log('Found API path:', apiPath);
    }
  }
  
  try {
    // Fetch real story data using cached function with the correct API path
    const storyResult = await getCachedStoryDetail(resolvedParams.idDoc,"_",apiPath);
    console.log('reading---3',storyResult);
    if (storyResult.success && storyResult.data) {
      const apiData = storyResult.data as any;
      
      if (apiData?.data?.detail_documents && apiData?.data?.infoDoc) {
        const { detail_documents, infoDoc } = apiData.data;
        
        const title = `${detail_documents.nameChapter} - ${infoDoc.name} | ${config.name}`;


        const description = TextConstants.storyDetail.seo_description.vi
          .replace('{chapterName}', detail_documents.nameChapter)
          .replace('{storyName}', infoDoc.name)
          .replace('{domainName}', config.name);
        const keywords = [
          infoDoc.name,
          detail_documents.nameChapter,
          infoDoc.authName,
          infoDoc.genresName,
          TextConstants.storyDetail.seo_keyword_story.vi,
          TextConstants.storyDetail.seo_keyword_chapter.vi,
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
            canonical: `/${resolvedParams.idDoc}`,
          },
          openGraph: {
            title,
            description,
            url: `https://${config.domain}/${resolvedParams.idDoc}`,
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
            section: TextConstants.storyDetail.seo_section.vi,
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
            'article:section': TextConstants.storyDetail.seo_section.vi,
            'article:tag': detail_documents.nameChapter,
            'article:author': infoDoc.authName,
            'article:published_time': detail_documents.date,
          },
        };
      }
    }
    
    // Fallback to original logic if API fails

    
    const storyName = `${TextConstants.storyDetail.story_label.vi} ${resolvedParams.idDoc}`;

    const title = `${TextConstants.storyDetail.read_story.vi} - ${storyName} | ${config.name}`;
    const description = TextConstants.storyDetail.seo_description.vi
      .replace('{storyName}', storyName)
      .replace('{domainName}', config.name);
    const keywords = [
      storyName,
      TextConstants.storyDetail.seo_keyword_story.vi,
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
        canonical: `/${resolvedParams.idDoc}`,
      },
      openGraph: {
        title,
        description,
        url: `https://${config.domain}/${resolvedParams.idDoc}`,
        siteName: config.name,
        images: [
          {
            url: config.seo?.ogImage || '',
            width: 1200,
            height: 630,
            alt: `${TextConstants.storyDetail.read_story.vi} - ${storyName}`,
          },
        ],
        locale: 'vi_VN',
        type: 'article',
        section: TextConstants.storyDetail.seo_section.vi,
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
        'article:section': TextConstants.storyDetail.seo_section.vi,
      },
    };
  } catch (error) {
    console.error('Error generating chapter metadata:', error);
    
    // Fallback metadata
    return {
      title: `${TextConstants.storyDetail.read_story.vi} | ${config.name}`,
      description: `${TextConstants.storyDetail.read_story_online.vi} ${config.name}`,
      robots: {
        index: false,
        follow: true,
      },
    };
  }
}

export default function ChapterReadingLayout({ children }:any) {
  return children;
}