export default function SkeletonLoader({ variant = 'home' }) {
  if (variant === 'exam') {
    return (
      <div className="skeleton-wrapper" aria-busy="true" aria-label="Loading examination">
        <div className="skeleton-topbar">
          <div className="skeleton-block skeleton-pill-lg" />
          <div className="skeleton-block skeleton-btn" />
        </div>

        <div className="skeleton-tabs">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton-block skeleton-tab" />
          ))}
        </div>

        <div className="exam-layout">
          <div className="skeleton-card">
            <div className="skeleton-block skeleton-line-short" />
            <div className="skeleton-block skeleton-title" />
            <div className="skeleton-options">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton-block skeleton-option" />
              ))}
            </div>
          </div>
          <div className="skeleton-card">
            <div className="skeleton-block skeleton-line-short" />
            <div className="skeleton-palette-grid">
              {Array.from({ length: 20 }).map((_, idx) => (
                <div key={idx} className="skeleton-block skeleton-num" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'result') {
    return (
      <div className="skeleton-wrapper" aria-busy="true" aria-label="Loading results">
        <div className="skeleton-card">
          <div className="skeleton-block skeleton-title" />
          <div className="skeleton-metrics-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton-block skeleton-metric" />
            ))}
          </div>
          <div className="skeleton-block skeleton-table" />
        </div>
      </div>
    );
  }

  // Default: Home / Login Skeleton
  return (
    <div className="home-grid skeleton-wrapper" aria-busy="true" aria-label="Loading Olympiad portal">
      <div className="skeleton-card">
        <div className="skeleton-block skeleton-line-short" />
        <div className="skeleton-block skeleton-title" />
        <div className="skeleton-block skeleton-line-med" />
        <div className="skeleton-tabs">
          <div className="skeleton-block skeleton-tab-wide" />
          <div className="skeleton-block skeleton-tab-wide" />
        </div>
        <div className="skeleton-block skeleton-table" />
      </div>

      <div className="skeleton-card">
        <div className="skeleton-block skeleton-title" />
        <div className="skeleton-block skeleton-line-med" />
        <div className="skeleton-form-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton-block skeleton-input" />
          ))}
        </div>
        <div className="skeleton-block skeleton-btn-full" />
      </div>
    </div>
  );
}
