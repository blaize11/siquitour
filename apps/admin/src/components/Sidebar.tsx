'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/explore', label: 'Explore' },
  { href: '/users', label: 'Users' },
  { href: '/spots', label: 'Spots' },
  { href: '/commission', label: 'Commission' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex w-56 shrink-0 flex-col gap-1 border-r border-border bg-surface p-4">
      <div className="mb-4 px-2 text-lg font-bold text-primary">SiquiTour</div>
      {links.map((link) => {
        const active = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active ? 'bg-primary text-white' : 'text-foreground hover:bg-border/50'
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
