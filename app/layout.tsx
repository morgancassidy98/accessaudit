import type { Metadata } from 'next';
import './globals.css';
import { TopNav } from '@/components/TopNav';

export const metadata: Metadata = {
  title: 'Audit Ally — WCAG Accessibility Audit Tracker and Reporting Tool',
  description: 'Guided WCAG accessibility auditing with automated scanning, detailed reports, and exportable results.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <TopNav />
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}