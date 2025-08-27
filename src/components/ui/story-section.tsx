'use client';

import { ReactNode } from 'react';

interface StorySectionProps {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  error?: string | null;
  className?: string;
}

export function StorySection({
  title,
  children,
  actions,
  error,
  className = "mx-auto max-w-screen-sm px-3 py-3"
}: StorySectionProps) {
  return (
    <section className={className}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-body-primary">{title}</h2>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
      
      {error && (
        <div className="mb-4 p-3 rounded-md bg-error/10 text-error border border-error/20">
          <p className="text-sm">Lỗi: {error}</p>
        </div>
      )}
      
      {children}
    </section>
  );
}