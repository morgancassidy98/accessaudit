import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { wcagCriteria } from '@/lib/wcag-criteria';
import { ReportSummary } from '@/components/ReportSummary';
import { ReportExport } from '@/components/ReportExport';
import { getAuthenticatedUserId } from '@/lib/ownership';


async function getAuditReport(id: string, userId: string) {
  const audit = await prisma.audit.findFirst({
    where: { id, userId },
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

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await getAuthenticatedUserId();
  if (!userId) notFound();
  const audit = await getAuditReport(id, userId);

  // Build full report data
  const reportPages = audit.pages.map((page) => {
    const resultsByCriterion = page.results.reduce<Record<string, typeof page.results[0]>>(
      (acc, r) => { acc[r.criterionId] = r; return acc; },
      {}
    );

    const failures = wcagCriteria
      .filter((c) => resultsByCriterion[c.id]?.status === 'fail')
      .map((c) => ({
        criterion: c,
        result: resultsByCriterion[c.id],
      }));

    const passed  = page.results.filter((r) => r.status === 'pass').length;
    const failed  = page.results.filter((r) => r.status === 'fail').length;
    const na      = page.results.filter((r) => r.status === 'na').length;
    const tested  = passed + failed + na;
    const passRate = tested > 0 ? Math.round((passed / tested) * 100) : 0;
    const progress = Math.round((tested / wcagCriteria.length) * 100);

    return {
      ...page,
      failures,
      stats: { passed, failed, na, tested, passRate, progress },
    };
  });

  // Overall stats
  const allResults = audit.pages.flatMap((p) => p.results);
  const totalPassed   = allResults.filter((r) => r.status === 'pass').length;
  const totalFailed   = allResults.filter((r) => r.status === 'fail').length;
  const totalNa       = allResults.filter((r) => r.status === 'na').length;
  const totalTested   = totalPassed + totalFailed + totalNa;
  const totalCriteria = audit.pages.length * wcagCriteria.length;
  const overallProgress = totalCriteria > 0
    ? Math.round((totalTested / totalCriteria) * 100)
    : 0;
  const overallPassRate = totalTested > 0
    ? Math.round((totalPassed / totalTested) * 100)
    : 0;

  // Failures by principle
  const failuresByPrinciple = ['Perceivable', 'Operable', 'Understandable', 'Robust'].map((principle) => {
    const failures = reportPages.flatMap((p) =>
      p.failures.filter((f) => f.criterion.principle === principle)
    );
    return { principle, count: failures.length };
  });

  // Critical failures across all pages
  const criticalFailures = reportPages.flatMap((page) =>
    page.failures
      .filter((f) => f.result.severity === 'critical' || f.result.severity === 'serious')
      .map((f) => ({ ...f, pageTitle: page.title, pageUrl: page.url }))
  );

  const overallStats = {
    totalPassed,
    totalFailed,
    totalNa,
    totalTested,
    totalCriteria,
    overallProgress,
    overallPassRate,
  };

  return (
    <>
      <div className="page-header">
        <div style={{ minWidth: 0 }}>
          <nav className="page-breadcrumb" aria-label="Breadcrumb">
            <Link href={`/audit/${id}`}>
              {audit.name}
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Report</span>
          </nav>
          <h1>Accessibility Report</h1>
          <p className="page-subtitle">{audit.url}</p>
        </div>
        <div className="report-header-actions flex gap-3">
          <Link href={`/audit/${id}`} className="btn btn-outline back-button">
            <span className="back-button-content gap-2">
              <span aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
              <span>Back to Audit</span>
            </span>
          </Link>
          <ReportExport
            audit={audit}
            pages={reportPages}
            overallStats={overallStats}
          />
        </div>
      </div>

      <div className="page-body">

        {/* Overall summary */}
        <div className="stat-grid mb-6">
          <div className="stat-card">
            <div className="stat-card-value">{overallProgress}%</div>
            <div className="stat-card-label">Tested</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-value" style={{ color: '#2d5a1e' }}>
              {totalPassed}
            </div>
            <div className="stat-card-label">Passed</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-value" style={{
              color: totalFailed > 0 ? 'var(--color-danger)' : '#2d5a1e'
            }}>
              {totalFailed}
            </div>
            <div className="stat-card-label">Failed</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-value">{overallPassRate > 0 ? `${overallPassRate}%` : '—'}</div>
            <div className="stat-card-label">Pass Rate</div>
          </div>
        </div>

        {/* Failures by principle */}
        <div className="card mb-6">
          <div className="card-header">
            <h2>Failures by Principle</h2>
          </div>
          <div className="card-body">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '16px',
            }}>
              {failuresByPrinciple.map(({ principle, count }) => (
                <div key={principle} style={{
                  padding: '16px 20px',
                  background: count > 0 ? 'var(--color-danger-light)' : 'var(--color-success-light)',
                  borderRadius: 'var(--radius)',
                  border: `1px solid ${count > 0 ? 'rgba(76,6,29,0.15)' : 'rgba(134,168,115,0.3)'}`,
                }}>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '32px',
                    fontWeight: 600,
                    color: count > 0 ? '#6e0d2a' : '#2d5a1e',
                    lineHeight: 1,
                    marginBottom: '6px',
                  }}>
                    {count}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: count > 0 ? '#6e0d2a' : '#2d5a1e',
                    fontWeight: 500,
                  }}>
                    {principle}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Critical and serious failures */}
        {criticalFailures.length > 0 && (
          <div className="card mb-6">
            <div className="card-header">
              <h2>Critical & Serious Failures</h2>
              <p className="text-muted mt-2" style={{ fontSize: '14px' }}>
                These issues create significant barriers and should be addressed first.
              </p>
            </div>
            <div>
              {criticalFailures.map((failure, i) => (
                <div key={i} style={{
                  padding: '20px 28px',
                  borderBottom: '1px solid var(--color-border)',
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start',
                }}>
                  <div style={{ flexShrink: 0 }}>
                    <span className={`badge ${
                      failure.result.severity === 'critical' ? 'badge-danger' : 'badge-warning'
                    }`}>
                      {failure.result.severity}
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '14px',
                        color: 'var(--color-primary)',
                        background: 'var(--color-primary-light)',
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-sm)',
                      }}>
                        {failure.criterion.id}
                      </span>
                      <span style={{ fontWeight: 500, fontSize: '15px' }}>
                        {failure.criterion.title}
                      </span>
                    </div>
                    <div className="text-muted" style={{ fontSize: '13px', marginBottom: '6px' }}>
                      WCAG {failure.criterion.level} · {failure.criterion.principle} · {failure.criterion.guideline}
                    </div>
                    <p style={{ fontSize: '14px', lineHeight: 1.5, marginBottom: '6px' }}>
                      {failure.criterion.description}
                    </p>
                    <div className="text-muted report-failure-page" style={{ fontSize: '14px', marginBottom: '6px' }}>
                      {failure.pageTitle} — {failure.pageUrl}
                    </div>
                    {failure.result.notes && (
                      <div style={{
                        fontSize: '14px',
                        color: '#333',
                        background: 'var(--color-bg)',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius)',
                        marginTop: '8px',
                      }}>
                        {failure.result.notes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Per-page report */}
        <ReportSummary pages={reportPages} auditId={id} />

      </div>
    </>
  );
}