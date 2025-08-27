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

interface StoryListProps {
  stories: StoryItem[];
  showImages: boolean;
  loading?: boolean;
}

export function StoryList({ stories, showImages, loading = false }: StoryListProps) {
  if (loading) {
    return null; // Loading handled by parent component
  }

  if (stories.length === 0) {
    return (
      <p className="text-muted text-center py-8">Không có dữ liệu</p>
    );
  }

  return (
    <div className="border border-success rounded-lg overflow-hidden bg-surface">
      {stories.map((story, index) => (
        <StoryCard
          key={story.idDoc || index}
          story={story}
          index={index}
          showImages={showImages}
          variant="list"
        />
      ))}
    </div>
  );
}