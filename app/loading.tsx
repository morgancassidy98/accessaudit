export default function Loading() {
  return (
    <div className="loading-shell" aria-busy="true" aria-live="polite" aria-label="Loading content">
      <div className="page-header">
        <div className="loading-header-copy">
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-subtitle" />
        </div>
        <div className="skeleton skeleton-button" />
      </div>

      <div className="page-body">
        <div className="stat-grid">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="stat-card">
              <div className="skeleton skeleton-stat-value" />
              <div className="skeleton skeleton-stat-label" />
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header flex items-center justify-between">
            <div className="skeleton skeleton-table-title" />
            <div className="skeleton skeleton-table-meta" />
          </div>

          <div className="loading-list">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="loading-row">
                <div className="skeleton skeleton-row-name" />
                <div className="skeleton skeleton-row-url" />
                <div className="skeleton skeleton-row-progress" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
