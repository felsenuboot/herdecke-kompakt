import { cookies } from 'next/headers';
import { translate, DEFAULT_LOCALE, LOCALES, BCP47, type Locale } from './i18n';

/** Read the locale from the `locale` cookie (server components / route handlers). */
export async function getLocale(): Promise<Locale> {
  const v = (await cookies()).get('locale')?.value;
  return v && (LOCALES as readonly string[]).includes(v) ? (v as Locale) : DEFAULT_LOCALE;
}

export async function getT(): Promise<{ locale: Locale; bcp47: string; t: (s: string) => string }> {
  const locale = await getLocale();
  return { locale, bcp47: BCP47[locale], t: (s: string) => translate(locale, s) };
}
