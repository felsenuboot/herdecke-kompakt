'use client';

import { useEffect, useState } from 'react';
import { useT } from './i18n';

type Theme = 'light' | 'dark';

export function ThemeToggle() {
  const { t } = useT();
  // Render a stable, deterministic initial markup on the server and the first
  // client paint to avoid a hydration mismatch; the real theme is read in the
  // effect below (the inline head script has already set dataset.theme).
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const resolved: Theme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
    setTheme(resolved);
    setMounted(true);

    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => {
      // Follow the OS only while the user has made no explicit choice.
      let stored: string | null = null;
      try {
        stored = localStorage.getItem('theme');
      } catch {
        stored = null;
      }
      if (stored === 'dark' || stored === 'light') return;
      const next: Theme = e.matches ? 'dark' : 'light';
      document.documentElement.dataset.theme = next;
      setTheme(next);
    };
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('theme', next);
    } catch {
      /* ignore storage failures (e.g. private mode) */
    }
    setTheme(next);
  }

  const isDark = theme === 'dark';
  const label = isDark ? t('Helles Design einschalten') : t('Dunkles Design einschalten');

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={label}
      aria-pressed={mounted ? isDark : undefined}
      title={label}
    >
      <span aria-hidden="true">{mounted ? (isDark ? '☀' : '☾') : '◐'}</span>
    </button>
  );
}
