import type { Metadata } from 'next';
import './globals.css';
import { TopNav } from '@/components/TopNav';
import { SessionProvider } from 'next-auth/react';
import { auth } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Audit Ally — WCAG Accessibility Audit Tracker and Reporting Tool',
  description: 'Guided WCAG accessibility auditing with automated scanning, detailed reports, and exportable results.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <html lang="en">
      <body>
        <SessionProvider session={session}>
          <div className="app-shell">
            <TopNav />
            <main className="main-content">
              {children}
            </main>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}