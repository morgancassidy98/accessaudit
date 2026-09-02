import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { wcagCriteria } from '@/lib/wcag-criteria';
import { SignOutButton } from '@/components/SignOutButton';
import { DeleteAccountButton } from '@/components/DeleteAccountButton';

export const revalidate = 0;

async function getProfileData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      accounts: { select: { provider: true } },
      audits: {
        orderBy: { createdAt: 'desc' },
        include: {
          pages: {
            include: { results: true },
          },
        },
      },
    },
  });
  return user;
}

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const user = await getProfileData(session.user.id);
  if (!user) redirect('/login');

  // Compute overall stats
  const allResults = user.audits.flatMap((a) =>
    a.pages.flatMap((p) => p.results)
  );
  const totalAudits   = user.audits.length;
  const totalPages    = user.audits.reduce((acc, a) => acc + a.pages.length, 0);
  const totalTested   = allResults.filter((r) => r.status !== 'untested').length;
  const totalPassed   = allResults.filter((r) => r.status === 'pass').length;
  const totalFailed   = allResults.filter((r) => r.status === 'fail').length;
  const totalCriteria = totalPages * wcagCriteria.length;
  const overallProgress = totalCriteria > 0
    ? Math.round((totalTested / totalCriteria) * 100)
    : 0;
  const overallPassRate = totalTested > 0
    ? Math.round((totalPassed / totalTested) * 100)
    : 0;

  // Recent audits — last 5
  const recentAudits = user.audits.slice(0, 5).map((audit) => {
    const results = audit.pages.flatMap((p) => p.results);
    const passed  = results.filter((r) => r.status === 'pass').length;
    const failed  = results.filter((r) => r.status === 'fail').length;
    const na      = results.filter((r) => r.status === 'na').length;
    const tested  = passed + failed + na;
    const total   = audit.pages.length * wcagCriteria.length;
    const progress = total > 0 ? Math.round((tested / total) * 100) : 0;
    const status =
      total === 0    ? 'empty'
      : tested === 0 ? 'not-started'
      : tested < total ? 'in-progress'
      : failed === 0   ? 'complete'
      : 'complete-with-issues';

    return { ...audit, stats: { passed, failed, tested, total, progress, status } };
  });

  const connectedProviders = user.accounts.map((a) => a.provider);

  return (
    <>
      <div className="page-header">
        <div className="flex items-center gap-3" style={{ minWidth: 0 }}>
          <Link href="/" className="text-muted" style={{ fontSize: '14px' }}>
            Dashboard
          </Link>
          <span className="text-muted" style={{ fontSize: '14px' }}>/</span>
          <span style={{ fontSize: '14px' }}>Profile</span>
        </div>
      </div>

      <div className="page-body">

        {/* User info */}
       <div className="flex items-center gap-5 mb-6">
  {user.image && (
    <img
      src={user.image}
      alt={user.name ?? 'User avatar'}
      style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        border: '3px solid var(--color-border)',
        flexShrink: 0,
      }}
    />
  )}
  <div style={{ paddingLeft: '8px' }}>
    <h1 style={{
      fontFamily: 'var(--font-display)',
      fontSize: '28px',
      marginBottom: '6px',
    }}>
      {user.name ?? 'Anonymous User'}
    </h1>
    <div className="text-muted" style={{ fontSize: '15px', marginBottom: '10px' }}>
      {user.email}
    </div>
    <div className="flex gap-2">
      {connectedProviders.map((provider) => (
        <span key={provider} className="badge badge-primary">
          {provider.charAt(0).toUpperCase() + provider.slice(1)}
        </span>
      ))}
    </div>
  </div>
</div>

        {/* Stats */}
        <div className="stat-grid mb-6">
          <div className="stat-card">
            <div className="stat-card-value">{totalAudits}</div>
            <div className="stat-card-label">Total Audits</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-value">{totalPages}</div>
            <div className="stat-card-label">Pages Audited</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-value">{overallProgress > 0 ? `${overallProgress}%` : '—'}</div>
            <div className="stat-card-label">Overall Progress</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-value"
              style={{
                color: overallPassRate >= 90 ? '#2d5a1e'
                  : overallPassRate >= 70 ? '#4a3a10'
                  : overallPassRate > 0 ? 'var(--color-danger)'
                  : 'var(--color-primary)',
              }}
            >
              {overallPassRate > 0 ? `${overallPassRate}%` : '—'}
            </div>
            <div className="stat-card-label">Overall Pass Rate</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-value" style={{ color: '#2d5a1e' }}>
              {totalPassed}
            </div>
            <div className="stat-card-label">Criteria Passed</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-value"
              style={{ color: totalFailed > 0 ? 'var(--color-danger)' : '#2d5a1e' }}
            >
              {totalFailed}
            </div>
            <div className="stat-card-label">Criteria Failed</div>
          </div>
        </div>

        {/* Recent audits */}
        <div className="card mb-6">
          <div className="card-header flex items-center justify-between">
            <h2>Recent Audits</h2>
            <Link href="/" className="btn btn-ghost btn-sm">
              View All
            </Link>
          </div>

          {recentAudits.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 32px' }}>
              <h3 style={{ fontSize: '20px' }}>No audits yet</h3>
              <p>Create your first audit to get started.</p>
              <Link href="/audit/new" className="btn btn-primary">
                New Audit
              </Link>
            </div>
          ) : (
            <div>
              {recentAudits.map((audit) => (
                <div key={audit.id} style={{
                  padding: '16px 24px',
                  borderBottom: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: '15px', marginBottom: '2px' }}>
                      {audit.name}
                    </div>
                    <div className="text-muted" style={{
                      fontSize: '13px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {audit.url}
                    </div>
                  </div>

                  <div style={{ width: '100px', flexShrink: 0 }}>
                    <div className="progress-bar">
                      <div
                        className={`progress-bar-fill ${
                          audit.stats.progress === 100
                            ? audit.stats.failed > 0 ? 'danger' : 'success'
                            : ''
                        }`}
                        style={{ width: `${audit.stats.progress}%` }}
                      />
                    </div>
                    <div style={{ fontSize: '12px', color: '#555', marginTop: '3px', textAlign: 'right' }}>
                      {audit.stats.progress}%
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/audit/${audit.id}`} className="btn btn-outline btn-sm">
                      Open
                    </Link>
                    <Link href={`/audit/${audit.id}/report`} className="btn btn-ghost btn-sm">
                      Report
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Account */}
        <div className="card mb-6">
          <div className="card-header">
            <h2>Account</h2>
          </div>
          <div className="card-body">
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}>
              <div>
                <div className="form-label" style={{ marginBottom: '6px' }}>
                  Connected Providers
                </div>
                <div className="flex gap-2 flex-wrap">
                  {connectedProviders.map((provider) => (
                    <div key={provider} style={{
                      padding: '8px 16px',
                      background: 'var(--color-primary-light)',
                      borderRadius: 'var(--radius)',
                      fontSize: '14px',
                      color: 'var(--color-primary)',
                      fontWeight: 500,
                    }}>
                      ✓ {provider.charAt(0).toUpperCase() + provider.slice(1)} connected
                    </div>
                  ))}
                </div>
              </div>

              <div className="divider" />

              <div>
                <div className="form-label" style={{ marginBottom: '6px' }}>
                  Session
                </div>
                <SignOutButton />
              </div>
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <div className="card" style={{
          borderColor: 'rgba(76,6,29,0.25)',
        }}>
          <div className="card-header" style={{
            borderColor: 'rgba(76,6,29,0.15)',
          }}>
            <h2 style={{ color: 'var(--color-danger)' }}>Danger Zone</h2>
            <p className="text-muted mt-2" style={{ fontSize: '14px' }}>
              Permanently delete your account and all associated audits. This cannot be undone.
            </p>
          </div>
          <div className="card-body">
            <DeleteAccountButton userId={user.id} />
          </div>
        </div>

      </div>
    </>
  );
}