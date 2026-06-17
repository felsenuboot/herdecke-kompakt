'use client';

import { createContext, useContext } from 'react';
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

export function LocaleSwitcher() {
  const locale = useContext(LocaleContext);
  function change(l: Locale) {
    document.cookie = `locale=${l};path=/;max-age=31536000;samesite=lax`;
    location.reload();
  }
  return (
    <select
      className="locale-switcher"
      aria-label="Sprache / Language / Мова"
      value={locale}
      onChange={(e) => change(e.target.value as Locale)}
    >
      {LOCALES.map((l) => (
        <option key={l} value={l}>
          {LOCALE_NAMES[l]}
        </option>
      ))}
    </select>
  );
}
