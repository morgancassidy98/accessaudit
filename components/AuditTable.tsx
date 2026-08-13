'use client';

import Link from 'next/link';

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

export function AuditTable({ audits }: { audits: AuditWithStats[] }) {
  return (
    <table className="table" aria-label="Audits list">
      <thead>
        <tr>
          <th>Audit</th>
          <th>Status</th>
          <th>Progress</th>
          <th>Pass Rate</th>
          <th>Failures</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {audits.map((audit) => (
          <tr key={audit.id}>
            <td>
              <div style={{ fontWeight: 500, marginBottom: '2px' }}>
                {audit.name}
              </div>
              <div className="text-muted text-small">{audit.url}</div>
            </td>
            <td>{statusBadge(audit.stats.status)}</td>
            <td style={{ minWidth: '120px' }}>
              <div className="flex items-center gap-2">
                <div className="progress-bar" style={{ flex: 1 }}>
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
                <span className="text-small text-muted">
                  {audit.stats.progress}%
                </span>
              </div>
            </td>
            <td>
              {audit.stats.tested > 0 ? (
                <span style={{
                  color: audit.stats.passRate >= 90
                    ? '#3a6b2a'
                    : audit.stats.passRate >= 70
                    ? '#5a4a1e'
                    : 'var(--color-danger)',
                  fontWeight: 500,
                }}>
                  {audit.stats.passRate}%
                </span>
              ) : (
                <span className="text-muted">—</span>
              )}
            </td>
            <td>
              {audit.stats.failed > 0 ? (
                <span className="badge badge-danger">
                  {audit.stats.failed} failed
                </span>
              ) : audit.stats.tested > 0 ? (
                <span className="badge badge-success">None</span>
              ) : (
                <span className="text-muted">—</span>
              )}
            </td>
            <td>
              <div className="flex gap-2">
                <Link
                  href={`/audit/${audit.id}`}
                  className="btn btn-outline btn-sm"
                >
                  Open
                </Link>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}