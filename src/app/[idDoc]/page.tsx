'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import { SEOHead } from '@/components/seo-head';
import { useDomain } from '@/hooks/use-domain';
import { StoryListSkeleton } from '@/components/loading-skeleton';
import { ApiErrorBoundary } from '@/components/api-error-boundary';
import { Header, FooterNav } from '@/components/ui';
import { fetchStoryDetail, fetchStoryListChapter } from '@/services/story-detail.service';
import { getCachedStoryDetail } from '@/lib/cached-story-detail';
import { readingHistoryManager, createReadingHistoryItem } from '@/lib/reading-history';
import { TextConstants } from '@/lib/text-constants';
import { useLanguage } from '@/contexts/language-context';

interface StoryReadingPageProps {
  params: Promise<{
    idDoc: string;
  }>;
}

// TTS Interfaces
interface TTSState {
  isPlaying: boolean;
  isPaused: boolean;
  currentSentence: number;
  selectedVoice: string;
  rate: number;
  pitch: number;
  volume: number;
  autoNext: boolean;
  sentences: string[];
  availableVoices: SpeechSynthesisVoice[];
}

interface TTSControls {
  play: () => void;
  pause: () => void;
  stop: () => void;
  next: () => void;
  previous: () => void;
  setVoice: (voiceURI: string) => void;
  setRate: (rate: number) => void;
  setPitch: (pitch: number) => void;
  setVolume: (volume: number) => void;
  toggleAutoNext: () => void;
}

// Interfaces based on the actual API response
interface DetailDocument {
  slug: string;
  idDetail: string;
  idDoc: string;
  nameChapter: string;
  nameSeoChapter: string | null;
  nameDoc: string;
  view: number;
  value: any;
  date: string;
  url: string;
  urlDowload: string;
  source: string;
  lang: string;
  upVote: number;
  downVote: number;
  level: number;
  site: any;
  idDetailNext: string | null;
  idDetailPrev: string | null;
  nameDetailNext: string | null;
  nameDetailPrev: string | null;
  totalChapters: number;
  currentChapterIndex: number;
}

interface InfoDoc {
  idDoc: string;
  name: string;
  nameOther: string;
  nameSeo: string;
  image: string;
  desc: string;
  sortDesc: string;
  auth: string;
  authName: string;
  genres: string;
  genresName: string;
  year: string;
  view: number;
  art: string;
  artName: string;
  status: string;
  statusName: string;
  date: string;
  type: string;
  typeName: string | null;
  url: string;
  tags: any;
  rate: number;
  postedBy: any;
  serialization: any;
  lang: string;
  idDocRef: string;
  upVote: number;
  downVote: number;
  commentCount: number;
  followCount: number;
  descSeo: string;
  descSeoFull: string;
  keySeo: string;
  detail_documents: any[];
}

interface StoryDetailData {
  detail_documents: DetailDocument;
  chapterList: any[];
  infoDoc: InfoDoc;
}

export default function StoryReadingPage({ params: paramsPromise }: StoryReadingPageProps) {
  const { currentLang } = useLanguage();
  // Unwrap params Promise using React.use() as required in Next.js 15+
  const params = React.use(paramsPromise);
  const router = useRouter();
console.log('reading---1')

  // ========================
  // 1. DOMAIN CONFIGURATION
  // ========================
  const domainConfig = useDomain();
  const isConfigLoading = !domainConfig;

  // ========================
  // 2. STATE MANAGEMENT
  // ========================
  const [state, setState] = useState({
    storyDetail: null as StoryDetailData | null,
    loading: true,
    error: null as string | null,
    initialized: false,
  });

  // Reading history state
  const [currentReadingChapter, setCurrentReadingChapter] = useState<{
    idDetail: string;
    chapterName: string;
  } | null>(null);

  // Chapter list popup state
  const [chapterListState, setChapterListState] = useState({
    isOpen: false,
    loading: false,
    chapters: null as any,
    error: null as string | null,
  });

  // ========================
  // 2.1. TEXT-TO-SPEECH STATE
  // ========================
  const [ttsState, setTtsState] = useState<TTSState>({
    isPlaying: false,
    isPaused: false,
    currentSentence: 0,
    selectedVoice: '',
    rate: 1,
    pitch: 1,
    volume: 0.8,
    autoNext: true,
    sentences: [],
    availableVoices: []
  });
  
  const [showTTSPanel, setShowTTSPanel] = useState(false);
  const [isNaturalProgression, setIsNaturalProgression] = useState(false);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);
  const speechSynthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // ========================
  // 3. TTS CONTROL FUNCTIONS (Moved to top to fix hook order)
  // ========================
  const ttsControls = {
    play: useCallback(() => {
      if (!speechSynthRef.current || ttsState.sentences.length === 0) return;
      
      if (ttsState.isPaused && utteranceRef.current) {
        speechSynthRef.current.resume();
        setTtsState(prev => ({ ...prev, isPlaying: true, isPaused: false }));
        return;
      }
      
      const utterance = new SpeechSynthesisUtterance();
      const sentence = ttsState.sentences[ttsState.currentSentence];
      utterance.text = sentence;
      utterance.rate = ttsState.rate;
      utterance.pitch = ttsState.pitch;
      utterance.volume = ttsState.volume;
      
      // Set voice if available
      const voice = ttsState.availableVoices.find(v => v.voiceURI === ttsState.selectedVoice);
      if (voice) utterance.voice = voice;
      
      utterance.onstart = () => {
        setTtsState(prev => ({ ...prev, isPlaying: true, isPaused: false}));
      };
      
      utterance.onend = () => {
        setIsNaturalProgression(true); // Mark as natural progression
        setTtsState(prev => {
          const nextSentence = prev.currentSentence + 1;
          if (nextSentence >= prev.sentences.length) {
            // End of chapter - auto next if enabled
            if (prev.autoNext && state.storyDetail?.detail_documents.idDetailNext) {
              // Navigate with auto-play parameter
              router.push(`/${params.idDoc}/${state.storyDetail.detail_documents.idDetailNext}`);
              return { ...prev, isPlaying: false, currentSentence: 0 };
            }
            return { ...prev, isPlaying: false, currentSentence: 0 };
          }
          
          return { ...prev, currentSentence: nextSentence };
        });
      };
      
      utterance.onerror = () => {
        setTtsState(prev => ({ ...prev, isPlaying: false, isPaused: false }));
      };
      
      utteranceRef.current = utterance;
      speechSynthRef.current.speak(utterance);
    }, [ttsState, state.storyDetail?.detail_documents.idDetailNext, params.idDoc, router]),

    pause: useCallback(() => {
      if (speechSynthRef.current && ttsState.isPlaying) {
        speechSynthRef.current.pause();
        setTtsState(prev => ({ ...prev, isPaused: true, isPlaying: false }));
      }
    }, [ttsState.isPlaying]),
    
    stop: useCallback(() => {
      if (speechSynthRef.current) {
        speechSynthRef.current.cancel();
        setTtsState(prev => ({ 
          ...prev, 
          isPlaying: false, 
          isPaused: false, 
          currentSentence: 0 
        }));
      }
    }, []),
    
    next: useCallback(() => {
      if (ttsState.isPlaying) {
        speechSynthRef.current?.cancel();
      }
      
      setIsNaturalProgression(false); // Mark as manual navigation
      setTtsState(prev => {
        const nextSentence = Math.min(prev.currentSentence + 1, prev.sentences.length - 1);
        return { ...prev, currentSentence: nextSentence };
      });
    }, [ttsState.isPlaying]),
    
    previous: useCallback(() => {
      if (ttsState.isPlaying) {
        speechSynthRef.current?.cancel();
      }
      
      setIsNaturalProgression(false); // Mark as manual navigation
      setTtsState(prev => {
        const prevSentence = Math.max(prev.currentSentence - 1, 0);
        return { ...prev, currentSentence: prevSentence };
      });
    }, [ttsState.isPlaying]),
    
    setVoice: useCallback((voiceURI: string) => {
      setTtsState(prev => ({ ...prev, selectedVoice: voiceURI }));
    }, []),
    
    setRate: useCallback((rate: number) => {
      setTtsState(prev => ({ ...prev, rate }));
    }, []),
    
    setPitch: useCallback((pitch: number) => {
      setTtsState(prev => ({ ...prev, pitch }));
    }, []),
    
    setVolume: useCallback((volume: number) => {
      setTtsState(prev => ({ ...prev, volume }));
    }, []),
    
    toggleAutoNext: useCallback(() => {
      setTtsState(prev => ({ ...prev, autoNext: !prev.autoNext }));
    }, [])
  };

  // ========================
  // 4. DATA LOADING
  // ========================
  useEffect(() => {
    const loadChapterContent = async () => {
      console.log('reading---1#',params);
      if (!params.idDoc ) return;

      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        let _idDetail = "_"
        const storyHistory = readingHistoryManager.getStoryHistory(params.idDoc);
        if (storyHistory) {
          _idDetail=storyHistory.idDetail;
          setCurrentReadingChapter({
          idDetail: storyHistory.idDetail,
          chapterName: storyHistory.chapterName
        });
        } 

        // Use cached data from layout instead of calling API again
        const result = await getCachedStoryDetail(params.idDoc, _idDetail);
        console.log('reading---2 (using cached data)',result);
        if (result.success && result.data) {
          // Handle the API response structure
          const apiData = result.data as any;
          
          // The fetchStoryDetail should return the full API response structure
          if (apiData && apiData.data && apiData.data.detail_documents) {
            setState(prev => ({
              ...prev,
              storyDetail: apiData.data,
              loading: false,
              initialized: true,
              error: null
            }));
          } else {
            notFound();
          }
        } else {
          notFound();
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load chapter';
        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage,
          initialized: true
        }));
      }
    };

      if(!isConfigLoading)
      loadChapterContent();
  }, [params.idDoc ,isConfigLoading]);

  // Load current reading chapter from history
/*   useEffect(() => {
    if (state.storyDetail && typeof window !== 'undefined') {
      const storyHistory = readingHistoryManager.getStoryHistory(params.idDoc);
      if (storyHistory) {
        setCurrentReadingChapter({
          idDetail: storyHistory.idDetail,
          chapterName: storyHistory.chapterName
        });
      } 
    }
  }, []); */

  // ========================
  // 5. CHAPTER LIST FUNCTIONS
  // ========================
  const handleOpenChapterList = async () => {
    if (chapterListState.chapters) {
      // If chapters already loaded, just open popup
      setChapterListState(prev => ({ ...prev, isOpen: true }));
      return;
    }

    // Show loading state and open popup
    setChapterListState(prev => ({ 
      ...prev, 
      isOpen: true, 
      loading: true, 
      error: null 
    }));

    try {
      const result = await fetchStoryListChapter(params.idDoc);
      
      if (result.success && result.data) {
        console.log('result.data', result.data);
        setChapterListState(prev => ({
          ...prev,
          chapters: result.data,
          loading: false,
          error: null
        }));
      } else {
        setChapterListState(prev => ({
          ...prev,
          loading: false,
          error: result.message || TextConstants.readingHistory.error_loading_chapters.vi
        }));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : TextConstants.readingHistory.error_loading_chapters.vi;
      setChapterListState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
    }
  };

  const handleCloseChapterList = () => {
    setChapterListState(prev => ({ ...prev, isOpen: false }));
  };

  // Keyboard support for closing popup
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && chapterListState.isOpen) {
        handleCloseChapterList();
      }
    };

    if (chapterListState.isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when popup is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [chapterListState.isOpen]);

  // ========================
  // 6. TEXT-TO-SPEECH FUNCTIONS
  // ========================
  
  // Initialize TTS when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthRef.current = window.speechSynthesis;
      
      // Load available voices
      const loadVoices = () => {
        const allVoices = speechSynthRef.current?.getVoices() || [];
        console.log('🎙️ All available voices:', allVoices.map(v => ({ name: v.name, lang: v.lang, localService: v.localService })));
        
        // Enhanced Vietnamese voice detection
        const vietnameseVoices = allVoices.filter(voice => {
          const lang = voice.lang.toLowerCase();
          const name = voice.name.toLowerCase();
          return (
            lang.includes('vi-') || 
            lang.includes('vi_') ||
            lang === 'vi' ||
            name.includes('vietnamese') ||
            name.includes('việt') ||
            name.includes('viet')
          );
        });
        
        console.log('🇻🇳 Vietnamese voices found:', vietnameseVoices);
        
        // If no Vietnamese voices, look for high-quality voices that work well with Vietnamese
        let availableVoices = vietnameseVoices;
        if (vietnameseVoices.length === 0) {
          console.log('⚠️ No Vietnamese voices found, using alternative voices');
          // Prefer local voices and common languages that can handle Vietnamese text
          const fallbackVoices = allVoices.filter(voice => {
            const lang = voice.lang.toLowerCase();
            const name = voice.name.toLowerCase();
            return (
              voice.localService || // Prefer local voices
              lang.includes('en-') || // English voices often work well
              lang.includes('zh-') || // Chinese voices for tonal languages
              name.includes('natural') ||
              name.includes('neural') ||
              name.includes('premium')
            );
          });
          availableVoices = fallbackVoices.length > 0 ? fallbackVoices.slice(0, 10) : allVoices.slice(0, 10);
        }
        
        console.log('✅ Using voices:', availableVoices);
        
        setTtsState(prev => ({
          ...prev,
          availableVoices,
          selectedVoice: availableVoices[0]?.voiceURI || ''
        }));
      };
      
      // Load voices with proper timing
      const handleVoicesChanged = () => {
        console.log('🔄 Voices changed event triggered');
        setTimeout(loadVoices, 100); // Small delay to ensure voices are loaded
      };
      
      // Load voices immediately
      loadVoices();
      
      // Also load when voices change (some browsers load voices asynchronously)
      speechSynthRef.current.addEventListener('voiceschanged', handleVoicesChanged);
      
      // Force reload after a short delay for browsers that load voices asynchronously
      const timeout = setTimeout(() => {
        console.log('🔄 Force reloading voices after delay');
        loadVoices();
      }, 1000);
      
      return () => {
        speechSynthRef.current?.removeEventListener('voiceschanged', handleVoicesChanged);
        clearTimeout(timeout);
      };
    }
  }, []);
  
  // Parse content into sentences when story data is loaded
  useEffect(() => {
    if (state.storyDetail?.detail_documents.source) {
      const content = state.storyDetail.detail_documents.source;
    
    const sentences = subContent(content);
      setTtsState(prev => ({
        ...prev,
        sentences,
        currentSentence: 0
      }));
      
      // Auto-play if coming from auto-next
      if (shouldAutoPlay && sentences.length > 0) {
        console.log('🔊 Auto-playing new chapter from auto-next');
        setShouldAutoPlay(false);
        // Start playing after a short delay to ensure TTS is ready
        setTimeout(() => {
          setTtsState(prev => ({ ...prev, isPlaying: true }));
        }, 500);
      }
    }
  }, [state.storyDetail, shouldAutoPlay]);

  // Auto-resume TTS when sentence changes (but not during natural progression or initial auto-play)
  useEffect(() => {
    // Only auto-resume if:
    // 1. TTS was already playing
    // 2. Not paused
    // 3. Not a natural progression (automatic sentence advance)
    // 4. Not the initial auto-play from new chapter
    if (ttsState.isPlaying && !ttsState.isPaused && !isNaturalProgression && !shouldAutoPlay) {
      const timeoutId = setTimeout(() => {
        ttsControls.play();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
    
    // Handle auto-play from new chapter
    if (shouldAutoPlay && ttsState.sentences.length > 0) {
      console.log('🔊 Starting auto-play from new chapter');
      setShouldAutoPlay(false);
      const timeoutId = setTimeout(() => {
        ttsControls.play();
      }, 300);
      return () => clearTimeout(timeoutId);
    }
    
    // Reset the natural progression flag after checking
    if (isNaturalProgression) {
      setIsNaturalProgression(false);
    }
  }, [ttsState.currentSentence, ttsState.isPlaying, ttsState.isPaused, isNaturalProgression, shouldAutoPlay, ttsState.sentences.length, ttsControls]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (speechSynthRef.current) {
        speechSynthRef.current.cancel();
      }
    };
  }, []);

  // ========================
  // 7. HELPER FUNCTIONS
  // ========================
  
  // Format content based on type
  const formatContent = (content: string) => {
    // Get the selected chip type from localStorage
    const selectedType = typeof window !== 'undefined' ? localStorage.getItem('selectedChipType') : null;
    
    // If type is manga, process content as images separated by #
    if (selectedType === 'manga') {
      const imageUrls = content.split('#').filter(url => url.trim().length > 0);
      return imageUrls.map(url => `<img src="${url.trim()}" alt="Manga page" class="w-full h-auto mb-4" />`).join('\n');
    }
    
    // Default behavior for novel and other types (text content)
    return content
      .split('\r\n\r\n')
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0)
      .map(paragraph => `<p>${paragraph.replace(/\r\n/g, '<br>')}</p>`)
      .join('\n');
  };
  
  const subContent = (content: string) => {
    // Split content into sentences for TTS
    // For novels: split by paragraph breaks
    // For manga: return empty array as we don't read images
    const selectedType = typeof window !== 'undefined' ? localStorage.getItem('selectedChipType') : null;
    
    if (selectedType === 'manga') {
      return []; // No TTS for manga content
    }
    
    // For novel content, split by paragraph breaks and filter empty paragraphs
    return content
      .split('\r\n\r\n')
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0);
  };

  // ========================
  // 8. LOADING STATE
  // ========================
  if (isConfigLoading || !domainConfig) {
    return (
      <div className="min-h-dvh bg-background text-body-primary flex items-center justify-center">
        <div className="text-center">
          <div className="text-muted">{TextConstants.storyDetail.loading_config[currentLang]}</div>
        </div>
      </div>
    );
  }

  if (state.loading) {
    return (
      <>
        <SEOHead 
          title={TextConstants.storyDetail.loading_chapter[currentLang]}
          description={TextConstants.storyDetail.loading_content[currentLang]}
        />
        <div className="min-h-dvh bg-background text-body-primary">
          <Header config={domainConfig} />
          <main className="container mx-auto px-4 py-6 pb-24">
            <StoryListSkeleton count={1} />
          </main>
          <FooterNav />
        </div>
      </>
    );
  }

  if (state.error || !state.storyDetail) {
    return (
      <>
        <SEOHead 
          title={TextConstants.storyDetail.error_loading[currentLang]}
          description={TextConstants.storyDetail.loading_content[currentLang]}
        />
        <div className="min-h-dvh bg-background text-body-primary">
          <Header config={domainConfig} />
          <main className="container mx-auto px-4 py-6 pb-24">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-primary mb-4">
                {TextConstants.storyDetail.not_found_title[currentLang]}
              </h1>
              <p className="text-muted mb-6">
                {state.error || TextConstants.storyDetail.not_found_message[currentLang]}
              </p>
              <Link 
                href={`/`}
                className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
              >
                {TextConstants.storyDetail.home_button[currentLang]}
              </Link>
            </div>
          </main>
          <FooterNav />
        </div>
      </>
    );
  }

  const { detail_documents, infoDoc } = state.storyDetail;
  const formattedContent = formatContent(detail_documents.source);
console.log('formattedContent', infoDoc);

  // ========================
  // 9. RENDER CHAPTER CONTENT
  // ========================

  return (
    <>
      {/* Enhanced SEO HEAD with AI Bot Support */}
      <SEOHead 
        title={`${detail_documents.nameChapter} - ${infoDoc.name} | ${domainConfig.name}`}
        description={`${TextConstants.storyDetail.seo_description[currentLang].replace('{chapterName}', detail_documents.nameChapter).replace('{storyName}', infoDoc.name).replace('{domainName}', domainConfig.name)}`}
        keywords={[infoDoc.name, detail_documents.nameChapter, TextConstants.storyDetail.seo_keyword_story[currentLang], TextConstants.storyDetail.seo_keyword_chapter[currentLang], domainConfig.name]}
        canonical={`https://${domainConfig.domain}/${params.idDoc}/${detail_documents.idDetail}`}
        article={{
          author: infoDoc.authName || TextConstants.chapterDetail.seo_default_author[currentLang],
          publishedTime: detail_documents.date,
          modifiedTime: detail_documents.date,
          section: TextConstants.storyDetail.seo_section[currentLang],
          tags: [infoDoc.name, detail_documents.nameChapter, TextConstants.storyDetail.seo_keyword_chapter[currentLang]]
        }}
        breadcrumbs={[
          { name: TextConstants.storyDetail.breadcrumb_home[currentLang], url: '/' },
          { name: infoDoc.name, url: `/${params.idDoc}` },
          { name: detail_documents.nameChapter, url: `/${params.idDoc}/${detail_documents.idDetail}` }
        ]}
        customSchema={{
          "@context": "https://schema.org",
          "@type": "Chapter",
          "name": detail_documents.nameChapter,
          "isPartOf": {
            "@type": "Book",
            "name": infoDoc.name,
            "url": `https://${domainConfig.domain}/${params.idDoc}`
          },
          "position": detail_documents.currentChapterIndex + 1,
          "url": `https://${domainConfig.domain}/${params.idDoc}/${detail_documents.idDetail}`,
          "datePublished": detail_documents.date,
          "inLanguage": "vi-VN"
        }}
      />

      <div className="min-h-dvh bg-background text-body-primary">
        {/* HEADER */}
        <Header config={domainConfig} />

        <main>
          <ApiErrorBoundary>
            <div className="container mx-auto px-4 py-6 max-w-4xl pb-24">
              
              {/* BREADCRUMB */}
              <nav className="flex items-center space-x-2 text-sm text-muted mb-6">
                <Link href="/" className="hover:text-primary transition-colors">{TextConstants.storyDetail.breadcrumb_home[currentLang]}</Link>
                <span>›</span>
                <Link href={`/${params.idDoc}`} className="hover:text-primary transition-colors">
                  {infoDoc.name}
                </Link>
                <span>›</span>
                <span className="text-body-primary font-medium">{detail_documents.nameChapter}</span>
              </nav>

              {/* CHAPTER HEADER */}
              <div className="text-center mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">
                  {detail_documents.nameChapter}
                </h1>
                <p className="text-muted">
                  {TextConstants.storyDetail.story_label[currentLang]}: <Link href={`/${params.idDoc}`} className="hover:text-primary transition-colors font-medium">
                    {infoDoc.name}
                  </Link>
                </p>
                <div className="text-sm text-muted mt-2">
                  {TextConstants.storyDetail.chapter[currentLang]} {detail_documents.currentChapterIndex + 1} / {detail_documents.totalChapters} •
                  {TextConstants.storyDetail.author[currentLang]}: {infoDoc.authName} •
                  {TextConstants.storyDetail.views[currentLang]}: {detail_documents.view.toLocaleString()}
                </div>
              </div>

              {/* NAVIGATION CONTROLS */}
              <div className="flex flex-wrap justify-between items-center gap-4 mb-8 p-4 bg-card rounded-lg border">
                <div className="flex gap-2">
                  {detail_documents.idDetailPrev ? (
                    <Link
                      href={`/${params.idDoc}/${detail_documents.idDetailPrev}`}
                      className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors text-sm"
                    >
                      ← {detail_documents.nameDetailPrev || TextConstants.storyDetail.previous_chapter[currentLang]}
                    </Link>
                  ) : (
                    <span className="px-4 py-2 bg-muted/50 text-muted rounded-lg text-sm cursor-not-allowed">
                      ← {TextConstants.storyDetail.previous_chapter[currentLang]}
                    </span>
                  )}
                  
                  <button
                    onClick={handleOpenChapterList}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
                  >
                    📚 {TextConstants.storyDetail.chapter_list_button[currentLang]}
                  </button>
                  
                  <button
                    onClick={() => setShowTTSPanel(!showTTSPanel)}
                    className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                      showTTSPanel 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
                    }`}
                  >
                    🔊 {TextConstants.tts.read_audio_button[currentLang]}
                  </button>
                </div>

                <div>
                  {detail_documents.idDetailNext && (
                    <Link
                      href={`/${params.idDoc}/${detail_documents.idDetailNext}`}
                      className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors text-sm"
                    >
                      {detail_documents.nameDetailNext || TextConstants.storyDetail.next_chapter[currentLang]} →
                    </Link>
                  )}
                </div>
              </div>

              {/* TEXT-TO-SPEECH CONTROL PANEL */}
              {showTTSPanel && (
                <div className="bg-card rounded-lg p-6 shadow-sm border mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                      🔊 {TextConstants.tts.control_panel_title[currentLang]}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <span>{TextConstants.tts.sentence_label[currentLang]} {ttsState.currentSentence + 1}/{ttsState.sentences.length}</span>
                    </div>
                  </div>
                  
                  {/* Current Text Display Box */}
                  {ttsState.sentences.length > 0 && (ttsState.isPlaying || ttsState.isPaused) && (
                     <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-blue-800">📖 {TextConstants.tts.reading_label[currentLang]}</span>
                        <div className="flex items-center gap-1 text-xs text-blue-600">
                          <span className="bg-blue-100 px-2 py-1 rounded-full">
                            {TextConstants.tts.sentence_counter[currentLang].replace('{current}', String(ttsState.currentSentence + 1)).replace('{total}', String(ttsState.sentences.length))}
                          </span>
                          {ttsState.isPlaying && (
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full animate-pulse">
                              🔊 {TextConstants.tts.playing_status[currentLang]}
                            </span>
                          )}
                          {ttsState.isPaused && (
                            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                              ⏸️ {TextConstants.tts.paused_status[currentLang]}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-700 leading-relaxed p-3 bg-white rounded border border-blue-100 shadow-sm">
                        <span className="font-medium text-blue-900">
                          {ttsState.sentences[ttsState.currentSentence] || TextConstants.tts.current_text_placeholder[currentLang]}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Voice Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">{TextConstants.tts.voice_label[currentLang]}</label>
                      <div className="flex gap-2">
                        <select
                          value={ttsState.selectedVoice}
                          onChange={(e) => ttsControls.setVoice(e.target.value)}
                          className="flex-1 px-3 py-2 border rounded-lg bg-background text-body-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                          {ttsState.availableVoices.map((voice) => (
                            <option key={voice.voiceURI} value={voice.voiceURI}>
                              {voice.name} ({voice.lang})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">{TextConstants.tts.speed_label[currentLang].replace('{speed}', String(ttsState.rate))}</label>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={ttsState.rate}
                        onChange={(e) => ttsControls.setRate(parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">{TextConstants.tts.pitch_label[currentLang].replace('{pitch}', String(ttsState.pitch))}</label>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={ttsState.pitch}
                        onChange={(e) => ttsControls.setPitch(parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">{TextConstants.tts.volume_label[currentLang].replace('{volume}', Math.round(ttsState.volume * 100).toString())}</label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={ttsState.volume}
                        onChange={(e) => ttsControls.setVolume(parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  {/* Playback Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex gap-2">
                      <button
                        onClick={ttsControls.previous}
                        disabled={ttsState.currentSentence === 0}
                        className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ⏮️ {TextConstants.tts.previous_button[currentLang]}
                      </button>
                      
                      {ttsState.isPlaying ? (
                        <button
                          onClick={ttsControls.pause}
                          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                        >
                          ⏸️ {TextConstants.tts.pause_button[currentLang]}
                        </button>
                      ) : (
                        <button
                          onClick={ttsControls.play}
                          disabled={ttsState.sentences.length === 0}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {ttsState.isPaused ? `▶️ ${TextConstants.tts.continue_button[currentLang]}` : `▶️ ${TextConstants.tts.play_button[currentLang]}`}
                        </button>
                      )}
                      
                      <button
                        onClick={ttsControls.stop}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        ⏹️ {TextConstants.tts.stop_button[currentLang]}
                      </button>
                      
                      <button
                        onClick={ttsControls.next}
                        disabled={ttsState.currentSentence >= ttsState.sentences.length - 1}
                        className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {TextConstants.tts.next_button[currentLang]} ⏭️
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={ttsState.autoNext}
                          onChange={ttsControls.toggleAutoNext}
                          className="rounded"
                        />
                        <span className="text-sm">{TextConstants.tts.auto_next_label[currentLang]}</span>
                      </label>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-muted mb-1">
                      <span>{TextConstants.tts.progress_label[currentLang]}</span>
                      <span>{Math.round(((ttsState.currentSentence + 1) / ttsState.sentences.length) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((ttsState.currentSentence + 1) / ttsState.sentences.length) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Voice Information Panel */}
                  <details className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <summary className="cursor-pointer text-sm font-medium text-blue-800 flex items-center gap-2">
                      🎤 {TextConstants.tts.voice_info_title[currentLang]}
                    </summary>
                    <div className="mt-2 text-sm text-blue-700">
                      <div className="mb-2">
                        <strong>{TextConstants.tts.voice_uri[currentLang]}</strong> {ttsState.availableVoices.find(v => v.voiceURI === ttsState.selectedVoice)?.voiceURI || TextConstants.tts.voice_selected[currentLang]}
                      </div>
                      <div className="mb-2">
                        <strong>{TextConstants.tts.voice_name[currentLang]}</strong> {ttsState.availableVoices.find(v => v.voiceURI === ttsState.selectedVoice)?.name || TextConstants.tts.voice_selected[currentLang]}
                      </div>
                      <div className="mb-2">
                        <strong>{TextConstants.tts.voice_lang[currentLang]}</strong> {ttsState.availableVoices.find(v => v.voiceURI === ttsState.selectedVoice)?.lang || TextConstants.tts.voice_selected[currentLang]}
                      </div>
                      <div className="mb-2">
                        <strong>{TextConstants.tts.voice_local_service[currentLang]}</strong> {ttsState.availableVoices.find(v => v.voiceURI === ttsState.selectedVoice)?.localService ? TextConstants.tts.yes[currentLang] : TextConstants.tts.no[currentLang]}
                      </div>
                      
                      {/* Test Button */}
                      <button
                        onClick={() => {
                          if (speechSynthRef.current && ttsState.selectedVoice) {
                            const testUtterance = new SpeechSynthesisUtterance(TextConstants.tts.test_text[currentLang]);
                            const voice = ttsState.availableVoices.find(v => v.voiceURI === ttsState.selectedVoice);
                            if (voice) testUtterance.voice = voice;
                            speechSynthRef.current.speak(testUtterance);
                          }
                        }}
                        className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                      >
                        🎤 {TextConstants.tts.test_button[currentLang]}
                      </button>
                      
                      {/* Vietnamese Voice Installation Guide */}
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                        <div className="text-xs text-blue-800">
                          <strong>📥 {TextConstants.tts.vietnamese_voice_guide_title[currentLang]}</strong>
                        </div>
                        <div className="text-xs text-blue-700 mt-2 space-y-1">
                          <div><strong>{TextConstants.tts.step_1[currentLang]}</strong> {TextConstants.tts.step_1_description[currentLang]}</div>
                          <div><strong>{TextConstants.tts.step_2[currentLang]}</strong> {TextConstants.tts.step_2_description[currentLang]}</div>
                          <div><strong>{TextConstants.tts.step_3[currentLang]}</strong> {TextConstants.tts.step_3_description[currentLang]}</div>
                          <div><strong>{TextConstants.tts.step_4[currentLang]}</strong> {TextConstants.tts.step_4_description[currentLang]}</div>
                          <div><strong>{TextConstants.tts.step_5[currentLang]}</strong> {TextConstants.tts.step_5_description[currentLang]}</div>
                          <div><strong>{TextConstants.tts.step_6[currentLang]}</strong> {TextConstants.tts.step_6_description[currentLang]}</div>
                        </div>
                        <div className="text-xs text-blue-600 mt-2 font-medium">
                          ✅ {TextConstants.tts.vietnamese_voice_success[currentLang]}
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500 mt-2">
                        💡 <strong>{TextConstants.tts.other_suggestions[currentLang]}</strong>
                        <br />• {TextConstants.tts.chrome_edge_suggestion[currentLang]}
                        <br />• {TextConstants.tts.english_voice_suggestion[currentLang]}
                        <br />• {TextConstants.tts.restart_browser_suggestion[currentLang]}
                      </div>
                    </div>
                  </details>
                </div>
              )}

              {/* CHAPTER CONTENT */}
              <div className="bg-card rounded-lg p-6 md:p-8 shadow-sm border">
                <div 
                  className="prose prose-lg max-w-none text-body-primary leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: formattedContent }}
                />
              </div>

              {/* BOTTOM NAVIGATION */}
              <div className="flex flex-wrap justify-between items-center gap-4 mt-8 p-4 bg-card rounded-lg border">
                <div className="flex gap-2">
                  {detail_documents.idDetailPrev ? (
                    <Link
                      href={`/${params.idDoc}/${detail_documents.idDetailPrev}`}
                      className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors text-sm"
                    >
                      ← {detail_documents.nameDetailPrev || TextConstants.storyDetail.previous_chapter[currentLang]}
                    </Link>
                  ) : (
                    <span className="px-4 py-2 bg-muted/50 text-muted rounded-lg text-sm cursor-not-allowed">
                      ← {TextConstants.storyDetail.previous_chapter[currentLang]}
                    </span>
                  )}
                  
                  <button
                    onClick={handleOpenChapterList}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
                  >
                    📚 {TextConstants.storyDetail.chapter_list_button[currentLang]}
                  </button>
                </div>

                <div>
                  {detail_documents.idDetailNext && (
                    <Link
                      href={`/${params.idDoc}/${detail_documents.idDetailNext}`}
                      className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors text-sm"
                    >
                      {detail_documents.nameDetailNext || TextConstants.storyDetail.next_chapter[currentLang]} →
                    </Link>
                  )}
                </div>
              </div>

              {/* STORY INFO BOX */}
              <div className="mt-8 p-4 bg-card rounded-lg border">
                <h3 className="font-bold text-primary mb-2">{TextConstants.storyDetail.about_story[currentLang]}</h3>
                <p className="text-sm text-muted mb-3">
                  {TextConstants.storyDetail.reading_current_chapter[currentLang]} <strong>{detail_documents.nameChapter}</strong> {TextConstants.storyDetail.belonging_to_story[currentLang]} <strong>{infoDoc.name}</strong>
                </p>
                
                {/* Reading Progress from LocalStorage */}
                {currentReadingChapter && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-green-600">📍</span>
                      <span className="font-medium text-green-700">
                        {TextConstants.storyDetail.current_reading_label[currentLang]}: {currentReadingChapter.chapterName}
                      </span>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <span className="font-medium">{TextConstants.storyDetail.author_label[currentLang]}:</span>
                    {infoDoc.authName.split(',').map((auth, index) => (
                      <Link key={index} href={`/truyen-tac-gia?name=${encodeURIComponent(auth)}&id=${encodeURIComponent(infoDoc.auth.split(',')[index])}`} className="text-primary hover:underline">{auth}</Link>
                      ))}
                  </div>
                  <div>
                    <span className="font-medium">{TextConstants.storyDetail.genre_label[currentLang]}:</span> 
                    {infoDoc.genresName.split(',').map((genre, index) => (
                      <Link key={index} href={`/truyen-danh-muc?name=${encodeURIComponent(genre)}&id=${encodeURIComponent(infoDoc.genres.split(',')[index])}`} className="text-primary hover:underline">{genre}</Link>
                      ))}
                  </div>
                  <div>
                    <span className="font-medium">{TextConstants.storyDetail.status_label[currentLang]}:</span> {infoDoc.statusName}
                  </div>
                  <div>
                    <span className="font-medium">{TextConstants.storyDetail.views_label[currentLang]}:</span> {infoDoc.view.toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  {/* Continue Reading Button - Shows saved chapter from localStorage */}
                  {currentReadingChapter && (
                    <Link
                      href={`/${params.idDoc}/${currentReadingChapter.idDetail}`}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
                      title={`${TextConstants.storyDetail.continue_reading_title[currentLang]}: ${currentReadingChapter.chapterName}`}
                    >
                      📚 {TextConstants.storyDetail.continue_reading[currentLang]}
                    </Link>
                  )}
                {/*   <Link
                    href={`/${params.idDoc}`}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
                  >
                    📖 {TextConstants.storyDetail.story_info_button[currentLang]}
                  </Link> */}
                  <Link
                    href="/"
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors text-sm"
                  >
                    🏠 {TextConstants.storyDetail.home_page[currentLang]}
                  </Link>
                </div>
              </div>

            </div>
          </ApiErrorBoundary>
        </main>

        {/* FOOTER */}
        <FooterNav />
      </div>

      {/* CHAPTER LIST POPUP */}
      {chapterListState.isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            // Close popup when clicking on backdrop
            if (e.target === e.currentTarget) {
              handleCloseChapterList();
            }
          }}
        >
          <div className="bg-background border rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
            {/* Popup Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold text-primary">
                {TextConstants.chapterList.title[currentLang].replace('{storyName}', state.storyDetail?.infoDoc.name || '')}
              </h2>
              <button
                onClick={handleCloseChapterList}
                className="text-muted hover:text-body-primary transition-colors p-2"
              >
                ✕
              </button>
            </div>
            
            {/* Popup Content */}
            <div className="flex-1 overflow-auto p-4">
              {chapterListState.loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted">{TextConstants.storyDetail.loading_chapter_list[currentLang]}</p>
                  </div>
                </div>
              ) : chapterListState.error ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <p className="text-red-500 mb-4">{chapterListState.error}</p>
                    <button
                      onClick={handleOpenChapterList}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      {TextConstants.chapterList.try_again[currentLang]}
                    </button>
                  </div>
                </div>
              ) : chapterListState.chapters?.data ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {chapterListState.chapters.data.map((chapter: any, index: number) => (
                    <Link
                      key={chapter.idDetail || index}
                      href={`/${params.idDoc}/${chapter.idDetail}`}
                      onClick={handleCloseChapterList}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors group ${
                        index === 0 
                          ? 'border-blue-500' 
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <span className={`text-sm ${
                        index === 0  
                          ? 'font-bold text-blue-600' 
                          : 'font-medium group-hover:text-primary'
                      }`}>
                        {chapter.nameChapter || `${TextConstants.storyDetail.chapter[currentLang]} ${index + 1}`}
                      </span>
                      <span className="text-xs text-muted">
                        { new Date(chapter.date).toLocaleDateString("vi-VN")|| ''}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <p className="text-muted">{TextConstants.chapterList.no_chapters[currentLang]}</p>
                </div>
              )}
            </div>
            
            {/* Popup Footer */}
            <div className="border-t p-4">
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleCloseChapterList}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
                >
                  {TextConstants.chapterList.close_button[currentLang]}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}