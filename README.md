# WAP Web Base - Multi-Domain SEO Optimized

Một web app Next.js tối ưu cho SEO với khả năng xử lý nhiều domain trỏ vào cùng một bản build.

## 🚀 Tính năng chính

### SEO Tối ưu
- ✅ Metadata động cho từng domain
- ✅ Open Graph và Twitter Cards
- ✅ Schema.org JSON-LD
- ✅ Sitemap.xml động
- ✅ Robots.txt động
- ✅ Google Analytics riêng cho từng domain
- ✅ Core Web Vitals tối ưu
- ✅ PWA ready

### Multi-Domain
- ✅ Hỗ trợ nhiều domain trên cùng một build
- ✅ Cấu hình SEO riêng cho từng domain
- ✅ Theme và branding khác nhau
- ✅ Content categories riêng biệt
- ✅ Social media links riêng

## 📁 Cấu trúc dự án

```
src/
├── app/
│   ├── admin/domains/     # Trang quản lý domain
│   ├── api/domains/       # API quản lý domain
│   ├── layout.tsx         # Layout với metadata động
│   ├── page.tsx           # Trang chủ
│   ├── robots.ts          # Robots.txt động
│   └── sitemap.ts         # Sitemap động
├── components/
│   └── seo-head.tsx       # Component SEO
├── hooks/
│   └── use-domain.ts      # Hook lấy thông tin domain
├── lib/
│   └── domain-config.ts   # Cấu hình domain
└── middleware.ts          # Middleware xử lý domain
```

## 🛠️ Cài đặt

```bash
# Clone dự án
git clone <repository-url>
cd wap-web-base

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build production
npm run build

# Start production server
npm start
```

## ⚙️ Cấu hình Domain

### 1. Thêm domain mới

Chỉnh sửa file `src/lib/domain-config.ts`:

```typescript
export const domainConfigs: Record<string, DomainConfig> = {
  'yourdomain.com': {
    domain: 'yourdomain.com',
    name: 'Your Website Name',
    description: 'Your website description',
    logo: '🎯',
    theme: {
      primaryColor: '#FF6B6B',
      secondaryColor: '#4ECDC4',
    },
    seo: {
      title: 'Your SEO Title',
      description: 'Your SEO description',
      keywords: ['keyword1', 'keyword2'],
      ogImage: '/your-og-image.jpg',
      googleAnalyticsId: 'GA_YOUR_ID',
    },
    content: {
      categories: ['Category 1', 'Category 2'],
      featuredArticles: [1, 2, 3],
    },
    social: {
      facebook: 'https://facebook.com/yourpage',
      twitter: 'https://twitter.com/yourhandle',
    },
  },
};
```

### 2. Cấu hình DNS

Trỏ tất cả domain về cùng một server:

```bash
# Ví dụ với nginx
server {
    listen 80;
    server_name example.com techblog.com lifestyle.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 3. Cấu hình Next.js

Thêm vào `next.config.ts`:

```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

## 🔧 Sử dụng

### 1. Trang quản lý Domain

Truy cập `/admin/domains` để quản lý cấu hình domain:

- Xem danh sách domain
- Chỉnh sửa SEO settings
- Cập nhật Google Analytics ID
- Thay đổi theme colors

### 2. API Endpoints

```bash
# Lấy danh sách domain
GET /api/domains

# Lấy cấu hình domain cụ thể
GET /api/domains?hostname=example.com

# Cập nhật cấu hình domain
POST /api/domains
{
  "hostname": "example.com",
  "config": { ... }
}
```

### 3. Hook sử dụng trong components

```typescript
import { useDomain } from '../hooks/use-domain';

function MyComponent() {
  const config = useDomain();
  
  if (!config) return null;
  
  return (
    <div>
      <h1>{config.name}</h1>
      <p>{config.description}</p>
    </div>
  );
}
```

## 📊 SEO Features

### 1. Metadata động

Mỗi domain sẽ có:
- Title và description riêng
- Open Graph tags
- Twitter Cards
- Canonical URLs
- Schema.org markup

### 2. Sitemap động

Tự động tạo sitemap cho từng domain:
- Static pages
- Category pages
- Article pages
- Priority và change frequency

### 3. Robots.txt động

Cấu hình robots.txt riêng cho từng domain:
- Allow/disallow rules
- Sitemap location
- Host directive

## 🎨 Customization

### 1. Theme Colors

Thay đổi màu sắc cho từng domain:

```typescript
theme: {
  primaryColor: '#FF6B6B',    // Màu chính
  secondaryColor: '#4ECDC4',  // Màu phụ
}
```

### 2. Content Categories

Định nghĩa categories riêng cho từng domain:

```typescript
content: {
  categories: ['Tech', 'Programming', 'AI'],
  featuredArticles: [1, 2, 3],
}
```

### 3. Social Media

Cấu hình social media links:

```typescript
social: {
  facebook: 'https://facebook.com/yourpage',
  twitter: 'https://twitter.com/yourhandle',
  instagram: 'https://instagram.com/yourprofile',
  youtube: 'https://youtube.com/yourchannel',
}
```

## 🚀 Deployment

### 1. Vercel

```bash
# Deploy lên Vercel
vercel --prod
```

### 2. Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### 3. Nginx + PM2

```bash
# Build
npm run build

# Start với PM2
pm2 start npm --name "wap-web" -- start

# Nginx config
server {
    listen 80;
    server_name example.com techblog.com lifestyle.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 📈 Performance

### Core Web Vitals
- LCP: < 2.5s
- FID: < 100ms
- CLS: < 0.1

### Optimization
- Image optimization với Next.js
- Lazy loading
- Code splitting
- Static generation
- Incremental Static Regeneration

## 🔍 Monitoring

### 1. Google Analytics

Mỗi domain có GA ID riêng để theo dõi:
- Traffic sources
- User behavior
- Conversion tracking

### 2. Core Web Vitals

Monitor performance với:
- Google PageSpeed Insights
- Web Vitals
- Lighthouse

## 🤝 Contributing

1. Fork dự án
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## 📄 License

MIT License - xem file LICENSE để biết thêm chi tiết.

## 🆘 Support

Nếu có vấn đề, vui lòng:
1. Kiểm tra documentation
2. Tìm trong issues
3. Tạo issue mới với thông tin chi tiết

---

**Lưu ý**: Đây là template cơ bản, bạn cần customize theo nhu cầu cụ thể của dự án.
