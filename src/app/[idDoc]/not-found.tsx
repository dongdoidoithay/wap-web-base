'use client';

import React from 'react';
import Link from 'next/link';
import { useDomain } from '@/hooks/use-domain';
import { SEOHead } from '@/components/seo-head';
import { Header, FooterNav } from '@/components/ui';
import { useLanguage } from '@/contexts/language-context';
import { TextConstants } from '@/lib/text-constants';

export default function StoryNotFound() {
  const { currentLang } = useLanguage();
  const domainConfig = useDomain();

  if (!domainConfig) {
    return (
      <div className="min-h-dvh bg-background text-body-primary flex items-center justify-center">
        <div className="text-center">
          <div className="text-muted">{TextConstants.common.loading[currentLang]}</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title={`${TextConstants.storyDetail.not_found_title[currentLang]} | ${domainConfig.name}`}
        description={TextConstants.storyDetail.not_found_message[currentLang]}
        noindex={true}
      />
      
      <div className="min-h-dvh bg-background text-body-primary">
        <Header config={domainConfig} />
        
        <main className="flex-1">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto text-center">
              
              {/* 404 Icon */}
              <div className="text-8xl mb-8">📚</div>
              
              {/* Error Title */}
              <h1 className="text-4xl font-bold text-primary mb-4">
                {TextConstants.storyDetail.not_found_title[currentLang]}
              </h1>
              
              {/* Error Message */}
              <p className="text-lg text-muted mb-8 leading-relaxed">
                {TextConstants.storyDetail.not_found_message[currentLang]}
              </p>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link 
                  href="/"
                  className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  🏠 {TextConstants.storyDetail.home_button[currentLang]}
                </Link>
                
                <button 
                  onClick={() => window.history.back()}
                  className="inline-flex items-center px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90 transition-colors"
                >
                  ↩️ {TextConstants.storyDetail.back_button[currentLang]}
                </button>
              </div>
              
              {/* Suggestions */}
              <div className="mt-12 p-6 bg-card rounded-lg border">
                <h2 className="text-xl font-bold text-primary mb-4">{TextConstants.storyDetail.suggestions_title[currentLang]}</h2>
                <div className="text-left space-y-2 text-sm text-muted">
                  <p>• {TextConstants.storyDetail.suggestion_check_url[currentLang]}</p>
                  <p>• {TextConstants.storyDetail.suggestion_search_story[currentLang]}</p>
                  <p>• {TextConstants.storyDetail.suggestion_browse_updates[currentLang]}</p>
                  <p>• {TextConstants.storyDetail.suggestion_contact_us[currentLang]}</p>
                </div>
              </div>
              
            </div>
          </div>
        </main>
        
        <FooterNav />
      </div>
    </>
  );
}