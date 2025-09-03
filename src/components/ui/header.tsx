import Link from 'next/link';
import { SearchBar } from '@/components/ui/search-bar';

interface HeaderProps {
  config: {
    logo: string;
    name: string;
  };
}

export function Header({ config }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur supports-[backdrop-filter]:bg-surface/60 border-b border-light">
      <div className="mx-auto max-w-screen-sm px-3 py-2 flex items-center justify-between">
        <Link href="/" aria-label="Trang chủ" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl border border-light shadow-sm bg-surface">
            {config.logo}
          </span>
          <span className="font-semibold tracking-tight text-body-primary">{config.name}</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/app-view" className="text-sm text-body-secondary hover:text-primary transition-colors flex items-center gap-1">
            📚 App
          </Link>
        </nav>
      </div>
      
    </header>
  );
}