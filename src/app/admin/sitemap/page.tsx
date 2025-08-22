'use client';

import { useState, useEffect } from 'react';

interface SitemapStats {
  domain: string;
  articlesCount: number;
  sitemapPagesCount: number;
  cacheStats: {
    domains: number;
    totalSize: number;
  };
}

interface SitemapCache {
  lastGenerated: number;
  totalArticles: number;
  totalPages: number;
  isGenerating: boolean;
}

export default function SitemapAdmin() {
  const [stats, setStats] = useState<SitemapStats | null>(null);
  const [cache, setCache] = useState<SitemapCache | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSitemapStats();
  }, []);

  const fetchSitemapStats = async () => {
    setLoading(true);
    try {
      const hostname = window.location.hostname;
      const response = await fetch(`/api/sitemap-manager?hostname=${hostname}`);
      const data = await response.json();
      
      if (data.cache) {
        setCache(data.cache);
      }
      
      if (data.stats) {
        setStats({
          domain: data.domain,
          articlesCount: 0,
          sitemapPagesCount: 0,
          cacheStats: data.stats,
        });
      }
    } catch (error) {
      console.error('Error fetching sitemap stats:', error);
      setMessage('Lỗi khi tải thống kê sitemap');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string) => {
    setLoading(true);
    setMessage('');
    
    try {
      const hostname = window.location.hostname;
      const response = await fetch(`/api/sitemap-manager?hostname=${hostname}&action=${action}`, {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage(data.message);
        await fetchSitemapStats(); // Refresh stats
      } else {
        setMessage(data.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error performing action:', error);
      setMessage('Lỗi khi thực hiện hành động');
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('vi-VN');
  };

  return (
         <div className="min-h-screen bg-gray-50 p-4">
       <div className="max-w-4xl mx-auto">
         <h1 className="text-2xl font-bold mb-6 text-green-700">Quản lý Sitemap</h1>
        
        {message && (
          <div className={`mb-4 p-3 rounded-md ${
            message.includes('Lỗi') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {message}
          </div>
        )}
        
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {/* Sitemap Stats */}
           <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
             <h2 className="text-lg font-semibold mb-4 text-green-700">Thống kê Sitemap</h2>
            
                         {loading ? (
               <div className="text-center py-8">
                 <div className="text-gray-600">Đang tải...</div>
               </div>
            ) : stats ? (
              <div className="space-y-3">
                                 <div className="flex justify-between">
                   <span className="text-green-700 font-medium">Domain:</span>
                   <span className="font-medium text-green-600">{stats.domain}</span>
                 </div>
                                 <div className="flex justify-between">
                   <span className="text-green-700 font-medium">Tổng bài viết:</span>
                   <span className="font-medium text-green-600">{stats.articlesCount.toLocaleString()}</span>
                 </div>
                                 <div className="flex justify-between">
                   <span className="text-green-700 font-medium">Số file sitemap:</span>
                   <span className="font-medium text-green-600">{stats.sitemapPagesCount}</span>
                 </div>
                                 <div className="flex justify-between">
                   <span className="text-green-700 font-medium">Domains cached:</span>
                   <span className="font-medium text-green-600">{stats.cacheStats.domains}</span>
                 </div>
                                 <div className="flex justify-between">
                   <span className="text-green-700 font-medium">Cache size:</span>
                   <span className="font-medium text-green-600">{formatBytes(stats.cacheStats.totalSize)}</span>
                 </div>
              </div>
                         ) : (
               <div className="text-center py-8 text-gray-600">
                 Không có dữ liệu
               </div>
             )}
          </div>

                     {/* Cache Info */}
           <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
             <h2 className="text-lg font-semibold mb-4 text-green-700">Thông tin Cache</h2>
            
            {cache ? (
                             <div className="space-y-3">
                 <div className="flex justify-between">
                   <span className="text-green-700 font-medium">Trạng thái:</span>
                   <span className={`font-medium ${
                     cache.isGenerating ? 'text-yellow-600' : 'text-green-600'
                   }`}>
                     {cache.isGenerating ? 'Đang tạo...' : 'Sẵn sàng'}
                   </span>
                 </div>
                                 <div className="flex justify-between">
                   <span className="text-green-700 font-medium">Lần tạo cuối:</span>
                   <span className="font-medium text-green-600">{formatDate(cache.lastGenerated)}</span>
                 </div>
                                 <div className="flex justify-between">
                   <span className="text-green-700 font-medium">Tổng bài viết:</span>
                   <span className="font-medium text-green-600">{cache.totalArticles.toLocaleString()}</span>
                 </div>
                                 <div className="flex justify-between">
                   <span className="text-green-700 font-medium">Tổng trang sitemap:</span>
                   <span className="font-medium text-green-600">{cache.totalPages}</span>
                 </div>
              </div>
                         ) : (
               <div className="text-center py-8 text-gray-600">
                 Chưa có cache
               </div>
             )}
          </div>
        </div>

                 {/* Actions */}
         <div className="mt-6 bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
           <h2 className="text-lg font-semibold mb-4 text-green-700">Hành động</h2>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleAction('regenerate')}
              disabled={loading}
                             className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              Tạo lại Cache
            </button>
            
            <button
              onClick={() => handleAction('invalidate')}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              Xóa Cache
            </button>
            
            <button
              onClick={() => handleAction('stats')}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              Cập nhật Thống kê
            </button>
          </div>
        </div>

                 {/* Sitemap Links */}
         <div className="mt-6 bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
           <h2 className="text-lg font-semibold mb-4 text-green-700">Liên kết Sitemap</h2>
          
          <div className="space-y-2">
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
                             className="block text-green-600 hover:text-green-800"
            >
              Sitemap Index (sitemap.xml)
            </a>
            
            {cache && Array.from({ length: Math.min(cache.totalPages, 5) }, (_, i) => (
              <a
                key={i + 1}
                href={`/sitemap-articles-${i + 1}.xml`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-green-600 hover:text-green-800"
              >
                Sitemap Articles {i + 1} (sitemap-articles-{i + 1}.xml)
              </a>
            ))}
            
                         {cache && cache.totalPages > 5 && (
               <div className="text-gray-600 text-sm">
                 ... và {cache.totalPages - 5} file sitemap khác
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
} 