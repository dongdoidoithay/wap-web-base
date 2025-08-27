'use client';

import Head from 'next/head';
import { useDomain } from '../hooks/use-domain';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  canonical?: string;
  noindex?: boolean;
  article?: {
    author?: string;
    publishedTime?: string;
    modifiedTime?: string;
    section?: string;
    tags?: string[];
  };
  breadcrumbs?: Array<{
    name: string;
    url: string;
  }>;
  faq?: Array<{
    question: string;
    answer: string;
  }>;
  customSchema?: any;
}

export function SEOHead({
  title,
  description,
  keywords,
  ogImage,
  canonical,
  noindex = false,
  article,
  breadcrumbs,
  faq,
  customSchema,
}: SEOHeadProps) {
  const config = useDomain();

  if (!config) return null;

  const seoTitle = title || config.seo.title;
  const seoDescription = description || config.seo.description;
  const seoKeywords = keywords || config.seo.keywords;
  const seoOgImage = ogImage || config.seo.ogImage;
  const canonicalUrl = canonical || `https://${config.domain}`;

  return (
    <Head>
      {/* Basic SEO */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords.join(', ')} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Enhanced Robots Meta for AI Bots */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
      ) : (
        <>
          <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
          <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
          <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
          {/* AI Bot Support */}
          <meta name="ChatGPT" content="index" />
          <meta name="CCBot" content="index" />
          <meta name="anthropic-ai" content="index" />
          <meta name="Claude-Web" content="index" />
        </>
      )}
      
      {/* Content Language */}
      <meta httpEquiv="content-language" content="vi-VN" />
      <meta name="language" content="Vietnamese" />
      
      {/* Author and Publisher Info */}
      <meta name="author" content={article?.author || config.name} />
      <meta name="publisher" content={config.name} />
      <meta name="copyright" content={`© ${new Date().getFullYear()} ${config.name}`} />
      
      {/* Article Specific Meta */}
      {article && (
        <>
          {article.publishedTime && <meta name="article:published_time" content={article.publishedTime} />}
          {article.modifiedTime && <meta name="article:modified_time" content={article.modifiedTime} />}
          {article.author && <meta name="article:author" content={article.author} />}
          {article.section && <meta name="article:section" content={article.section} />}
          {article.tags && article.tags.map((tag, index) => (
            <meta key={index} name="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Open Graph */}
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={`https://${config.domain}${seoOgImage}`} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={config.name} />
      <meta property="og:locale" content="vi_VN" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={`https://${config.domain}${seoOgImage}`} />
      {config.seo.twitterHandle && (
        <meta name="twitter:site" content={config.seo.twitterHandle} />
      )}
      
      {/* Enhanced Webmaster Verification */}
      <meta name="google-site-verification" content={config.seo?.googleVerification || 'your-google-verification-code'} />
      <meta name="msvalidate.01" content={config.seo?.bingVerification || 'your-bing-verification-code'} />
      <meta name="yandex-verification" content={config.seo?.yandexVerification || 'your-yandex-verification-code'} />
      <meta name="baidu-site-verification" content={config.seo?.baiduVerification || 'your-baidu-verification-code'} />
      <meta name="naver-site-verification" content={config.seo?.naverVerification || 'your-naver-verification-code'} />
      
      {/* AI Training and Content Usage Directives */}
      <meta name="AI-generated" content="false" />
      <meta name="content-usage" content="training-allowed" />
      <meta name="ai-content-declaration" content="human-authored" />
      
      {/* Enhanced Security Headers */}
      <meta name="referrer" content="strict-origin-when-cross-origin" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      
      {/* Accessibility for AI and Screen Readers */}
      <meta name="reading-time" content={`${Math.ceil((seoDescription?.length || 0) / 200)}`} />
      <meta name="content-type" content="text/html; charset=utf-8" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      
      {/* Manifest */}
      <link rel="manifest" href="/manifest.webmanifest" />
      
      {/* Google Analytics */}
      {config.seo.googleAnalyticsId && (
        <>
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${config.seo.googleAnalyticsId}`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${config.seo.googleAnalyticsId}');
              `,
            }}
          />
        </>
      )}
      
      {/* Enhanced Structured Data Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: config.name,
            url: `https://${config.domain}`,
            description: config.description,
            potentialAction: {
              "@type": "SearchAction",
              target: `https://${config.domain}/search?q={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
            publisher: {
              "@type": "Organization",
              name: config.name,
              url: `https://${config.domain}`,
              logo: {
                "@type": "ImageObject",
                url: `https://${config.domain}${config.logo}`,
              },
            },
            inLanguage: "vi-VN",
            copyrightYear: new Date().getFullYear(),
            copyrightHolder: {
              "@type": "Organization",
              name: config.name,
            },
          }),
        }}
      />
      
      {/* Breadcrumb Schema */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: breadcrumbs.map((crumb, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: crumb.name,
                item: `https://${config.domain}${crumb.url}`,
              })),
            }),
          }}
        />
      )}
      
      {/* FAQ Schema for AI Understanding */}
      {faq && faq.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faq.map((item) => ({
                "@type": "Question",
                name: item.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: item.answer,
                },
              })),
            }),
          }}
        />
      )}
      
      {/* Article Schema for Story Content */}
      {article && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              headline: seoTitle,
              description: seoDescription,
              image: ogImage ? `https://${config.domain}${ogImage}` : `https://${config.domain}${seoOgImage}`,
              author: {
                "@type": "Person",
                name: article.author || config.name,
              },
              publisher: {
                "@type": "Organization",
                name: config.name,
                logo: {
                  "@type": "ImageObject",
                  url: `https://${config.domain}${config.logo}`,
                },
              },
              datePublished: article.publishedTime,
              dateModified: article.modifiedTime || article.publishedTime,
              mainEntityOfPage: {
                "@type": "WebPage",
                "@id": canonicalUrl,
              },
              articleSection: article.section,
              keywords: article.tags?.join(', ') || seoKeywords.join(', '),
              inLanguage: "vi-VN",
            }),
          }}
        />
      )}
      
      {/* Custom Schema Support */}
      {customSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(customSchema),
          }}
        />
      )}
      
      {/* Additional Meta for Mobile and PWA */}
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      <meta name="theme-color" content={config.theme?.primaryColor || '#3b82f6'} />
      <meta name="msapplication-TileColor" content={config.theme?.primaryColor || '#3b82f6'} />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={config.name} />
    </Head>
  );
} 