'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createDomainBreadcrumb, getLanguageFromPath } from '@/lib/domain-routing';
import { createNavigationMenu, getApiByLanguage } from '@/lib/dynamic-routes';

interface DomainNavigationProps {
  domain: string;
  config: any;
}

export function DomainNavigation({ domain, config }: DomainNavigationProps) {
  const pathname = usePathname();
  const breadcrumbs = createDomainBreadcrumb(domain, pathname);
  const language = getLanguageFromPath(pathname);
  const navigationMenu = createNavigationMenu(config, domain);
  const currentApi = getApiByLanguage(config, language);

  return (
    <div className="bg-surface border-b border-light">
      <div className="max-w-4xl mx-auto px-4">
        {/* Top Navigation */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{config.logo}</span>
            <div>
              <h1 className="text-lg font-semibold text-body-primary">{config.name}</h1>
              <p className="text-xs text-muted">{domain}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Language Toggle */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-body-secondary">Language:</span>
              <Link
                href={`/${domain}/doc-truyen`}
                className={`px-3 py-1 rounded ${
                  language === 'vi' 
                    ? 'bg-info text-white' 
                    : 'bg-surface border border-light text-body-secondary hover:bg-primary/10'
                }`}
              >
                Tiếng Việt
              </Link>
              <Link
                href={`/${domain}/read-manga`}
                className={`px-3 py-1 rounded ${
                  language === 'en' 
                    ? 'bg-success text-white' 
                    : 'bg-surface border border-light text-body-secondary hover:bg-primary/10'
                }`}
              >
                English
              </Link>
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
            href={`/${domain}`}
            className="text-body-secondary hover:text-link transition-colors"
          >
            Trang chủ
          </Link>
          {navigationMenu.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="text-body-secondary hover:text-link transition-colors"
            >
              {item.title}
            </Link>
          ))}
        </nav>

        {/* Breadcrumbs */}
        {breadcrumbs.length > 1 && (
          <div className="flex items-center gap-2 py-2 text-sm text-body-secondary">
            {breadcrumbs.map((breadcrumb, index) => (
              <div key={breadcrumb.href} className="flex items-center gap-2">
                {index > 0 && <span>/</span>}
                <Link
                  href={breadcrumb.href}
                  className="hover:text-link transition-colors"
                >
                  {breadcrumb.name}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
