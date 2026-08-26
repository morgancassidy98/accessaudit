'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { DashboardIcon, MenuIcon, PlusIcon, XIcon } from './icons';

const navItems = [
  { href: '/', icon: <DashboardIcon size={16} />, label: 'Dashboard' },
  { href: '/audit/new', icon: <PlusIcon size={16} />, label: 'New Audit' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="sidebar-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="sidebar"
        aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
      >
        {isOpen ? <XIcon size={18} /> : <MenuIcon size={18} />}
      </button>

      {/* Backdrop */}
      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        id="sidebar"
        className={`sidebar ${isOpen ? 'open' : ''}`}
        aria-label="Main navigation"
      >
        <div className="sidebar-brand">
          <div className="sidebar-brand-name">Audit Ally</div>
          <div className="sidebar-brand-tagline">WCAG Accessibility Audit Tracker and Reporting Tool</div>
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
          WCAG Accessibility · Section 508
        </div>
      </aside>
    </>
  );
}