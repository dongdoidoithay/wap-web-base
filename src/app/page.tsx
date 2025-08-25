import Image from "next/image";
import React from "react";
import Link from "next/link";
import { headers } from 'next/headers';
import { getDomainConfigSync } from '@/lib/domain-config';
import { SEOHead } from '@/components/seo-head';
import { CacheDebug } from '@/components/cache-debug';
import { ClientOnly } from '@/components/client-only';
import { ApiDataHandler } from '@/components/api-data-handler';
import { ApiErrorBoundary } from '@/components/api-error-boundary';

// Import API interfaces and services
import { 
  StoryItem, 
  ApiResponse,
  fetchLatestStories,
  fetchTopFollowStories,
  fetchTopDayStories
} from '@/services/story-api.service';

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// API Data Fetching Functions
// Utility function to calculate pagination info
function calculatePagination(currentPage: number, totalItems: number, itemsPerPage: number): PaginationInfo {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  return {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    hasNext: currentPage < totalPages - 1,
    hasPrev: currentPage > 0
  };
}


function Header({ config }: { config: any }) {
  return (
    <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur supports-[backdrop-filter]:bg-surface/60 border-b border-light">
      <div className="mx-auto max-w-screen-sm px-3 py-2 flex items-center justify-between">
        <Link href="/" aria-label="Trang chủ" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl border border-light shadow-sm bg-surface">
            {config.logo}
          </span>
          <span className="font-semibold tracking-tight text-body-primary">{config.name}</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/chuyen-muc" className="text-sm text-body-secondary hover:text-primary transition-colors">Chuyên mục</Link>
          <Link href="/ve-chung-toi" className="text-sm text-body-secondary hover:text-primary transition-colors">About</Link>
        </nav>
      </div>
    </header>
  );
}

function SearchBar() {
  return (
    <form
      action="/search"
      method="GET"
      className="mx-auto max-w-screen-sm px-3 pt-3"
      role="search"
      aria-label="Tìm kiếm nội dung"
    >
      <label htmlFor="q" className="sr-only">
        Tìm kiếm
      </label>
      <div className="flex items-center gap-2 rounded-2xl border border-light bg-surface px-3 py-2 shadow-sm">
        <input
          id="q"
          name="q"
          type="search"
          placeholder="Tìm bài viết, chủ đề..."
          className="w-full bg-transparent outline-none placeholder:text-muted text-sm text-body-primary"
          autoComplete="off"
          minLength={2}
        />
        <button
          type="submit"
          className="rounded-xl px-3 py-1.5 text-sm font-medium bg-primary text-white hover:bg-primary-dark transition-colors"
        >
          Tìm
        </button>
      </div>
    </form>
  );
}

function CategoryChips({ categories }: { categories: string[] }) {
  return (
    <div className="mx-auto max-w-screen-sm px-3 py-2 overflow-x-auto">
      <ul className="flex gap-2 whitespace-nowrap">
        {categories.map((c) => (
          <li key={c}>
            <Link
              href={`/chuyen-muc/${encodeURIComponent(c)}`}
              className="inline-flex items-center rounded-full border border-primary/20 px-3 py-1.5 text-sm hover:bg-primary/10 text-primary transition-colors"
            >
              {c}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}


function FooterNav() {
  return (
    <nav
      className="sticky bottom-0 z-50 mt-4 border-t border-light bg-surface/95 backdrop-blur"
      aria-label="Điều hướng dưới cùng"
    >
      <ul className="mx-auto flex max-w-screen-sm items-stretch justify-between px-6 py-2 text-xs">
        {[
          { label: "Trang chủ", href: "/", emoji: "🏠" },
          { label: "Danh mục", href: "/chuyen-muc", emoji: "🗂️" },
          { label: "Tìm kiếm", href: "/search", emoji: "🔎" },
          { label: "Tài khoản", href: "/tai-khoan", emoji: "👤" },
        ].map((i) => (
          <li key={i.href}>
            <Link
              href={i.href}
              className="flex flex-col items-center rounded-xl px-3 py-1.5 hover:bg-primary/10 transition-colors"
            >
              <span aria-hidden>{i.emoji}</span>
              <span className="mt-0.5 text-[11px] text-body-secondary">{i.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default async function Home({ searchParams }: { searchParams?: Promise<{ page?: string }> }) {
  const headersList = await headers();
  const hostname = headersList.get('host') || '';
  
  // Await searchParams before accessing its properties
  const resolvedSearchParams = await searchParams;
  console.log('hostname', resolvedSearchParams?.page);
  
  // Get current page from search params
  let currentPage = 0;
  if (resolvedSearchParams != null && resolvedSearchParams?.page != null)
    currentPage = parseInt(resolvedSearchParams?.page || '0', 10);
  
  // Load domain config
  let config;
  if (process.env.NODE_ENV === 'development') {
    const { getDomainConfig } = await import('@/lib/domain-config');
    config = await getDomainConfig(hostname);
  } else {
    config = getDomainConfigSync(hostname);
  }

  // Fetch API data in parallel
  const [latestStoriesResponse, topFollowResponse, topDayResponse] = await Promise.allSettled([
    fetchLatestStories(22, currentPage),
    fetchTopFollowStories(10, 0),
    fetchTopDayStories(100)
  ]);

  // Extract data from responses
  const latestStories = latestStoriesResponse.status === 'fulfilled' ? latestStoriesResponse.value : { data: [], total: 0, page: currentPage, limit: 22 };
  const topFollowStories = topFollowResponse.status === 'fulfilled' ? topFollowResponse.value.data : [];
  const topDayStories = topDayResponse.status === 'fulfilled' ? topDayResponse.value.data : [];

  // Calculate pagination for latest stories
  const pagination = calculatePagination(currentPage, latestStories.total || 0, 22);

  const siteLd = {
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
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Trang chủ",
        item: `https://${config.domain}/`,
      },
    ],
  };

  return (
    <>
      <SEOHead />
      
      {/* Add JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      
      <div className="min-h-dvh bg-background text-body-primary">
        <Header config={config} />
        <main>
          <SearchBar />
          <CategoryChips categories={config.content.categories} />
          
          {/* API Data Handler with enhanced client-side functionality */}
          <ClientOnly fallback={
            <div className="mx-auto max-w-screen-sm px-3 py-8 text-center">
              <div className="text-muted">Đang tải dữ liệu...</div>
            </div>
          }>
            <ApiErrorBoundary>
              <ApiDataHandler
                initialLatestStories={latestStories.data}
                initialTopFollow={topFollowStories}
                initialTopDay={topDayStories}
                initialPage={currentPage}
                initialTotal={latestStories.total || 0}
              />
            </ApiErrorBoundary>
          </ClientOnly>
          
         
        </main>
        <FooterNav />
      </div>
      
      {/* Cache Debug Component - chỉ hiển thị trong development */}
      <ClientOnly>
        <CacheDebug hostname={hostname} config={config} />
      </ClientOnly>
    </>
  );
}

