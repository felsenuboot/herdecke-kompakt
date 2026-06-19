'use client';

import { createContext, useContext } from 'react';
import { translate, BCP47, LOCALES, LOCALE_NAMES, type Locale } from '@/lib/i18n';
import { InputPrimitive } from './kern';

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
    <div className="locale-select">
      <InputPrimitive.Select
        id="locale-switcher"
        aria-label="Sprache / Language / Мова"
        value={locale}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => change(e.target.value as Locale)}
        options={LOCALES.map((l) => ({ value: l, label: LOCALE_NAMES[l] }))}
      />
    </div>
  );
}
