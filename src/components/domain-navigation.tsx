'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDomain } from '@/hooks/use-domain';
import { useLanguage } from '@/contexts/language-context';
import { useActiveApiPath } from '@/hooks/use-active-api-path';
import { TextConstants } from '@/lib/text-constants';

export function DomainNavigation() {
  const pathname = usePathname();
  const domainConfig = useDomain();
  const { currentLang, changeLanguage } = useLanguage();
  const currentApi = useActiveApiPath();

  // Extract domain from pathname
  const pathParts = pathname.split('/').filter(Boolean);
  const currentDomain = pathParts[0] || domainConfig?.domain;

  return (
    <div className="bg-surface border-b border-light">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-body-secondary">Domain:</span>
              <span className="ml-1 font-medium">{currentDomain}</span>
            </div>
            
            {/* Language Toggle */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-body-secondary">
                {TextConstants.common.categories[currentLang]}
              </span>
              <button
                className={`px-3 py-1 rounded ${
                  currentLang === 'vi' 
                    ? 'bg-info text-white' 
                    : 'bg-surface border border-light text-body-secondary hover:bg-primary/10'
                }`}
                onClick={() => changeLanguage('vi')}
              >
                Tiếng Việt
              </button>
              <button
                className={`px-3 py-1 rounded ${
                  currentLang === 'en' 
                    ? 'bg-success text-white' 
                    : 'bg-surface border border-light text-body-secondary hover:bg-primary/10'
                }`}
                onClick={() => changeLanguage('en')}
              >
                English
              </button>
            </div>
            
            {/* API Info */}
            <div className="text-xs text-muted">
              API: {currentApi}
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex items-center gap-6 py-3">
          <Link
            href={`/${currentDomain}`}
            className="text-body-secondary hover:text-link transition-colors"
          >
            {TextConstants.header.home_label[currentLang]}
          </Link>
          <Link
            href={`/${currentDomain}/categories`}
            className="text-body-secondary hover:text-link transition-colors"
          >
            {TextConstants.common.categories[currentLang]}
          </Link>
          <Link
            href={`/${currentDomain}/search`}
            className="text-body-secondary hover:text-link transition-colors"
          >
            {TextConstants.common.search[currentLang]}
          </Link>
          <Link
            href={`/${currentDomain}/reading-history`}
            className="text-body-secondary hover:text-link transition-colors"
          >
            {TextConstants.common.history[currentLang]}
          </Link>
        </nav>
      </div>
    </div>
  );
}