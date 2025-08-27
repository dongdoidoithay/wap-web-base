'use client';

import { PerformanceIndicators } from './performance-indicators';

interface SectionControlsProps {
  showImages: boolean;
  onToggleImages: () => void;
  onRefresh: () => void;
  loading: boolean;
  lastResponseTime: number;
  cacheStatus: string;
}

export function SectionControls({
  showImages,
  onToggleImages,
  onRefresh,
  loading,
  lastResponseTime,
  cacheStatus
}: SectionControlsProps) {
  return (
    <>
      <PerformanceIndicators
        lastResponseTime={lastResponseTime}
        cacheStatus={cacheStatus}
      />
      <button
        onClick={onToggleImages}
        className={`px-3 py-1 rounded-md text-sm transition-colors ${
          showImages 
            ? 'bg-info text-white hover:bg-info/90'
            : 'bg-surface border border-light text-body-secondary hover:bg-primary/10'
        }`}
        title={showImages ? 'Ẩn ảnh' : 'Hiện ảnh'}
      >
        {showImages ? '🖼️ Ẩn ảnh' : '📝 Hiện ảnh'}
      </button>
      <button
        onClick={onRefresh}
        disabled={loading}
        className={`px-3 py-1 rounded-md text-sm transition-colors ${
          loading 
            ? 'bg-surface border border-light text-muted cursor-not-allowed'
            : 'bg-primary text-white hover:bg-primary/90'
        }`}
        title="Làm mới dữ liệu"
      >
        {loading ? '🔄 Đang tải...' : '🔄 Làm mới'}
      </button>
    </>
  );
}