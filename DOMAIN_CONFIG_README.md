# Domain Configuration System

## Tổng quan

Hệ thống domain configuration đã được cải tiến để cho phép quản lý động các cấu hình domain thông qua file JSON và giao diện admin.

## Cấu trúc file

### 1. File cấu hình chính
- **`public/domains-config.json`**: File JSON chứa tất cả cấu hình domains
- **`src/lib/domain-config.ts`**: Module chính xử lý domain configuration

### 2. API Routes
- **`/api/domains`**: CRUD cơ bản cho domains
- **`/api/domains/add`**: Thêm domain mới
- **`/api/domains/update`**: Cập nhật cấu hình domain
- **`/api/domains/delete`**: Xóa domain

### 3. Giao diện Admin
- **`src/app/admin/domains/page.tsx`**: Trang quản lý domains

## Cách sử dụng

### 1. Quản lý qua Admin Panel

Truy cập `/admin/domains` để:
- Xem danh sách tất cả domains
- Chỉnh sửa cấu hình domain
- Thêm domain mới
- Xóa domain (không thể xóa domain mặc định `example.com`)

### 2. Sử dụng trong code

#### Async functions (khuyến nghị cho API routes):
```typescript
import { getDomainConfig, getAllDomains } from '../lib/domain-config';

// Lấy cấu hình domain
const config = await getDomainConfig('example.com');

// Lấy danh sách tất cả domains
const domains = await getAllDomains();
```

#### Sync functions (cho middleware, layout, components):
```typescript
import { getDomainConfigSync, getAllDomainsSync } from '../lib/domain-config';

// Lấy cấu hình domain
const config = getDomainConfigSync('example.com');

// Lấy danh sách tất cả domains
const domains = getAllDomainsSync();
```

### 3. Cập nhật cấu hình programmatically

```typescript
import { updateDomainConfig, addDomain, deleteDomain } from '../lib/domain-config';

// Cập nhật domain
await updateDomainConfig('example.com', newConfig);

// Thêm domain mới
await addDomain('newsite.com', newConfig);

// Xóa domain
await deleteDomain('oldsite.com');
```

## Cấu trúc DomainConfig

```typescript
interface DomainConfig {
  domain: string;
  name: string;
  description: string;
  logo: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogImage: string;
    twitterHandle?: string;
    googleAnalyticsId?: string;
  };
  content: {
    categories: string[];
    featuredArticles: number[];
  };
  social: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
}
```

## Cache System

Hệ thống sử dụng cache để tối ưu hiệu suất:
- Cấu hình được cache trong memory sau lần đọc đầu tiên
- Cache được tự động cập nhật khi có thay đổi
- Fallback config được sử dụng nếu không thể đọc file JSON

## Lưu ý

1. **Domain mặc định**: `example.com` không thể bị xóa
2. **File permissions**: Đảm bảo file `domains-config.json` có quyền ghi
3. **Backup**: Nên backup file cấu hình trước khi thay đổi lớn
4. **Validation**: Cấu hình mới sẽ được validate trước khi lưu

## Troubleshooting

### Lỗi "Failed to load domain configs"
- Kiểm tra file `public/domains-config.json` có tồn tại không
- Kiểm tra quyền đọc file
- Kiểm tra cú pháp JSON

### Lỗi "Failed to update domain config"
- Kiểm tra quyền ghi file
- Kiểm tra disk space
- Kiểm tra cú pháp cấu hình

### Cache không cập nhật
- Restart server để clear cache
- Kiểm tra API response
- Kiểm tra console errors
