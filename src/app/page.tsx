import Image from "next/image";

// File: app/page.tsx  (Next.js 13+ App Router)
// TailwindCSS mobile-first WAP template focused on content + SEO OnPage
// Quick setup (once): npx create-next-app@latest; npm i -D tailwindcss postcss autoprefixer; npx tailwindcss init -p
// In tailwind.config.js add: content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"]
// In globals.css add Tailwind base/components/utilities and set body bg/text.

import React from "react";
import Head from "next/head";
import Link from "next/link";

export const metadata = {
  title: "WAP Content Hub — Fast, Mobile-First, SEO Ready",
  description:
    "A lean Next.js + TailwindCSS template optimized for Core Web Vitals, schema, and content hubs.",
  metadataBase: new URL("https://example.com"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "WAP Content Hub — Fast, Mobile-First, SEO Ready",
    description:
      "A lean Next.js + TailwindCSS template optimized for Core Web Vitals, schema, and content hubs.",
    url: "https://example.com",
    siteName: "WAP Content Hub",
    images: [
      { url: "/og.jpg", width: 1200, height: 630, alt: "WAP Content Hub" },
    ],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WAP Content Hub — Fast, Mobile-First, SEO Ready",
    description:
      "A lean Next.js + TailwindCSS template optimized for Core Web Vitals, schema, and content hubs.",
    images: ["/og.jpg"],
  },
};

// Dummy data — replace with your CMS/API
const categories = [
  "Tin mới",
  "Hướng dẫn",
  "Đánh giá",
  "Mẹo vặt",
  "Phỏng vấn",
];

const articles = [
  {
    id: 1,
    title:
      "Tối ưu Core Web Vitals cho trang WAP trong 15 phút",
    excerpt:
      "Checklist nhanh: LCP, CLS, INP, lazy-load, critical CSS, font-display...",
    cover: "/images/lcp.jpg",
    href: "/bai-viet/core-web-vitals-15-phut",
    date: "2025-08-01",
    readingTime: "5 phút",
    category: "Hướng dẫn",
  },
  {
    id: 2,
    title: "Hướng dẫn cấu trúc Heading H1-H6 đúng chuẩn SEO",
    excerpt:
      "Cách phân tầng nội dung, tránh trùng lặp, tăng khả năng hiểu ngữ nghĩa.",
    cover: "/images/heading.jpg",
    href: "/bai-viet/heading-seo-prep",
    date: "2025-07-24",
    readingTime: "7 phút",
    category: "SEO",
  },
  {
    id: 3,
    title: "Schema Article & FAQ: tăng CTR và hiển thị rich result",
    excerpt:
      "Thêm JSON-LD, kiểm tra bằng Rich Results Test, lưu ý review.",
    cover: "/images/schema.jpg",
    href: "/bai-viet/schema-article-faq",
    date: "2025-07-18",
    readingTime: "6 phút",
    category: "Mẹo vặt",
  },
];

function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-100">
      <div className="mx-auto max-w-screen-sm px-3 py-2 flex items-center justify-between">
        <Link href="/" aria-label="Trang chủ" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl border border-gray-200 shadow-sm">🏷️</span>
          <span className="font-semibold tracking-tight">WAP Content Hub</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/chuyen-muc" className="text-sm text-gray-600 hover:text-gray-900">Chuyên mục</Link>
          <Link href="/ve-chung-toi" className="text-sm text-gray-600 hover:text-gray-900">About</Link>
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
      <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
        <input
          id="q"
          name="q"
          type="search"
          placeholder="Tìm bài viết, chủ đề..."
          className="w-full bg-transparent outline-none placeholder:text-gray-400 text-sm"
          autoComplete="off"
          minLength={2}
        />
        <button
          type="submit"
          className="rounded-xl px-3 py-1.5 text-sm font-medium border border-gray-200 hover:bg-gray-50"
        >
          Tìm
        </button>
      </div>
    </form>
  );
}

function CategoryChips() {
  return (
    <div className="mx-auto max-w-screen-sm px-3 py-2 overflow-x-auto">
      <ul className="flex gap-2 whitespace-nowrap">
        {categories.map((c) => (
          <li key={c}>
            <Link
              href={`/chuyen-muc/${encodeURIComponent(c)}`}
              className="inline-flex items-center rounded-full border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              {c}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Featured() {
  const a = articles[0];
  return (
    <section className="mx-auto max-w-screen-sm px-3 pt-3">
      <article className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <Link href={a.href} className="block">
          {/* Use next/image in real app for better perf */}
          <img
            src={a.cover}
            alt={a.title}
            loading="eager"
            className="aspect-[16/9] w-full object-cover"
          />
          <div className="p-4">
            <div className="mb-1 text-xs text-gray-500 flex items-center gap-2">
              <time dateTime={a.date}>{new Date(a.date).toLocaleDateString("vi-VN")}</time>
              <span>•</span>
              <span>{a.readingTime}</span>
            </div>
            <h2 className="text-lg font-semibold leading-snug">
              {a.title}
            </h2>
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">{a.excerpt}</p>
          </div>
        </Link>
      </article>
    </section>
  );
}

function ArticleList() {
  return (
    <section className="mx-auto max-w-screen-sm px-3 py-3">
      <ul className="grid gap-3">
        {articles.slice(1).map((a) => (
          <li key={a.id}>
            <Link
              href={a.href}
              className="flex gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm hover:bg-gray-50"
            >
              <img
                src={a.cover}
                alt={a.title}
                loading="lazy"
                className="h-20 w-28 rounded-xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="text-xs text-gray-500">
                  <time dateTime={a.date}>{new Date(a.date).toLocaleDateString("vi-VN")}</time>
                  <span className="mx-1">•</span>
                  <span>{a.readingTime}</span>
                </div>
                <h3 className="mt-0.5 line-clamp-2 font-semibold">
                  {a.title}
                </h3>
                <p className="mt-0.5 line-clamp-2 text-sm text-gray-600">
                  {a.excerpt}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function FooterNav() {
  return (
    <nav
      className="sticky bottom-0 z-50 mt-4 border-t border-gray-200 bg-white/95 backdrop-blur"
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
              className="flex flex-col items-center rounded-xl px-3 py-1.5 hover:bg-gray-50"
            >
              <span aria-hidden>{i.emoji}</span>
              <span className="mt-0.5 text-[11px] text-gray-700">{i.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function Home() {
  const siteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "WAP Content Hub",
    url: "https://example.com",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://example.com/search?q={search_term_string}",
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
        item: "https://example.com/",
      },
    ],
  };

  return (
    <>
      {/* Extra head tags (app router still allows <Head/> for custom tags) */}
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <script
          type="application/ld+json"
          // @ts-ignore
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteLd) }}
        />
        <script
          type="application/ld+json"
          // @ts-ignore
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        />
      </Head>

      <div className="min-h-dvh bg-gray-50 text-gray-900">
        <Header />
        <main>
          <SearchBar />
          <CategoryChips />
          <Featured />
          <ArticleList />
        </main>
        <FooterNav />
      </div>
    </>
  );
}

// --- Notes ---
// 1) Replace dummy data with your source (CMS, DB). Stream content with Next.js fetch caching for speed.
// 2) For images, switch <img> to next/image for auto-optimized images.
// 3) Add pagination (cursor/offset) for article list. Pre-render critical pages (SSG/ISR) for SEO.
// 4) Use <link rel="preconnect"> to your CDN and font host. Prefer system fonts to avoid FOIT.
// 5) Monitor CWV: use next/script to inject Analytics (GTM/Gtag) and measure LCP/INP.

