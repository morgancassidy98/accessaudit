import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { wcagCriteria } from '@/lib/wcag-criteria';

export default async function SharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const audit = await prisma.audit.findUnique({
    where: { id },
    include: {
      pages: {
        include: { results: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!audit) notFound();

  const allResults = audit.pages.flatMap((p) => p.results);
  const totalPassed  = allResults.filter((r) => r.status === 'pass').length;
  const totalFailed  = allResults.filter((r) => r.status === 'fail').length;
  const totalTested  = allResults.filter((r) => r.status !== 'untested').length;
  const totalCriteria = audit.pages.length * wcagCriteria.length;
  const passRate = totalTested > 0 ? Math.round((totalPassed / totalTested) * 100) : 0;
  const progress = totalCriteria > 0 ? Math.round((totalTested / totalCriteria) * 100) : 0;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 32px' }}>

      {/* Header */}
      <div style={{
        background: 'var(--color-sidebar)',
        borderRadius: 'var(--radius-lg)',
        padding: '32px',
        marginBottom: '32px',
        color: '#ffffff',
      }}>
        <div style={{
          fontSize: '12px',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.5)',
          marginBottom: '8px',
        }}>
          Accessibility Audit Report
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '32px',
          color: '#ffffff',
          marginBottom: '6px',
        }}>
          {audit.name}
        </h1>
        <div style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)' }}>
          {audit.url}
        </div>
        <div style={{
          fontSize: '13px',
          color: 'rgba(255,255,255,0.4)',
          marginTop: '8px',
        }}>
          Generated {new Date(audit.createdAt).toLocaleDateString()}
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid mb-6">
        <div className="stat-card">
          <div className="stat-card-value">{progress}%</div>
          <div className="stat-card-label">Tested</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value" style={{ color: '#2d5a1e' }}>{totalPassed}</div>
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
          <div className="stat-card-value">{passRate > 0 ? `${passRate}%` : '—'}</div>
          <div className="stat-card-label">Pass Rate</div>
        </div>
      </div>

      {/* Pages */}
      <div className="card">
        <div className="card-header">
          <h2>Pages Audited</h2>
        </div>
        <div>
          {audit.pages.map((page) => {
            const passed  = page.results.filter((r) => r.status === 'pass').length;
            const failed  = page.results.filter((r) => r.status === 'fail').length;
            const tested  = page.results.filter((r) => r.status !== 'untested').length;
            const rate    = tested > 0 ? Math.round((passed / tested) * 100) : 0;
            const prog    = Math.round((tested / wcagCriteria.length) * 100);

            return (
              <div key={page.id} style={{
                padding: '20px 28px',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px',
              }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: '16px', marginBottom: '3px' }}>
                    {page.title}
                  </div>
                  <div className="text-muted" style={{
                    fontSize: '14px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '400px',
                  }}>
                    {page.url}
                  </div>
                </div>
                <div className="flex gap-4 items-center flex-shrink-0">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '20px',
                      fontWeight: 600,
                      color: failed > 0 ? '#6e0d2a' : '#2d5a1e',
                    }}>
                      {failed}
                    </div>
                    <div style={{ fontSize: '12px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Failed
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '20px',
                      fontWeight: 600,
                      color: rate >= 90 ? '#2d5a1e' : rate >= 70 ? '#4a3a10' : '#6e0d2a',
                    }}>
                      {rate > 0 ? `${rate}%` : '—'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Pass Rate
                    </div>
                  </div>
                  <div style={{ width: '80px' }}>
                    <div className="progress-bar">
                      <div
                        className={`progress-bar-fill ${prog === 100 ? failed > 0 ? 'danger' : 'success' : ''}`}
                        style={{ width: `${prog}%` }}
                      />
                    </div>
                    <div style={{ fontSize: '12px', color: '#555', marginTop: '3px', textAlign: 'right' }}>
                      {prog}%
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{
        textAlign: 'center',
        marginTop: '40px',
        fontSize: '14px',
        color: '#888',
      }}>
        Generated by AccessAudit · WCAG 2.1 AA Accessibility Auditing
      </div>
    </div>
  );
}