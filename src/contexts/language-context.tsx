'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

type Language = 'vi' | 'en';

interface LanguageContextType {
  currentLang: Language;
  changeLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Default language for server-side rendering
const DEFAULT_LANGUAGE: Language = 'vi';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLang, setCurrentLang] = useState<Language>(DEFAULT_LANGUAGE);

  useEffect(() => {
    // Only run on client-side
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('language');
      if (savedLang === 'en' || savedLang === 'vi') {
        setCurrentLang(savedLang);
      } else {
        // Detect browser language
        const browserLang = navigator.language;
        const lang = browserLang.startsWith('vi') ? 'vi' : 'en';
        setCurrentLang(lang);
      }
    }
  }, []);

  const changeLanguage = (lang: Language) => {
    setCurrentLang(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
    }
  };

  return (
    <LanguageContext.Provider value={{ currentLang, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  
  // Return default language during server-side rendering
  if (context === undefined) {
    return {
      currentLang: DEFAULT_LANGUAGE,
      changeLanguage: () => {
        // No-op during server-side rendering
        if (typeof window === 'undefined') {
          console.warn('changeLanguage called during server-side rendering');
        }
      }
    };
  }
  
  return context;
}