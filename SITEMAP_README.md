# Hướng dẫn Sitemap cho Multi-Domain

## 🎯 Tổng quan

Hệ thống sitemap được thiết kế để xử lý hàng triệu bài viết từ database và tự động chia nhỏ thành nhiều file sitemap để tối ưu performance.

## 📊 Cấu trúc Sitemap

### 1. Sitemap Index (sitemap.xml)
- File chính chứa danh sách tất cả các sitemap con
- Bao gồm: static pages, category pages, và article sitemaps
- URL: `https://yourdomain.com/sitemap.xml`

### 2. Article Sitemaps (sitemap-articles-{page}.xml)
- Mỗi file chứa tối đa 50,000 bài viết (theo khuyến nghị của Google)
- Tự động chia nhỏ dựa trên số lượng bài viết
- URL: `https://yourdomain.com/sitemap-articles-1.xml`, `sitemap-articles-2.xml`, ...

### 3. Static & Category Pages
- Được include trong sitemap index
- Không cần file riêng vì số lượng ít

## 🗄️ Database Integration

### Cấu hình Database

Thay thế các hàm mock trong `src/lib/database.ts`:

```typescript
// Ví dụ với MySQL/PostgreSQL
export async function getArticlesCount(): Promise<number> {
  const result = await db.query(
    'SELECT COUNT(*) as count FROM articles WHERE status = ?',
    ['published']
  );
  return result[0].count;
}

export async function getArticlesByPage(page: number, limit: number = 50000): Promise<Article[]> {
  const offset = (page - 1) * limit;
  
  const result = await db.query(`
    SELECT 
      id, 
      slug, 
      title, 
      updated_at, 
      published_at, 
      category 
    FROM articles 
    WHERE status = 'published' 
    ORDER BY published_at DESC 
    LIMIT ? OFFSET ?
  `, [limit, offset]);
  
  return result;
}

export async function getCategories(): Promise<string[]> {
  const result = await db.query(`
    SELECT DISTINCT category 
    FROM articles 
    WHERE status = 'published' 
    AND category IS NOT NULL
  `);
  
  return result.map(row => row.category);
}
```

### Ví dụ với Prisma

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getArticlesCount(): Promise<number> {
  return await prisma.article.count({
    where: { status: 'published' }
  });
}

export async function getArticlesByPage(page: number, limit: number = 50000): Promise<Article[]> {
  const offset = (page - 1) * limit;
  
  const articles = await prisma.article.findMany({
    where: { status: 'published' },
    select: {
      id: true,
      slug: true,
      title: true,
      updatedAt: true,
      publishedAt: true,
      category: true,
    },
    orderBy: { publishedAt: 'desc' },
    skip: offset,
    take: limit,
  });
  
  return articles.map(article => ({
    id: article.id,
    slug: article.slug,
    title: article.title,
    updated_at: article.updatedAt.toISOString(),
    published_at: article.publishedAt.toISOString(),
    category: article.category,
  }));
}
```

## ⚡ Performance Optimization

### 1. Caching
- Sitemap cache được lưu trong memory với thời gian 24 giờ
- Tự động invalidate khi có thay đổi
- Giảm tải database queries

### 2. Pagination
- Mỗi sitemap file chứa tối đa 50,000 URLs
- Tự động tính toán số lượng file cần thiết
- Lazy loading cho từng page

### 3. Priority & Change Frequency
- Bài viết mới (< 7 ngày): priority 0.9, changefreq daily
- Bài viết gần đây (< 30 ngày): priority 0.8, changefreq weekly
- Bài viết cũ (> 90 ngày): priority 0.6, changefreq monthly

## 🔧 Quản lý Sitemap

### 1. Admin Panel
Truy cập `/admin/sitemap` để:
- Xem thống kê sitemap
- Quản lý cache
- Tạo lại sitemap
- Xem danh sách file sitemap

### 2. API Endpoints

```bash
# Lấy thông tin sitemap
GET /api/sitemap-manager?hostname=example.com

# Tạo lại cache
POST /api/sitemap-manager?hostname=example.com&action=regenerate

# Xóa cache
POST /api/sitemap-manager?hostname=example.com&action=invalidate

# Lấy thống kê
POST /api/sitemap-manager?hostname=example.com&action=stats
```

### 3. Sitemap URLs

```bash
# Sitemap index
https://example.com/sitemap.xml

# Article sitemaps
https://example.com/sitemap-articles-1.xml
https://example.com/sitemap-articles-2.xml
https://example.com/sitemap-articles-3.xml
# ... (tùy theo số lượng bài viết)
```

## 📈 Monitoring & Analytics

### 1. Google Search Console
- Submit sitemap index URL
- Monitor indexing status
- Track crawl errors

### 2. Performance Metrics
- Sitemap generation time
- Cache hit rate
- Database query performance

### 3. Error Handling
- Automatic retry cho failed requests
- Logging cho debugging
- Graceful degradation

## 🚀 Deployment

### 1. Production Setup

```bash
# Build application
npm run build

# Start production server
npm start

# Setup cron job để refresh cache
# 0 2 * * * curl -X POST https://yourdomain.com/api/sitemap-manager?hostname=yourdomain.com&action=regenerate
```

### 2. Nginx Configuration

```nginx
server {
    listen 80;
    server_name example.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Cache sitemap files
    location ~* \.(xml)$ {
        expires 1h;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3. CDN Configuration
- Cache sitemap files trên CDN
- Set appropriate cache headers
- Monitor cache hit rate

## 🔍 Troubleshooting

### 1. Sitemap không được tạo
- Kiểm tra database connection
- Verify domain configuration
- Check error logs

### 2. Performance issues
- Monitor database query performance
- Check cache hit rate
- Optimize database indexes

### 3. Google không index
- Verify sitemap format
- Check robots.txt
- Submit sitemap to Google Search Console

## 📝 Best Practices

### 1. Database Optimization
```sql
-- Index cho sitemap queries
CREATE INDEX idx_articles_status_published_at ON articles(status, published_at);
CREATE INDEX idx_articles_category ON articles(category);
```

### 2. Caching Strategy
- Cache sitemap data trong Redis/Memcached
- Set appropriate TTL
- Implement cache warming

### 3. Monitoring
- Set up alerts cho sitemap generation failures
- Monitor sitemap file sizes
- Track Google crawl stats

## 🎯 SEO Benefits

1. **Faster Indexing**: Google có thể crawl hiệu quả hơn
2. **Better Coverage**: Đảm bảo tất cả bài viết được index
3. **Priority Control**: Ưu tiên bài viết mới và quan trọng
4. **Multi-domain Support**: Mỗi domain có sitemap riêng

---

**Lưu ý**: Đảm bảo thay thế các hàm mock bằng database queries thực tế trước khi deploy production. 