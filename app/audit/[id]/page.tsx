import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { wcagCriteria } from '@/lib/wcag-criteria';
import { AddPageForm } from '@/components/AddPageForm';
import { PageList } from '@/components/PageList';

async function getAudit(id: string) {
  const audit = await prisma.audit.findUnique({
    where: { id },
    include: {
      pages: {
        orderBy: { createdAt: 'asc' },
        include: { results: true },
      },
    },
  });

  if (!audit) notFound();
  return audit;
}

export default async function AuditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const audit = await getAudit(id);

  // Compute per-page stats
  const pagesWithStats = audit.pages.map((page) => {
    const passed  = page.results.filter((r) => r.status === 'pass').length;
    const failed  = page.results.filter((r) => r.status === 'fail').length;
    const na      = page.results.filter((r) => r.status === 'na').length;
    const tested  = passed + failed + na;
    const total   = wcagCriteria.length;
    const passRate = tested > 0 ? Math.round((passed / tested) * 100) : 0;
    const progress = Math.round((tested / total) * 100);
    const hasAutomated = page.results.some((r) => r.automatedStatus !== null);

    return {
      ...page,
      stats: { passed, failed, na, tested, total, passRate, progress, hasAutomated },
    };
  });

  // Overall audit stats
  const allResults = audit.pages.flatMap((p) => p.results);
  const totalPassed  = allResults.filter((r) => r.status === 'pass').length;
  const totalFailed  = allResults.filter((r) => r.status === 'fail').length;
  const totalTested  = allResults.filter((r) => r.status !== 'untested').length;
  const totalCriteria = audit.pages.length * wcagCriteria.length;
  const overallProgress = totalCriteria > 0
    ? Math.round((totalTested / totalCriteria) * 100)
    : 0;
  const overallPassRate = totalTested > 0
    ? Math.round((totalPassed / totalTested) * 100)
    : 0;

  return (
    <>
      <div className="page-header">
        <div style={{ minWidth: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/" className="text-muted" style={{ fontSize: '14px' }}>
              Dashboard
            </Link>
            <span className="text-muted" style={{ fontSize: '14px' }}>/</span>
            <span style={{ fontSize: '14px' }}>{audit.name}</span>
          </div>
          <h1>{audit.name}</h1>
          <p className="page-subtitle">{audit.url}</p>
        </div>
        <Link href="/" className="btn btn-outline flex-shrink-0">
          ← Back
        </Link>
      </div>

      <div className="page-body">

        {/* Overview stats */}
        <div className="stat-grid mb-6">
          <div className="stat-card">
            <div className="stat-card-value">{audit.pages.length}</div>
            <div className="stat-card-label">Pages</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-value">{overallProgress}%</div>
            <div className="stat-card-label">Complete</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-value" style={{
              color: totalFailed > 0 ? 'var(--color-danger)' : 'var(--color-success)'
            }}>
              {totalFailed}
            </div>
            <div className="stat-card-label">Failures</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-value">{overallPassRate > 0 ? `${overallPassRate}%` : '—'}</div>
            <div className="stat-card-label">Pass Rate</div>
          </div>
        </div>

        {/* Pages */}
        <div className="card mb-6">
          <div className="card-header flex items-center justify-between">
            <h2>Pages</h2>
            <span className="text-muted" style={{ fontSize: '14px' }}>
              {audit.pages.length} page{audit.pages.length !== 1 ? 's' : ''}
            </span>
          </div>

          {pagesWithStats.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📄</div>
              <h3>No pages yet</h3>
              <p>
                Add the pages you want to audit below. Each page gets its
                own guided WCAG 2.1 checklist.
              </p>
            </div>
          ) : (
            <PageList pages={pagesWithStats} auditId={audit.id} />
          )}
        </div>

        {/* Add page form */}
        <div className="card">
          <div className="card-header">
            <h2>Add a Page</h2>
            <p className="text-muted mt-2" style={{ fontSize: '14px' }}>
              Add each page you want to audit. Each page will have its own
              guided checklist of {wcagCriteria.length} WCAG 2.1 AA criteria.
            </p>
          </div>
          <div className="card-body">
            <AddPageForm auditId={audit.id} baseUrl={audit.url} />
          </div>
        </div>

      </div>
    </>
  );
}