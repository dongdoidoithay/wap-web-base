// Script test để kiểm tra cache domain config
// Chạy: node test-cache.js

const fs = require('fs');
const path = require('path');

// Đọc file cấu hình domains
const configPath = path.join(__dirname, 'public', 'domains-config.json');
const domainsConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

console.log('=== DOMAIN CONFIG TEST ===');
console.log('File path:', configPath);
console.log('Domains found:', Object.keys(domainsConfig));
console.log('');

// Test từng domain
Object.entries(domainsConfig).forEach(([domain, config]) => {
  console.log(`Domain: ${domain}`);
  console.log(`  Name: ${config.name}`);
  console.log(`  Description: ${config.description}`);
  console.log(`  Logo: ${config.logo}`);
  console.log(`  Categories: ${config.content.categories.join(', ')}`);
  console.log('');
});

// Test cache invalidation
console.log('=== CACHE INVALIDATION TEST ===');
console.log('Để test cache:');
console.log('1. Thay đổi cấu hình trong admin panel');
console.log('2. Nhấn "Force Refresh" button');
console.log('3. Hoặc gọi API: POST /api/domains/force-refresh');
console.log('4. Refresh trang để thấy thay đổi');
console.log('');
console.log('Nếu vẫn không thấy thay đổi:');
console.log('- Kiểm tra console log');
console.log('- Kiểm tra network tab');
console.log('- Restart development server');
