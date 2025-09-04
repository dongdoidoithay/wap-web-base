'use client';

import { useState, useEffect } from 'react';
import { SEOHead } from '@/components/seo-head'; // Added SEOHead import

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
    <>
      {/* Added SEOHead for admin sitemap page */}
      <SEOHead 
        title="Quản lý Sitemap - Trang quản trị"
        description="Quản lý và tạo sitemap cho hệ thống"
        noindex={true}
      />
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-primary">Quản lý Sitemap</h1>
         
         {message && (
           <div className={`mb-4 p-3 rounded-md ${
             message.includes('Lỗi') ? 'bg-error/10 text-error border border-error/20' : 'bg-success/10 text-success border border-success/20'
           }`}>
             {message}
           </div>
         )}
         
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sitemap Stats */}
            <div className="bg-surface rounded-lg shadow p-6 border-l-4 border-primary">
              <h2 className="text-lg font-semibold mb-4 text-primary">Thống kê Sitemap</h2>
             
              {loading ? (
                <div className="text-center py-8">
                  <div className="text-muted">Đang tải...</div>
                </div>
             ) : stats ? (
               <div className="space-y-3">
                 <div className="flex justify-between">
                   <span className="text-body-primary font-medium">Domain:</span>
                   <span className="font-medium text-primary">{stats.domain}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-body-primary font-medium">Tổng bài viết:</span>
                   <span className="font-medium text-primary">{stats.articlesCount.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-body-primary font-medium">Số file sitemap:</span>
                   <span className="font-medium text-primary">{stats.sitemapPagesCount}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-body-primary font-medium">Domains cached:</span>
                   <span className="font-medium text-primary">{stats.cacheStats.domains}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-body-primary font-medium">Cache size:</span>
                   <span className="font-medium text-primary">{formatBytes(stats.cacheStats.totalSize)}</span>
                 </div>
               </div>
              ) : (
                <div className="text-center py-8 text-muted">
                  Không có dữ liệu
                </div>
              )}
           </div>

            {/* Cache Info */}
            <div className="bg-surface rounded-lg shadow p-6 border-l-4 border-primary">
              <h2 className="text-lg font-semibold mb-4 text-primary">Thông tin Cache</h2>
             
             {cache ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-body-primary font-medium">Trạng thái:</span>
                    <span className={`font-medium ${
                      cache.isGenerating ? 'text-warning' : 'text-success'
                    }`}>
                      {cache.isGenerating ? 'Đang tạo...' : 'Sẵn sàng'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-body-primary font-medium">Lần tạo cuối:</span>
                    <span className="font-medium text-primary">{formatDate(cache.lastGenerated)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-body-primary font-medium">Tổng bài viết:</span>
                    <span className="font-medium text-primary">{cache.totalArticles.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-body-primary font-medium">Tổng trang sitemap:</span>
                    <span className="font-medium text-primary">{cache.totalPages}</span>
                  </div>
               </div>
              ) : (
                <div className="text-center py-8 text-muted">
                  Chưa có cache
                </div>
              )}
           </div>
         </div>

          {/* Actions */}
          <div className="mt-6 bg-surface rounded-lg shadow p-6 border-l-4 border-primary">
            <h2 className="text-lg font-semibold mb-4 text-primary">Hành động</h2>
           
           <div className="flex flex-wrap gap-3">
             <button
               onClick={() => handleAction('regenerate')}
               disabled={loading}
                            className="px-4 py-2 bg-success text-white rounded-md hover:bg-success/90 disabled:opacity-50 transition-colors"
             >
               Tạo lại Cache
             </button>
             
             <button
               onClick={() => handleAction('invalidate')}
               disabled={loading}
               className="px-4 py-2 bg-error text-white rounded-md hover:bg-error/90 disabled:opacity-50 transition-colors"
             >
               Xóa Cache
             </button>
             
             <button
               onClick={() => handleAction('stats')}
               disabled={loading}
               className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
             >
               Cập nhật Thống kê
             </button>
           </div>
         </div>

          {/* Sitemap Links */}
          <div className="mt-6 bg-surface rounded-lg shadow p-6 border-l-4 border-primary">
            <h2 className="text-lg font-semibold mb-4 text-primary">Liên kết Sitemap</h2>
           
           <div className="space-y-2">
             <a
               href="/sitemap.xml"
               target="_blank"
               rel="noopener noreferrer"
                            className="block text-link hover:text-link-hover transition-colors"
             >
               Sitemap Index (sitemap.xml)
             </a>
             
             {cache && Array.from({ length: Math.min(cache.totalPages, 5) }, (_, i) => (
               <a
                 key={i + 1}
                 href={`/sitemap-articles-${i + 1}.xml`}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="block text-link hover:text-link-hover transition-colors"
               >
                 Sitemap Articles {i + 1} (sitemap-articles-{i + 1}.xml)
               </a>
             ))}
             
             {cache && cache.totalPages > 5 && (
               <div className="text-muted text-sm">
                 ... và {cache.totalPages - 5} file sitemap khác
               </div>
             )}
           </div>
         </div>
       </div>
     </div>
   </>
  );
}