'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/',           icon: '◈', label: 'Dashboard' },
  { href: '/audit/new', icon: '+', label: 'New Audit'  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar" aria-label="Main navigation">
      <div className="sidebar-brand">
        <div className="sidebar-brand-name">AccessAudit</div>
        <div className="sidebar-brand-tagline">WCAG 2.1 AA Auditing</div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-nav-label">Navigation</div>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
          >
            <span className="sidebar-link-icon" aria-hidden="true">
              {item.icon}
            </span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        WCAG 2.1 AA · Section 508
      </div>
    </aside>
  );
}