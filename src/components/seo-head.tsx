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
}

export function SEOHead({
  title,
  description,
  keywords,
  ogImage,
  canonical,
  noindex = false,
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
      
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
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
      
      {/* Additional Meta */}
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      <meta name="theme-color" content={config.theme.primaryColor} />
      <meta name="msapplication-TileColor" content={config.theme.primaryColor} />
      
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
      
      {/* Schema.org JSON-LD */}
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
          }),
        }}
      />
    </Head>
  );
} 