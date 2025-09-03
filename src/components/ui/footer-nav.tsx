import Link from 'next/link';
import { useLanguage } from '@/contexts/language-context';
import { TextConstants } from '@/lib/text-constants';

export function FooterNav() {
  const { currentLang } = useLanguage();

  const navigationItems = [
    { 
      label: TextConstants.common.home[currentLang], 
      href: "/", 
      emoji: "🏠" 
    },
    { 
      label: TextConstants.footer.history[currentLang], 
      href: "/reading-history", 
      emoji: "📚" 
    },
    { 
      label: TextConstants.common.categories[currentLang], 
      href: "/danh-muc", 
      emoji: "🗂️" 
    },
    { 
      label: TextConstants.common.search[currentLang], 
      href: "/search", 
      emoji: "🔍" 
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 mt-4 border-t border-light bg-surface/95 backdrop-blur"
      aria-label={TextConstants.footer.navigation_label[currentLang]}
    >
      <ul className="mx-auto flex max-w-screen-sm items-stretch justify-between px-6 py-2 text-xs">
        {navigationItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="flex flex-col items-center rounded-xl px-3 py-1.5 hover:bg-primary/10 transition-colors"
            >
              <span aria-hidden>{item.emoji}</span>
              <span className="mt-0.5 text-[11px] text-body-secondary">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}