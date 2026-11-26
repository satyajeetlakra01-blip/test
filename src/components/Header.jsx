export default function Header({ theme, onToggleTheme, candidate }) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="brand-mark">
          <img
            src="/nso-logo.png"
            alt="National Scholastic Olympiad Logo"
            className="brand-logo-img"
          />
          <div>
            <p className="brand-title">National Scholastic Olympiad</p>
            <p className="brand-subtitle">Grades 3 to 10 Examination Portal</p>
          </div>
        </div>

        <div className="header-actions">
          {candidate && (
            <span className="brand-subtitle">
              Candidate: <strong>{candidate.name}</strong> (Grade {candidate.grade})
            </span>
          )}
          <button
            type="button"
            className="theme-btn"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          >
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
        </div>
      </div>
    </header>
  );
}
