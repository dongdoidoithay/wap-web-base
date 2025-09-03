import Link from 'next/link';

export function FooterNav() {
  const navigationItems = [
    { label: "Trang chủ", href: "/", emoji: "🏠" },
    { label: "Lịch sử", href: "/reading-history", emoji: "📚" },
    { label: "Danh mục", href: "/danh-muc", emoji: "🗂️" },
    { label: "Tìm kiếm", href: "/search", emoji: "🔍" },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 mt-4 border-t border-light bg-surface/95 backdrop-blur"
      aria-label="Điều hướng dưới cùng"
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