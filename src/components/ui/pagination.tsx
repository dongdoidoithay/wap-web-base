'use client';

import { useLanguage } from '@/contexts/language-context';
import { TextConstants } from '@/lib/text-constants';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  loading: boolean;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  loading,
  onPageChange
}: PaginationProps) {
  const { currentLang } = useLanguage();
  
  if (totalPages <= 1) {
    return null;
  }
  console.log('Pagination', { currentPage, totalPages, loading });

  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      <button
        onClick={() => {
          console.log(`[Pagination] Previous button clicked: ${currentPage - 1}`);
          onPageChange(currentPage - 1);
        }}
        disabled={loading || currentPage <= 0}
        className={`px-3 py-2 rounded-md text-sm transition-colors ${
          currentPage > 0 && !loading
            ? 'bg-primary text-white hover:bg-primary/90' 
            : 'bg-surface border border-light text-muted cursor-not-allowed'
        }`}
      >
        ← {TextConstants.pagination.previous[currentLang]}
      </button>
      
      <span className="px-3 py-2 text-sm text-body-secondary">
        {TextConstants.pagination.page_info[currentLang]
          .replace('{currentPage}', (currentPage + 1).toString())
          .replace('{totalPages}', totalPages.toString())}
      </span>
      
      <button
        onClick={() => {
          console.log(`[Pagination] Next button clicked: ${currentPage + 1}`);
          onPageChange(currentPage + 1);
        }}
        disabled={loading || currentPage >= totalPages - 1}
        className={`px-3 py-2 rounded-md text-sm transition-colors ${
          currentPage < totalPages - 1 && !loading
            ? 'bg-primary text-white hover:bg-primary/90' 
            : 'bg-surface border border-light text-muted cursor-not-allowed'
        }`}
      >
        {TextConstants.pagination.next[currentLang]} →
      </button>
    </div>
  );
}