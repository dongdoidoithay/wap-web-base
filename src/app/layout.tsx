import type { Metadata } from "next";
import "./globals.css";
import { headers } from 'next/headers';
import { getDomainConfigSync } from '../lib/domain-config';
import { ThemeProvider } from '../components/theme-provider';
import { ClientOnly } from '../components/client-only';
import { ServerThemeProvider } from '../components/server-theme-provider';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const hostname = headersList.get('host') || '';
  const config = getDomainConfigSync(hostname);

  return {
    title: {
      default: config.seo.title,
      template: `%s | ${config.name}`,
    },
    description: config.seo.description,
    keywords: config.seo.keywords,
    authors: [{ name: config.name }],
    creator: config.name,
    publisher: config.name,
    metadataBase: new URL(`https://${config.domain}`),
    alternates: {
      canonical: '/',
    },
    openGraph: {
      title: config.seo.title,
      description: config.seo.description,
      url: `https://${config.domain}`,
      siteName: config.name,
      images: [
        {
          url: config.seo.ogImage,
          width: 1200,
          height: 630,
          alt: config.name,
        },
      ],
      locale: 'vi_VN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: config.seo.title,
      description: config.seo.description,
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
    verification: {
      google: config.seo?.googleVerification || 'your-google-verification-code',
      yandex: config.seo?.yandexVerification || 'your-yandex-verification-code',
      yahoo: 'your-yahoo-verification-code',
      other: {
        'baidu-site-verification': config.seo?.baiduVerification || 'your-baidu-verification-code',
        'naver-site-verification': config.seo?.naverVerification || 'your-naver-verification-code',
      },
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      {/* suppressHydrationWarning prevents hydration errors from browser extensions like Grammarly */}
      <body className="antialiased" suppressHydrationWarning={true}>
        <ServerThemeProvider>
          <ClientOnly fallback={children}>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </ClientOnly>
        </ServerThemeProvider>
      </body>
    </html>
  );
}
