'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';
import { GitHubIcon, GoogleIcon } from '@/components/icons';

const navItems = [
  { href: '/',          label: 'Dashboard' },
  { href: '/audit/new', label: 'New Audit'  },
];

export function TopNav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Don't render nav for unauthenticated users
  // (middleware handles redirect, this prevents flash)
  if (status === 'unauthenticated') return null;

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
          {status === 'loading' && (
            <div style={{
              width: '80px',
              height: '32px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: 'var(--radius)',
            }} aria-hidden="true" />
          )}

          {status === 'authenticated' && (
            <>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`topnav-link ${item.href === '/' ? 'topnav-dashboard-link' : ''} ${pathname === item.href ? 'active' : ''}`}
                  aria-current={pathname === item.href ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              ))}

              <div className="flex items-center gap-3" style={{ marginLeft: '8px' }}>
               {session?.user?.image && (
  <Link href="/profile">
    <img
      src={session.user.image}
      alt={session.user.name ?? 'User avatar'}
      style={{
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        border: '2px solid rgba(255,255,255,0.3)',
        cursor: 'pointer',
        transition: 'border-color var(--transition)',
      }}
    />
  </Link>
)}
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="btn btn-outline topnav-signin"
                >
                  Sign Out
                </button>
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}