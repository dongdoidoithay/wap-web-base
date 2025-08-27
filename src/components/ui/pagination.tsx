'use client';

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
        ← Trước
      </button>
      
      <span className="px-3 py-2 text-sm text-body-secondary">
        Trang {currentPage + 1} / {totalPages}
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
        Tiếp →
      </button>
    </div>
  );
}