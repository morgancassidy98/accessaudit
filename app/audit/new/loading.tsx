function Skeleton({ className }: { className: string }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

export default function Loading() {
  return (
    <div className="loading-shell" aria-busy="true" aria-live="polite" aria-label="Loading new audit form">
      <div className="page-header">
        <div className="loading-header-copy">
          <Skeleton className="skeleton-breadcrumb" />
          <Skeleton className="skeleton-title" />
          <Skeleton className="skeleton-subtitle" />
        </div>
        <Skeleton className="skeleton-action" />
      </div>
      <div className="page-body">
        <div className="loading-form-card card">
          <div className="card-header"><Skeleton className="skeleton-table-title" /></div>
          <div className="card-body loading-form-lines">
            <Skeleton className="skeleton-form-label" />
            <Skeleton className="skeleton-input" />
            <Skeleton className="skeleton-form-label" />
            <Skeleton className="skeleton-input" />
            <Skeleton className="skeleton-submit" />
          </div>
        </div>
        <div className="card mt-6 loading-info-card">
          <div className="card-body loading-form-lines">
            <Skeleton className="skeleton-table-title" />
            <Skeleton className="skeleton-description" />
            <Skeleton className="skeleton-description" />
          </div>
        </div>
      </div>
    </div>
  );
}
