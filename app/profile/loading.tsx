function Skeleton({ className }: { className: string }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

export default function Loading() {
  return (
    <div className="loading-shell" aria-busy="true" aria-live="polite" aria-label="Loading profile">
      <div className="page-header"><Skeleton className="skeleton-breadcrumb" /></div>
      <div className="page-body">
        <div className="loading-profile">
          <Skeleton className="skeleton-avatar" />
          <div className="loading-form-lines">
            <Skeleton className="skeleton-profile-name" />
            <Skeleton className="skeleton-profile-email" />
            <Skeleton className="skeleton-profile-badge" />
          </div>
        </div>
        <div className="card mb-6">
          <div className="card-header"><Skeleton className="skeleton-table-title" /></div>
          <div className="loading-list">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="loading-row">
                <Skeleton className="skeleton-row-name" />
                <Skeleton className="skeleton-row-url" />
                <Skeleton className="skeleton-row-progress" />
              </div>
            ))}
          </div>
        </div>
        <div className="card loading-account-card">
          <div className="card-header"><Skeleton className="skeleton-table-title" /></div>
          <div className="card-body loading-form-lines"><Skeleton className="skeleton-description" /><Skeleton className="skeleton-action" /></div>
        </div>
      </div>
    </div>
  );
}
