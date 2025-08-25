# Hướng dẫn xử lý vấn đề Cache Domain Config

## Vấn đề thường gặp

Khi bạn thay đổi cấu hình domain trong admin panel (`/admin/domains`) nhưng trang chính (`/`) không cập nhật, đây là vấn đề về cache.

## Nguyên nhân

1. **Memory Cache**: Domain config được cache trong memory của server
2. **File Cache**: Next.js có thể cache file JSON
3. **Browser Cache**: Browser cache response từ API

## Giải pháp

### 1. Sử dụng Force Refresh (Khuyến nghị)

Trong trang admin domains (`/admin/domains`):
- Nhấn nút **"Force Refresh"** (màu đỏ) để xóa hoàn toàn cache
- Nút này sẽ gọi API `/api/domains/force-refresh`

### 2. Sử dụng Refresh Cache thông thường

- Nhấn nút **"Refresh cache"** (màu xanh) để reload cache

### 3. Force Refresh từ trang chính (Development)

Trong môi trường development, bạn sẽ thấy nút **"🐛 Cache Debug"** ở góc phải dưới:
- Nhấn để mở debug panel
- Nhấn **"Force Refresh Cache"** để xóa cache

### 4. Gọi API trực tiếp

```bash
# Force refresh cache
curl -X POST http://localhost:3000/api/domains/force-refresh

# Reload cache thông thường
curl -X POST http://localhost:3000/api/domains/reload
```

## Cách hoạt động

### Cache Flow
1. **Server Start**: Load domain config từ file JSON vào memory
2. **Page Request**: Sử dụng config từ memory cache
3. **Admin Update**: Cập nhật file JSON + xóa memory cache
4. **Force Refresh**: Xóa memory cache + reload từ file

### API Endpoints
- `POST /api/domains/force-refresh` - Xóa hoàn toàn cache
- `POST /api/domains/reload` - Reload cache
- `POST /api/domains/update` - Cập nhật domain + xóa cache
- `POST /api/domains/delete` - Xóa domain + xóa cache
- `POST /api/domains/add` - Thêm domain + xóa cache

## Debug

### Kiểm tra Console
```javascript
// Trong browser console
fetch('/api/domains/force-refresh', { method: 'POST' })
  .then(r => r.json())
  .then(console.log);
```

### Kiểm tra Network Tab
- Mở DevTools > Network
- Thực hiện force refresh
- Kiểm tra response của API call

### Kiểm tra File
```bash
# Xem nội dung file config
cat public/domains-config.json

# Test với script
node test-cache.js
```

## Troubleshooting

### Vẫn không thấy thay đổi?

1. **Restart Development Server**
   ```bash
   # Dừng server (Ctrl+C)
   npm run dev
   ```

2. **Clear Browser Cache**
   - Hard refresh (Ctrl+Shift+R)
   - Clear browser cache
   - Incognito mode

3. **Kiểm tra File Permissions**
   - Đảm bảo file `domains-config.json` có thể ghi
   - Kiểm tra quyền write

4. **Kiểm tra Environment**
   - Đảm bảo `NODE_ENV=development`
   - Kiểm tra `NEXT_PUBLIC_BASE_URL`

### Logs
Kiểm tra console log của server để thấy:
- Cache refresh status
- File read/write errors
- API call results

## Best Practices

1. **Luôn sử dụng Force Refresh** sau khi thay đổi domain config
2. **Kiểm tra response** của API calls
3. **Monitor cache status** trong development
4. **Test với multiple domains** để đảm bảo cache hoạt động đúng

## Cấu trúc Cache

```typescript
// Memory cache structure
let domainConfigsCache: Record<string, DomainConfig> | null = null;

// Cache lifecycle
1. null → load from file → cache in memory
2. cached → serve from memory
3. force refresh → null → reload from file
```
