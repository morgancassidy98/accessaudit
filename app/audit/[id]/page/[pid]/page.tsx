import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { wcagCriteria } from '@/lib/wcag-criteria';
import { ChecklistNav } from '@/components/ChecklistNav';
import { CriterionCard } from '@/components/CriterionCard';
import { ScanButton } from '@/components/PageList';
import Link from 'next/link';
import { getAuthenticatedUserId } from '@/lib/ownership';

export const revalidate = 0;


async function getPage(pid: string, userId: string) {
  const page = await prisma.page.findUnique({
    where: { id: pid },
    include: {
      audit: true,
      results: true,
    },
  });
  if (!page || page.audit.userId !== userId) notFound();
  return page;
}

export default async function ChecklistPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; pid: string }>;
  searchParams: Promise<{ criterion?: string }>;
}) {
  const { id, pid } = await params;
  const { criterion } = await searchParams;

  const userId = await getAuthenticatedUserId();
  if (!userId) notFound();
  const page = await getPage(pid, userId);

  // Parse stored Lighthouse data
  const lighthouseAudits = page.lighthouseData
    ? JSON.parse(page.lighthouseData)
    : null;

  // Map results by criterion ID for quick lookup
  const resultsByCriterion = page.results.reduce<Record<string, typeof page.results[0]>>(
    (acc, result) => {
      acc[result.criterionId] = result;
      return acc;
    },
    {}
  );

  // Sort criteria — flagged by automation first, then by principle order
  const sortedCriteria = [...wcagCriteria].sort((a, b) => {
    const aFlagged = resultsByCriterion[a.id]?.automatedStatus === 'fail';
    const bFlagged = resultsByCriterion[b.id]?.automatedStatus === 'fail';
    if (aFlagged && !bFlagged) return -1;
    if (!aFlagged && bFlagged) return 1;
    return 0;
  });

  // Active criterion — default to first
  const activeCriterionId = criterion ?? sortedCriteria[0].id;
  const activeCriterion = wcagCriteria.find((c) => c.id === activeCriterionId)
    ?? sortedCriteria[0];
  const activeResult = resultsByCriterion[activeCriterion.id];

  // Get Lighthouse data for active criterion
  const activeLighthouseAudits = activeCriterion.lighthouseAuditIds
    ?.map((auditId) => ({
      id: auditId,
      data: lighthouseAudits?.[auditId],
    }))
    .filter((a) => a.data && a.data.score !== null && a.data.score < 1) ?? [];

  // Stats for the progress bar
  const passed   = page.results.filter((r) => r.status === 'pass').length;
  const failed   = page.results.filter((r) => r.status === 'fail').length;
  const na       = page.results.filter((r) => r.status === 'na').length;
  const tested   = passed + failed + na;
  const progress = Math.round((tested / wcagCriteria.length) * 100);

  return (
    <div className="checklist-shell">

      {/* Top bar */}
      <div className="checklist-topbar">
        <div className="flex items-center gap-3" style={{ minWidth: 0 }}>
          <Link
            href={`/audit/${id}`}
            className="btn btn-ghost btn-sm"
            style={{ flexShrink: 0 }}
          >
            <span aria-hidden="true" style={{ display: 'inline-flex', alignItems: 'center' }}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                <path d="M15 18L9 12L15 6" />
              </svg>
            </span>
            Back
          </Link>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontWeight: 500,
              fontSize: '16px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {page.title}
            </div>
            <div className="text-muted" style={{
              fontSize: '14px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {page.url}
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="checklist-topbar-actions">
          {page.lighthouseData && (
            <div className="checklist-scan-notice" role="status">
              <div className="checklist-scan-body">
                <div className="checklist-scan-badge">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginRight: '4px' }}>
                    <path d="M13 2L5 13H11L9 22L19 10H13L15 2Z" />
                  </svg>
                  <span>{page.lighthouseScore ?? 0}/100</span>
                </div>
                <span className="checklist-scan-text">Flagged criteria are sorted to the top.</span>
              </div>
            </div>
          )}
          <ScanButton
            pageId={page.id}
            auditId={id}
            pageUrl={page.url}
            label={page.scannedAt === null ? 'Auto-scan' : 'Rescan'}
          />
          <div className="checklist-progress">
            <div className="checklist-progress-main">
              <div className="progress-bar" style={{ width: '160px' }}>
                <div
                  className="progress-bar-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="checklist-progress-value">
                {tested} / {wcagCriteria.length}
              </span>
            </div>
            <div className="checklist-progress-meta">
              <span style={{ color: '#2d5a1e' }}>Pass {passed}</span>
              <span style={{ color: '#6e0d2a' }}>Fail {failed}</span>
              <span style={{ color: '#2f2f2f' }}>N/A {na}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="checklist-body">

        {/* Nav panel */}
        <ChecklistNav
          criteria={sortedCriteria}
          results={resultsByCriterion}
          activeCriterionId={activeCriterionId}
          auditId={id}
          pageId={pid}
        />

        {/* Main content */}
        <main className="checklist-main" id="main-content" tabIndex={-1}>
          <CriterionCard
            criterion={activeCriterion}
            result={activeResult}
            lighthouseAudits={activeLighthouseAudits}
            allCriteria={sortedCriteria}
            auditId={id}
            pageId={pid}
          />
        </main>

      </div>
    </div>
  );
}