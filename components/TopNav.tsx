'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/',          label: 'Dashboard' },
  { href: '/audit/new', label: 'New Audit'  },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="topnav" role="banner">
      <div className="topnav-inner">
        <div className="topnav-brand">
          <Link href="/" className="topnav-brand-link">
            <span className="topnav-brand-name">Audit Ally</span>
            <span className="topnav-brand-tagline">WCAG Accessibility Audit Tracker and Reporting Tool</span>
          </Link>
        </div>

        <nav className="topnav-links" aria-label="Main navigation">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`topnav-link ${pathname === item.href ? 'active' : ''}`}
              aria-current={pathname === item.href ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}