import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { wcagCriteria } from '@/lib/wcag-criteria';
import { ChecklistNav } from '@/components/ChecklistNav';
import { CriterionCard } from '@/components/CriterionCard';
import Link from 'next/link';

async function getPage(pid: string) {
  const page = await prisma.page.findUnique({
    where: { id: pid },
    include: {
      audit: true,
      results: true,
    },
  });
  if (!page) notFound();
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

  const page = await getPage(pid);

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
            ← Back
          </Link>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontWeight: 500,
              fontSize: '15px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {page.title}
            </div>
            <div className="text-muted" style={{
              fontSize: '13px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {page.url}
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="checklist-progress">
          <div className="flex items-center gap-3">
            <div className="progress-bar" style={{ width: '160px' }}>
              <div
                className="progress-bar-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span style={{ fontSize: '14px', color: '#555', flexShrink: 0 }}>
              {tested} / {wcagCriteria.length}
            </span>
          </div>
          <div className="flex gap-3 mt-1" style={{ justifyContent: 'flex-end' }}>
            <span style={{ fontSize: '13px', color: '#2d5a1e' }}>✓ {passed}</span>
            <span style={{ fontSize: '13px', color: '#6e0d2a' }}>✕ {failed}</span>
            <span style={{ fontSize: '13px', color: '#555' }}>N/A {na}</span>
          </div>
        </div>
      </div>

      {/* Automated scan banner */}
      {page.lighthouseData && (
        <div className="checklist-scan-notice" role="status">
          <span>⚡</span>
          <span>
            Automated scan complete — Lighthouse score: <strong>{page.lighthouseScore}</strong>.
            Flagged criteria are sorted to the top. Automated results are a starting point only —
            manual testing is required to verify each issue.
          </span>
        </div>
      )}

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