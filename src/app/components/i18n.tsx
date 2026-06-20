'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { translate, BCP47, LOCALES, LOCALE_NAMES, type Locale } from '@/lib/i18n';

const LocaleContext = createContext<Locale>('de');

export function I18nProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

/** Client-side translator + locale-aware Intl formatting helpers. */
export function useT() {
  const locale = useContext(LocaleContext);
  return { locale, bcp47: BCP47[locale], t: (s: string) => translate(locale, s) };
}

/**
 * Compact language switcher: a small globe + language code (DE/EN/UK) that opens
 * a menu with the full language names. Compact so the full navigation still fits
 * on one header row even for long languages.
 */
export function LocaleSwitcher() {
  const locale = useContext(LocaleContext);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  function change(l: Locale) {
    document.cookie = `locale=${l};path=/;max-age=31536000;samesite=lax`;
    location.reload();
  }

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        btnRef.current?.focus();
      }
    }
    function onPointer(e: PointerEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  return (
    <div className="locale-switch" ref={ref}>
      <button
        ref={btnRef}
        type="button"
        className="locale-switch__btn kern-btn kern-btn--tertiary"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Sprache · Language · Мова — ${LOCALE_NAMES[locale]}`}
        onClick={() => setOpen((o) => !o)}
      >
        <svg className="locale-switch__globe" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
          <circle cx="8" cy="8" r="6.4" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <path
            d="M1.6 8h12.8M8 1.6c2.2 2 2.2 10.8 0 12.8M8 1.6c-2.2 2-2.2 10.8 0 12.8M3 4.2c1.7 1 8.3 1 10 0M3 11.8c1.7-1 8.3-1 10 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>
        <span className="kern-label">{locale.toUpperCase()}</span>
        <span className="locale-switch__chev" aria-hidden="true" />
      </button>
      {open && (
        <ul className="locale-switch__menu" role="menu" aria-label="Sprache wählen · Choose language">
          {LOCALES.map((l) => (
            <li key={l} role="none">
              <button
                type="button"
                role="menuitemradio"
                aria-checked={l === locale}
                className="locale-switch__opt"
                onClick={() => change(l)}
              >
                {LOCALE_NAMES[l]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
