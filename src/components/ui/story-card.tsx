'use client';

import Link from 'next/link';
import Image from 'next/image';

interface StoryItem {
  idDoc?: string;
  name: string;
  url?: string;
  slug?: string;
  image?: string;
  thumbnail?: string;
  date?: string;
  updatedAt?: string;
  sortDesc?: string;
  auth?: string;
  authName?: string;
  genres?: string;
  genresName?: string;
  chapters?: number;
  views?: number;
  lastChapter?: string;
  follows?: number;
  status?: string;
  statusName?: string;
}

interface StoryCardProps {
  story: StoryItem;
  index: number;
  showImages: boolean;
  variant?: 'list' | 'grid' | 'ranking';
}

export function StoryCard({ story, index, showImages, variant = 'list' }: StoryCardProps) {
  
  // Generate proper link to story detail page
  const getStoryLink = (story: StoryItem) => {
    if (story.idDoc) {
      return `/${story.idDoc}`;
    }
    if (story.slug) {
      return `/${story.slug}`;
    }
    if (story.url && story.url.startsWith('/')) {
      return story.url;
    }
    // Fallback to idDoc if available
    return story.idDoc ? `/${story.idDoc}` : '#';
  };
  
  const href = getStoryLink(story);

  if (variant === 'grid') {
    return (
      <Link
        href={href}
        className="block rounded-xl border border-light bg-surface p-3 shadow-sm hover:bg-primary/5 transition-colors"
      >
        {story.image || story.thumbnail ? (
          <div className="relative w-full h-24 mb-2">
            <Image
              src={story.image || story.thumbnail}
              alt={story.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="rounded-lg object-cover"
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/placeholder.jpg';
              }}
            />
          </div>
        ) : (
          <div className="w-full h-24 rounded-lg bg-surface border border-light flex items-center justify-center mb-2">
            <span className="text-muted">📚</span>
          </div>
        )}
        
        <h3 className="text-sm font-semibold line-clamp-2 text-body-primary mb-1">
          {story.name}
        </h3>
        
        <div className="flex items-center justify-between text-xs text-muted">
          <span className="flex items-center gap-1">
            <span>❤️</span>
            <span>{story.follows?.toLocaleString() || '0'}</span>
          </span>
          {story.status && (
            <span className={`px-2 py-1 rounded text-xs ${
              story.status.toLowerCase().includes('hoàn') 
                ? 'bg-success/20 text-success' 
                : 'bg-warning/20 text-warning'
            }`}>
              {story.status}
            </span>
          )}
        </div>
      </Link>
    );
  }

  if (variant === 'ranking') {
    return (
      <Link
        href={href}
        className="flex items-center gap-3 rounded-xl border border-light bg-surface p-3 shadow-sm hover:bg-primary/5 transition-colors"
      >
        <div className="flex-shrink-0">
          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
            index < 3 ? 'bg-warning text-white' : 'bg-surface border border-light text-body-secondary'
          }`}>
            {index + 1}
          </span>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold line-clamp-1 text-body-primary">
            {story.name}
          </h3>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted">
            {story.views && (
              <span className="flex items-center gap-1">
                <span>👁️</span>
                <span>{story.views.toLocaleString()}</span>
              </span>
            )}
            {story.genres && <span>📁 {story.genresName}</span>}
          </div>
        </div>
      </Link>
    );
  }

  // Default list variant
  return (
    <div className={`${index > 0 ? 'border-t border-light' : ''}`}>
      <Link
        href={href}
        className={`block p-3 hover:bg-primary/5 transition-colors ${
          showImages ? 'flex gap-3' : ''
        }`}
      >
        {showImages && (story.image || story.thumbnail) && (
          <div className="flex-shrink-0 relative">
            <Image
              src={story.image || story.thumbnail}
              alt={story.name}
              width={112}
              height={80}
              sizes="112px"
              className="rounded-lg object-cover"
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/placeholder.jpg';
              }}
            />
          </div>
        )}
        
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-primary hover:text-primary-dark line-clamp-2 flex-1">
              {story.name}
            </h3>
            {story.date && (
              <time className="text-xs text-muted flex-shrink-0" dateTime={story.updatedAt}>
                {new Date(story.date).toLocaleDateString("vi-VN")}
              </time>
            )}
          </div>
         
          {story.sortDesc && (
            <p className="mt-1 text-sm text-body-secondary line-clamp-3">
              {story.sortDesc}
            </p>
          )}
          
          <div className="mt-2 flex items-center gap-4 text-xs text-muted">
            {story.auth && (
              <span className="flex items-center gap-1">
                <span>👤</span>
                <span>{story.authName}</span>
              </span>
            )}
            {story.genres && (
              <span className="flex items-center gap-1">
                <span>📁</span>
                <span>{story.genresName}</span>
              </span>
            )}
          {/*   {story.chapters && (
              <span className="flex items-center gap-1">
                <span>📖</span>
                <span>{story.chapters} chương</span>
              </span>
            )} */}
           {/*  {story.views && (
              <span className="flex items-center gap-1">
                <span>👁️</span>
                <span>{story.views.toLocaleString()}</span>
              </span>
            )} */}
          </div>
          
         {/*  {story.lastChapter && (
            <div className="mt-1 text-xs text-success">
              <span className="inline-flex items-center gap-1">
                <span>🆕</span>
                <span>Chương mới: {story.lastChapter}</span>
              </span>
            </div>
          )} */}
        </div>
      </Link>
    </div>
  );
}