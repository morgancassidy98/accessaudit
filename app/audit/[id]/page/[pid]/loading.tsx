function Skeleton({ className }: { className: string }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

export default function Loading() {
  return (
    <div className="checklist-shell loading-checklist" aria-busy="true" aria-live="polite" aria-label="Loading checklist">
      <div className="checklist-topbar">
        <Skeleton className="skeleton-checklist-back" />
        <div className="loading-checklist-title">
          <Skeleton className="skeleton-checklist-title" />
          <Skeleton className="skeleton-checklist-url" />
        </div>
        <div className="loading-checklist-actions">
          <Skeleton className="skeleton-checklist-scan" />
          <Skeleton className="skeleton-checklist-progress" />
        </div>
      </div>
      <div className="checklist-body">
        <aside className="checklist-nav loading-checklist-nav">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="skeleton-checklist-nav-item" />
          ))}
        </aside>
        <main className="checklist-main">
          <div className="card loading-criterion-card">
            <Skeleton className="skeleton-criterion-kicker" />
            <Skeleton className="skeleton-criterion-title" />
            <Skeleton className="skeleton-criterion-copy" />
            <Skeleton className="skeleton-criterion-copy skeleton-criterion-copy-short" />
            <Skeleton className="skeleton-criterion-control" />
          </div>
        </main>
      </div>
    </div>
  );
}
