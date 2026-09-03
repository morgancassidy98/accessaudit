'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type PageWithStats = {
  id: string;
  title: string;
  url: string;
  lighthouseScore: number | null;
  scannedAt: Date | null;
  stats: {
    passed: number;
    failed: number;
    na: number;
    tested: number;
    total: number;
    passRate: number;
    progress: number;
    hasAutomated: boolean;
  };
};

function DeletePageButton({
  pageId,
  pageTitle,
  auditId,
}: {
  pageId: string;
  pageTitle: string;
  auditId: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await fetch(`/api/audits/${auditId}/pages/${pageId}`, { method: 'DELETE' });
      router.refresh();
    } catch {
      setIsDeleting(false);
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <div className="page-remove-confirm flex gap-2 items-center">
        <span className="text-muted">Remove?</span>
        <button
          className="btn btn-danger btn-sm"
          onClick={handleDelete}
          disabled={isDeleting}
          aria-busy={isDeleting}
        >
          {isDeleting ? '…' : 'Yes'}
        </button>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setConfirming(false)}
          disabled={isDeleting}
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      className="btn btn-ghost btn-sm danger-text"
      onClick={() => setConfirming(true)}
      aria-label={`Remove page: ${pageTitle}`}
    >
      Remove
    </button>
  );
}

export function PageList({
  pages,
  auditId,
}: {
  pages: PageWithStats[];
  auditId: string;
}) {
  const [scanErrors, setScanErrors] = useState<Record<string, string>>({});

  const setError = (pageId: string, msg: string) => {
    setScanErrors((prev) => ({ ...prev, [pageId]: msg }));
  };

  return (
    <div className="page-list">
      {pages.map((page) => (
        <div key={page.id} className="page-row">

          {/* Title + URL */}
          <div className="flex justify-between items-start gap-4 mb-3">
            <div className="min-w-0">
              <div className="page-row-title">
                {page.title}
              </div>
              <div className="text-muted page-row-url">
                {page.url}
              </div>
            </div>
            {page.lighthouseScore !== null && (
              <div className="lighthouse-score" style={{
                flexShrink: 0,
                textAlign: 'center',
                background: page.lighthouseScore >= 90
                  ? 'var(--color-success-light)'
                  : page.lighthouseScore >= 70
                  ? 'var(--color-warning-light)'
                  : 'var(--color-danger-light)',
                color: page.lighthouseScore >= 90
                  ? '#2d5a1e'
                  : page.lighthouseScore >= 70
                  ? '#4a3a10'
                  : '#6e0d2a',
                borderRadius: 'var(--radius)',
                padding: '6px 12px',
                fontSize: '14px',
                fontWeight: 500,
              }}>
                <div className="lighthouse-score-value">
                  {page.lighthouseScore}/100
                </div>
                <div className="lighthouse-score-label">
                  Lighthouse
                </div>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="page-row-stats">
            <div>
              <div className="audit-stat-label">Progress</div>
              <div className="flex items-center gap-2">
                <div className="progress-bar progress-track">
                  <div
                    className={`progress-bar-fill ${
                      page.stats.progress === 100
                        ? page.stats.failed > 0 ? 'danger' : 'success'
                        : ''
                    }`}
                    style={{ width: `${page.stats.progress}%` }}
                  />
                </div>
                <span className="progress-value">
                  {page.stats.progress}%
                </span>
              </div>
            </div>
            <div>
              <div className="audit-stat-label">Tested</div>
              <span className="page-stat-value">
                {page.stats.tested} / {page.stats.total}
              </span>
            </div>
            <div>
              <div className="audit-stat-label">Pass Rate</div>
              {page.stats.tested > 0 ? (
                <span className="page-pass-rate" style={{
                  color: page.stats.passRate >= 90
                    ? '#2d5a1e'
                    : page.stats.passRate >= 70
                    ? '#4a3a10'
                    : 'var(--color-danger)',
                }}>
                  {page.stats.passRate}%
                </span>
              ) : (
                <span className="text-muted">—</span>
              )}
            </div>
            <div>
              <div className="audit-stat-label">Failures</div>
              {page.stats.failed > 0 ? (
                <span className="badge badge-danger">
                  {page.stats.failed} failed
                </span>
              ) : page.stats.tested > 0 ? (
                <span className="badge badge-success">None</span>
              ) : (
                <span className="text-muted">—</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4">
            <div className="page-row-actions flex gap-2 items-center">
              <Link
                href={`/audit/${auditId}/page/${page.id}`}
                className="btn btn-primary btn-sm"
              >
                {page.stats.tested === 0 ? 'Start Audit' : 'Continue Audit'}
              </Link>
              <ScanButton
                pageId={page.id}
                auditId={auditId}
                pageUrl={page.url}
                onError={(msg) => setError(page.id, msg)}
                label={page.scannedAt === null ? 'Auto-scan' : 'Rescan'}
              />
              {page.scannedAt !== null && (
                <span className="text-muted scan-time">
                  Scanned {new Date(page.scannedAt).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </span>
              )}
              <DeletePageButton
                pageId={page.id}
                pageTitle={page.title}
                auditId={auditId}
              />
            </div>

            {/* Error always renders below the button row */}
            {scanErrors[page.id] && (
              <p role="alert" className="scan-error">
                {scanErrors[page.id]}
              </p>
            )}
          </div>

        </div>
      ))}
    </div>
  );
}

export function ScanButton({
  pageId,
  auditId,
  pageUrl,
  onError,
  label,
}: {
  pageId: string;
  auditId: string;
  pageUrl: string;
  onError?: (msg: string) => void;
  label: string;
}) {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = async () => {
    setIsScanning(true);
    onError?.('');
    try {
      const res = await fetch(`/api/audits/${auditId}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId, url: pageUrl }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.details ?? data?.error ?? 'Scan failed');
      }

      setIsScanning(false);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Scan failed — URL must be publicly accessible.';
      onError?.(message);
      setIsScanning(false);
    }
  };

  return (
    <button
      className="btn btn-outline btn-sm scan-button"
      onClick={handleScan}
      disabled={isScanning}
      aria-busy={isScanning}
    >
      {isScanning ? 'Scanning…' : label}
    </button>
  );
}