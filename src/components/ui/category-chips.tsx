'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { setCurrentApiPath } from '@/services/story-api.service';
import { useLanguage } from '@/contexts/language-context';

interface CategoryChip {
  id: string;
  name: string;
  description: string;
  "api-path": string;
  "active-default"?: boolean;
  type?: string;
  lang?: string; // Language property - if not set, chip will show for all languages
}

interface CategoryChipsProps {
  cateChips: CategoryChip[];
}

export function CategoryChips({ cateChips }: CategoryChipsProps) {
  const [activeChipId, setActiveChipId] = useState<string | null>(null);
  const { currentLang, changeLanguage } = useLanguage();

  // Show all cateChips regardless of language
  const displayedCateChips = cateChips;

  // Load active chip from localStorage on component mount
  useEffect(() => {
    const savedApiPath = localStorage.getItem('selectedApiPath');
    if (savedApiPath) {
      const savedChip = displayedCateChips.find(chip => chip["api-path"] === savedApiPath);
      if (savedChip) {
        setActiveChipId(savedChip.id);
        // Save the type to localStorage if it exists
        if (savedChip.type) {
          localStorage.setItem('selectedChipType', savedChip.type);
        }
        // Set the current API path in the service
        setCurrentApiPath(savedApiPath);
      }
    } else {
      // If no saved API path, use the default active chip
      const defaultChip = displayedCateChips.find(chip => chip["active-default"]);
      if (defaultChip) {
        setActiveChipId(defaultChip.id);
        localStorage.setItem('selectedApiPath', defaultChip["api-path"]);
        // Save the type to localStorage if it exists
        if (defaultChip.type) {
          localStorage.setItem('selectedChipType', defaultChip.type);
        }
        // Set the current API path in the service
        setCurrentApiPath(defaultChip["api-path"]);
      }
    }
  }, [displayedCateChips]);

  const handleCategoryClick = useCallback((chip: CategoryChip) => {
    // Save the selected API path to localStorage
    localStorage.setItem('selectedApiPath', chip["api-path"]);
    
    // Save the type to localStorage if it exists
    if (chip.type) {
      localStorage.setItem('selectedChipType', chip.type);
    } else {
      // Remove the type from localStorage if it doesn't exist
      localStorage.removeItem('selectedChipType');
    }
    
    // Save the language to localStorage if it exists
    if (chip.lang) {
      localStorage.setItem('language', chip.lang);
      changeLanguage(chip.lang as 'vi' | 'en');
    }
    
    //set chip Id
    localStorage.setItem('selectedChipId', chip.id ||'');
    // Set the active chip
    setActiveChipId(chip.id);
    
    // Set the current API path in the service
    setCurrentApiPath(chip["api-path"]);
    
    // Refresh the page to apply the new API path
    window.location.reload();
  }, [changeLanguage]);

  if (!displayedCateChips || displayedCateChips.length === 0) {
    return null;
  }

  return (
    <div className="mx-auto max-w-screen-sm px-3 py-2 overflow-x-auto">
      <ul className="flex gap-2 whitespace-nowrap">
        {displayedCateChips.map((chip) => (
          <li key={chip.id}>
            <button
              onClick={() => handleCategoryClick(chip)}
              className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm transition-colors ${
                chip.id === activeChipId
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'border-primary/20 text-primary hover:bg-primary/10'
              }`}
            >
              {chip.name}
              {chip.id === activeChipId && (
                <span className="ml-1 text-xs">★</span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}