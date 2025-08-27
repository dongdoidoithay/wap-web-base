'use client';

import { StoryCard } from './story-card';

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
}

interface StoryGridProps {
  stories: StoryItem[];
  maxItems?: number;
  columns?: number;
}

export function StoryGrid({ 
  stories, 
  maxItems = 10, 
  columns = 2 
}: StoryGridProps) {
  if (stories.length === 0) {
    return (
      <p className="text-muted text-center py-8">Không có dữ liệu</p>
    );
  }

  const gridCols = columns === 2 ? 'grid-cols-2' : 
                   columns === 3 ? 'grid-cols-3' : 
                   columns === 4 ? 'grid-cols-4' : 'grid-cols-2';

  return (
    <div className={`grid ${gridCols} gap-3`}>
      {stories.slice(0, maxItems).map((story, index) => (
        <StoryCard
          key={story.idDoc || index}
          story={story}
          index={index}
          showImages={true}
          variant="grid"
        />
      ))}
    </div>
  );
}