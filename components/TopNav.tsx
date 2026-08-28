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
  const { status } = useSession();

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
          {status === 'authenticated' && navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`topnav-link ${pathname === item.href ? 'active' : ''}`}
                aria-current={pathname === item.href ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
          {status !== 'authenticated' && (
            <details className="topnav-auth topnav-account-action">
              <summary className="btn btn-outline topnav-signin">Sign In</summary>
              <div className="topnav-auth-menu">
                <button type="button" onClick={() => signIn('github', { callbackUrl: '/' })}>
                  <GitHubIcon size={20} />
                  <span>GitHub</span>
                </button>
                <button type="button" onClick={() => signIn('google', { callbackUrl: '/' })}>
                  <GoogleIcon size={20} />
                  <span>Google</span>
                </button>
              </div>
            </details>
          )}
          {status === 'authenticated' && (
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="btn btn-outline topnav-signin topnav-account-action"
            >
              Sign Out
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}