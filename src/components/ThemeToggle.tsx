// src/components/ThemeToggle.tsx

export default function ThemeToggle({ theme, setTheme }: { theme: 'dark' | 'light', setTheme: (t: 'dark'|'light') => void }) {
  const toggle = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <button
      onClick={toggle}
      aria-pressed={theme === 'light'}
      aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
      title={theme === 'light' ? 'Light theme' : 'Dark theme'}
      className="theme-toggle"
    >
      {theme === 'light' ? (
        // Sun icon
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 4V2M12 22v-2M4.22 4.22 2.81 2.81M21.19 21.19l-1.41-1.41M4 12H2M22 12h-2M4.22 19.78 2.81 21.19M21.19 2.81 19.78 4.22" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6"/>
        </svg>
      ) : (
        // Moon icon
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </button>
  );
}
