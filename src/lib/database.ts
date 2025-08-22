// Database service for articles
export interface Article {
  id: number;
  slug: string;
  title: string;
  updated_at: string;
  published_at: string;
  category?: string;
}

export interface SitemapPage {
  url: string;
  lastModified: string;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

// Mock database functions - replace with your actual database connection
export async function getArticlesCount(): Promise<number> {
  // Replace with your actual database query
  // Example: SELECT COUNT(*) FROM articles WHERE status = 'published'
  return 1500000; // Mock: 1.5 million articles
}

export async function getArticlesByPage(page: number, limit: number = 50000): Promise<Article[]> {
  // Replace with your actual database query
  // Example: SELECT id, slug, title, updated_at, published_at, category 
  // FROM articles 
  // WHERE status = 'published' 
  // ORDER BY published_at DESC 
  // LIMIT ? OFFSET ?
  
  const offset = (page - 1) * limit;
  
  // Mock data - replace with actual database call
  const mockArticles: Article[] = [];
  for (let i = 0; i < limit; i++) {
    const id = offset + i + 1;
    mockArticles.push({
      id,
      slug: `bai-viet-${id}`,
      title: `Bài viết số ${id}`,
      updated_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      published_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      category: ['Tin tức', 'Hướng dẫn', 'Đánh giá', 'Mẹo vặt'][Math.floor(Math.random() * 4)],
    });
  }
  
  return mockArticles;
}

export async function getCategories(): Promise<string[]> {
  // Replace with your actual database query
  // Example: SELECT DISTINCT category FROM articles WHERE status = 'published'
  return ['Tin tức', 'Hướng dẫn', 'Đánh giá', 'Mẹo vặt', 'Phỏng vấn'];
}

export async function getStaticPages(): Promise<string[]> {
  return [
    '',
    '/chuyen-muc',
    '/ve-chung-toi',
    '/search',
    '/tai-khoan',
  ];
}

// Calculate total pages for sitemap
export async function getSitemapPagesCount(): Promise<number> {
  const articlesCount = await getArticlesCount();
  const articlesPerSitemap = 50000; // Google recommends max 50,000 URLs per sitemap
  return Math.ceil(articlesCount / articlesPerSitemap);
} 