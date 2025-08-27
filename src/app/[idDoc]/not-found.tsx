'use client';

import React from 'react';
import Link from 'next/link';
import { useDomain } from '@/hooks/use-domain';
import { SEOHead } from '@/components/seo-head';
import { Header, FooterNav } from '@/components/ui';

export default function StoryNotFound() {
  const domainConfig = useDomain();

  if (!domainConfig) {
    return (
      <div className="min-h-dvh bg-background text-body-primary flex items-center justify-center">
        <div className="text-center">
          <div className="text-muted">Đang tải...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title={`Không tìm thấy truyện | ${domainConfig.name}`}
        description="Truyện bạn đang tìm kiếm không tồn tại hoặc đã bị xóa"
        noindex={true}
      />
      
      <div className="min-h-dvh bg-background text-body-primary">
        <Header config={domainConfig} />
        
        <main className="flex-1">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto text-center">
              
              {/* 404 Icon */}
              <div className="text-8xl mb-8">📚</div>
              
              {/* Error Title */}
              <h1 className="text-4xl font-bold text-primary mb-4">
                Không tìm thấy truyện
              </h1>
              
              {/* Error Message */}
              <p className="text-lg text-muted mb-8 leading-relaxed">
                Rất tiếc, truyện bạn đang tìm kiếm không tồn tại hoặc đã bị xóa. 
                Có thể đường dẫn đã thay đổi hoặc truyện đã được gỡ bỏ khỏi hệ thống.
              </p>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link 
                  href="/"
                  className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  🏠 Về trang chủ
                </Link>
                
                <button 
                  onClick={() => window.history.back()}
                  className="inline-flex items-center px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90 transition-colors"
                >
                  ↩️ Quay lại
                </button>
              </div>
              
              {/* Suggestions */}
              <div className="mt-12 p-6 bg-card rounded-lg border">
                <h2 className="text-xl font-bold text-primary mb-4">Gợi ý cho bạn</h2>
                <div className="text-left space-y-2 text-sm text-muted">
                  <p>• Kiểm tra lại đường dẫn URL</p>
                  <p>• Tìm kiếm truyện bằng tên hoặc tác giả</p>
                  <p>• Duyệt qua danh sách truyện mới cập nhật</p>
                  <p>• Liên hệ với chúng tôi nếu bạn cho rằng đây là lỗi</p>
                </div>
              </div>
              
            </div>
          </div>
        </main>
        
        <FooterNav />
      </div>
    </>
  );
}