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

interface StoryRankingProps {
  stories: StoryItem[];
  maxItems?: number;
}

export function StoryRanking({ 
  stories, 
  maxItems = 15 
}: StoryRankingProps) {
  if (stories.length === 0) {
    return (
      <p className="text-muted text-center py-8">Không có dữ liệu</p>
    );
  }

  return (
    <div className="space-y-2">
      {stories.slice(0, maxItems).map((story, index) => (
        <StoryCard
          key={story.idDoc || index}
          story={story}
          index={index}
          showImages={false}
          variant="ranking"
        />
      ))}
    </div>
  );
}