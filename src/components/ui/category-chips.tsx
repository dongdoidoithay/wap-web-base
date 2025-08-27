import Link from 'next/link';

interface CategoryChipsProps {
  categories: string[];
}

export function CategoryChips({ categories }: CategoryChipsProps) {
  return (
    <div className="mx-auto max-w-screen-sm px-3 py-2 overflow-x-auto">
      <ul className="flex gap-2 whitespace-nowrap">
        {categories.map((category) => (
          <li key={category}>
            <Link
              href={`/chuyen-muc/${encodeURIComponent(category)}`}
              className="inline-flex items-center rounded-full border border-primary/20 px-3 py-1.5 text-sm hover:bg-primary/10 text-primary transition-colors"
            >
              {category}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}