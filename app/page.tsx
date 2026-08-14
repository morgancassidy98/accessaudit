import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { wcagCriteria } from '@/lib/wcag-criteria';
import { AuditTable } from '@/components/AuditTable';

async function getAudits() {
  return prisma.audit.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      pages: {
        include: { results: true },
      },
    },
  });
}

export default async function DashboardPage() {
  const audits = await getAudits();

  const totalAudits = audits.length;
  const totalPages = audits.reduce((acc, a) => acc + a.pages.length, 0);


  // Compute stats
  const auditStats = audits.map((audit) => {
    const results = audit.pages.flatMap((p) => p.results);
    const passed  = results.filter((r) => r.status === 'pass').length;
    const failed  = results.filter((r) => r.status === 'fail').length;
    const na      = results.filter((r) => r.status === 'na').length;
    const tested  = passed + failed + na;
    const total   = audit.pages.length * wcagCriteria.length;
    const passRate = tested > 0 ? Math.round((passed / tested) * 100) : 0;
    const progress = total > 0 ? Math.round((tested / total) * 100) : 0;
    const status =
      total === 0       ? 'empty'
      : tested === 0    ? 'not-started'
      : tested < total  ? 'in-progress'
      : failed === 0    ? 'complete'
      : 'complete-with-issues';

    return {
      ...audit,
      stats: { passed, failed, na, tested, total, passRate, progress, status },
    };
  });

  const completeAudits = auditStats.filter((a) =>
    a.stats.status === 'complete' || a.stats.status === 'complete-with-issues'
  ).length;

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">
  Manage and track your WCAG 2.1 AA accessibility audits
        </p>
        </div>
        <Link href="/audit/new" className="btn btn-primary">
          + New Audit
        </Link>
      </div>

      <div className="page-body">
        {/* Stat cards */}
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-card-value">{totalAudits}</div>
            <div className="stat-card-label">Total Audits</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-value">{totalPages}</div>
            <div className="stat-card-label">Pages Audited</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-value">{completeAudits}</div>
            <div className="stat-card-label">Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-value">{wcagCriteria.length}</div>
            <div className="stat-card-label">WCAG Criteria</div>
          </div>
        </div>

        {/* Audit list */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 style={{ fontSize: '18px' }}>Audits</h2>
            {totalAudits > 0 && (
              <span className="text-muted text-small">
                {totalAudits} audit{totalAudits !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {totalAudits === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">◈</div>
              <h3>No audits yet</h3>
              <p>
                Create your first audit to start checking a website for
                WCAG 2.1 AA accessibility compliance.
              </p>
              <Link href="/audit/new" className="btn btn-primary">
                Create Your First Audit
              </Link>
            </div>
          ) : (
            <AuditTable audits={auditStats} />
          )}
        </div>
      </div>
    </>
  );
}