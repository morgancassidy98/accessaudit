function Skeleton({ className }: { className: string }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

export default function Loading() {
  return (
    <div className="loading-shell" aria-busy="true" aria-live="polite" aria-label="Loading report">
      <div className="page-header">
        <div className="loading-header-copy">
          <Skeleton className="skeleton-breadcrumb" />
          <Skeleton className="skeleton-title skeleton-title-wide" />
          <Skeleton className="skeleton-subtitle" />
        </div>
        <div className="loading-actions">
          <Skeleton className="skeleton-action skeleton-action-wide" />
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
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="card mb-6">
            <div className="card-header"><Skeleton className="skeleton-table-title skeleton-table-title-wide" /></div>
            <div className="card-body loading-report-grid">
              {Array.from({ length: 4 }).map((__, itemIndex) => (
                <Skeleton key={itemIndex} className="skeleton-report-item" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
