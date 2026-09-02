'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type AuditWithStats = {
  id: string;
  name: string;
  url: string;
  createdAt: Date;
  stats: {
    passed: number;
    failed: number;
    tested: number;
    total: number;
    passRate: number;
    progress: number;
    status: string;
  };
};

const statusBadge = (status: string) => {
  switch (status) {
    case 'complete':
      return <span className="badge badge-success">Complete</span>;
    case 'complete-with-issues':
      return <span className="badge badge-danger">Issues Found</span>;
    case 'in-progress':
      return <span className="badge badge-warning">In Progress</span>;
    case 'not-started':
      return <span className="badge badge-neutral">Not Started</span>;
    default:
      return <span className="badge badge-neutral">Empty</span>;
  }
};

function DeleteButton({
  auditId,
  auditName,
}: {
  auditId: string;
  auditName: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await fetch(`/api/audits/${auditId}`, { method: 'DELETE' });
      router.refresh();
    } catch {
      setIsDeleting(false);
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <div className="flex gap-2 items-center">
        <span className="text-muted" style={{ whiteSpace: 'nowrap' }}>
          Delete?
        </span>
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
      className="btn btn-ghost btn-sm"
      onClick={() => setConfirming(true)}
      aria-label={`Delete audit: ${auditName}`}
      style={{ color: 'var(--color-danger)' }}
    >
      Delete
    </button>
  );
}

export function AuditTable({ audits }: { audits: AuditWithStats[] }) {
  return (
    <div className="audit-list">
      {audits.map((audit) => (
        <div key={audit.id} className="audit-row">

          {/* Top row — name + status */}
          <div className="flex justify-between items-center gap-4 mb-3">
            <div style={{ minWidth: 0 }}>
              <div className="audit-row-name">{audit.name}</div>
              <div className="audit-row-url">{audit.url}</div>
            </div>
            <div className="flex-shrink-0">
              {statusBadge(audit.stats.status)}
            </div>
          </div>

          {/* Stats row */}
          <div className="audit-row-stats">
            <div className="audit-stat">
              <div className="audit-stat-label">Progress</div>
              <div className="flex items-center gap-2">
                <div className="progress-bar" style={{ flex: 1, minWidth: '80px' }}>
                  <div
                    className={`progress-bar-fill ${
                      audit.stats.progress === 100
                        ? audit.stats.failed > 0
                          ? 'danger'
                          : 'success'
                        : ''
                    }`}
                    style={{ width: `${audit.stats.progress}%` }}
                  />
                </div>
                <span style={{ fontSize: '14px', color: '#555', flexShrink: 0 }}>
                  {audit.stats.progress}%
                </span>
              </div>
            </div>

            <div className="audit-stat">
              <div className="audit-stat-label">Pass Rate</div>
              {audit.stats.tested > 0 ? (
                <span style={{
                  fontSize: '15px',
                  fontWeight: 500,
                  color: audit.stats.passRate >= 90
                    ? '#2d5a1e'
                    : audit.stats.passRate >= 70
                    ? '#4a3a10'
                    : 'var(--color-danger)',
                }}>
                  {audit.stats.passRate}%
                </span>
              ) : (
                <span className="text-muted">—</span>
              )}
            </div>

            <div className="audit-stat">
              <div className="audit-stat-label">Failures</div>
              {audit.stats.failed > 0 ? (
                <span className="badge badge-danger">
                  {audit.stats.failed} failed
                </span>
              ) : audit.stats.tested > 0 ? (
                <span className="badge badge-success">None</span>
              ) : (
                <span className="text-muted">—</span>
              )}
            </div>
          </div>

          {/* Actions row */}
          <div className="audit-row-actions flex gap-2 items-center mt-4">
            <Link
              href={`/audit/${audit.id}`}
              className="btn btn-outline btn-sm"
            >
              Open Audit
            </Link>
              <Link
    href={`/audit/${audit.id}/report`}
    className="btn btn-ghost btn-sm"
  >
    View Report
  </Link>
            <DeleteButton auditId={audit.id} auditName={audit.name} />
          </div>

        </div>
      ))}
    </div>
  );
}