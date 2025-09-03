'use client';

import { PerformanceIndicators } from './performance-indicators';
import { useLanguage } from '@/contexts/language-context';
import { TextConstants } from '@/lib/text-constants';

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
  const { currentLang } = useLanguage();
  
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
        title={showImages ? TextConstants.sectionControls.hide_images[currentLang] : TextConstants.sectionControls.show_images[currentLang]}
      >
        {showImages ? TextConstants.sectionControls.hide_images_button[currentLang] : TextConstants.sectionControls.show_images_button[currentLang]}
      </button>
      <button
        onClick={onRefresh}
        disabled={loading}
        className={`px-3 py-1 rounded-md text-sm transition-colors ${
          loading 
            ? 'bg-surface border border-light text-muted cursor-not-allowed'
            : 'bg-primary text-white hover:bg-primary/90'
        }`}
        title={TextConstants.sectionControls.refresh_title[currentLang]}
      >
        {loading ? TextConstants.sectionControls.refresh_loading[currentLang] : TextConstants.sectionControls.refresh_button[currentLang]}
      </button>
    </>
  );
}