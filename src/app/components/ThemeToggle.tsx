'use client';

import { useEffect, useState } from 'react';
import { useT } from './i18n';
import { Icon } from './kern';

type Theme = 'light' | 'dark';

/** Keep the app's own attribute and KERN's token attribute in lock-step. */
function applyTheme(next: Theme) {
  const el = document.documentElement;
  el.dataset.theme = next;
  el.dataset.kernTheme = next; // drives the --kern-color-* tokens
}

export function ThemeToggle() {
  const { t } = useT();
  // Render a stable, deterministic initial markup on the server and the first
  // client paint to avoid a hydration mismatch; the real theme is read in the
  // effect below (the inline head script has already set the attributes).
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
      applyTheme(next);
      setTheme(next);
    };
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try {
      localStorage.setItem('theme', next);
    } catch {
      /* ignore storage failures (e.g. private mode) */
    }
    setTheme(next);
  }

  const isDark = mounted && theme === 'dark';
  const label = isDark ? t('Helles Design einschalten') : t('Dunkles Design einschalten');
  const accent = 'var(--kern-color-action-default)';
  const muted = 'var(--kern-color-layout-text-muted)';

  return (
    <button
      type="button"
      className="theme-switch"
      onClick={toggle}
      role="switch"
      aria-checked={isDark}
      aria-label={label}
      title={label}
    >
      <Icon name="light-mode" size="small" aria-hidden={true} style={{ backgroundColor: isDark ? muted : accent }} />
      <span className="theme-switch__track" aria-hidden="true">
        <span className="theme-switch__knob" />
      </span>
      <Icon name="dark-mode" size="small" aria-hidden={true} style={{ backgroundColor: isDark ? accent : muted }} />
    </button>
  );
}
