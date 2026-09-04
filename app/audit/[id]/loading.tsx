function Skeleton({ className }: { className: string }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

export default function Loading() {
  return (
    <div className="loading-shell" aria-busy="true" aria-live="polite" aria-label="Loading audit">
      <div className="page-header">
        <div className="loading-header-copy">
          <Skeleton className="skeleton-breadcrumb" />
          <Skeleton className="skeleton-title skeleton-title-wide" />
          <Skeleton className="skeleton-subtitle" />
        </div>
        <div className="loading-actions">
          <Skeleton className="skeleton-action" />
          <Skeleton className="skeleton-action" />
          <Skeleton className="skeleton-action" />
        </div>
      </div>
      <div className="page-body">
        <div className="stat-grid mb-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="stat-card">
              <Skeleton className="skeleton-stat-value" />
              <Skeleton className="skeleton-stat-label" />
            </div>
          ))}
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
        <div className="card loading-card-large">
          <div className="card-header">
            <Skeleton className="skeleton-table-title" />
            <Skeleton className="skeleton-description" />
          </div>
          <div className="card-body loading-form-lines">
            <Skeleton className="skeleton-form-line" />
            <Skeleton className="skeleton-form-line skeleton-form-line-short" />
          </div>
        </div>
      </div>
    </div>
  );
}
