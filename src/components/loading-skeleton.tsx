'use client';

export function StoryListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="border border-light rounded-lg overflow-hidden bg-surface">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className={`${index > 0 ? 'border-t border-light' : ''} p-3 animate-pulse`}>
          <div className="flex items-start justify-between gap-2 mb-2">
            {/* Title skeleton */}
            <div className="flex-1">
              <div className="h-5 bg-light rounded mb-1 w-3/4"></div>
              <div className="h-5 bg-light rounded w-1/2"></div>
            </div>
            {/* Date skeleton */}
            <div className="h-3 bg-light rounded w-16 flex-shrink-0"></div>
          </div>
          
          {/* Description skeleton */}
          <div className="h-4 bg-light rounded mb-2 w-5/6"></div>
          
          {/* Metadata skeleton */}
          <div className="flex items-center gap-4">
            <div className="h-3 bg-light rounded w-16"></div>
            <div className="h-3 bg-light rounded w-20"></div>
            <div className="h-3 bg-light rounded w-16"></div>
            <div className="h-3 bg-light rounded w-24"></div>
          </div>
          
          {/* New chapter skeleton */}
          <div className="mt-1 h-3 bg-light rounded w-32"></div>
        </div>
      ))}
    </div>
  );
}

export function QuickLoadingSkeleton() {
  return (
    <div className="mx-auto max-w-screen-sm px-3 py-3">
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 bg-light rounded w-48 animate-pulse"></div>
        <div className="flex items-center gap-2">
          <div className="h-8 bg-light rounded w-20 animate-pulse"></div>
          <div className="h-8 bg-light rounded w-20 animate-pulse"></div>
        </div>
      </div>
      <StoryListSkeleton count={5} />
    </div>
  );
}