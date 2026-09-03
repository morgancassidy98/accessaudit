import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { wcagCriteria } from '@/lib/wcag-criteria';
import { AddPageForm } from '@/components/AddPageForm';
import { EditAuditForm } from '@/components/EditAuditForm';
import { PageDiscovery } from '@/components/PageDiscovery';
import { PageList } from '@/components/PageList';
import { ArrowLeftIcon, FileIcon } from '@/components/icons';
import { DuplicateButton } from '@/components/DuplicateButton';
import { getAuthenticatedUserId } from '@/lib/ownership';

async function getAudit(id: string, userId: string) {
  const audit = await prisma.audit.findFirst({
    where: { id, userId },
    include: {
      pages: {
        orderBy: { sortOrder: 'asc' },
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
  const userId = await getAuthenticatedUserId();
  if (!userId) notFound();
  const audit = await getAudit(id, userId);

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
          <nav className="page-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">
              Dashboard
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{audit.name}</span>
          </nav>
          <h1>{audit.name}</h1>
          <p className="page-subtitle">{audit.url}</p>
        </div>
        <div className="page-header-actions flex gap-3">
          <Link href={`/audit/${id}/report`} className="btn btn-outline">
            View Report
          </Link>
          <DuplicateButton auditId={audit.id} />
          <EditAuditForm
            auditId={audit.id}
            initialName={audit.name}
            initialUrl={audit.url}
          />
          <Link href="/" className="btn btn-outline back-button flex-shrink-0">
            <span className="back-button-content gap-2">
              <ArrowLeftIcon size={14} />
              <span>Back</span>
            </span>
          </Link>
        </div>
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
              <div className="empty-state-icon"><FileIcon size={24} /></div>
              <h3>No pages yet</h3>
              <p>
                Add the pages you want to audit using the tools below. Each page
                gets its own guided WCAG 2.1 checklist.
              </p>
            </div>
          ) : (
            <PageList pages={pagesWithStats} auditId={audit.id} />
          )}
        </div>

        {/* Add and discover pages */}
        <div className="card">
          <div className="card-header">
            <h2>Add Pages</h2>
            <p className="text-muted mt-2 text-small">
              Find pages automatically or add one manually. Each page gets its own
              guided checklist of {wcagCriteria.length} WCAG accessibility criteria.
            </p>
          </div>
          <div className="card-body page-add-tools">
            <PageDiscovery auditId={audit.id} />
            <div className="page-manual-add">
              <div className="page-tool-kicker">Manual entry</div>
              <h3>Add a page manually</h3>
              <AddPageForm auditId={audit.id} baseUrl={audit.url} />
            </div>
          </div>
        </div>

      </div>
    </>
  );
}