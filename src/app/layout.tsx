import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import '@publicplan/kern-react-kit/index.css';
import './globals.css';
import { ShareButton } from './components/ShareButton';
import { I18nProvider } from './components/i18n';
import { SiteNav } from './components/SiteNav';
import { StripeFlag } from './components/FlagStack';
import { getT } from '@/lib/i18n-server';
import { city, wordmarkText, metaTitleSuffix, metaDescription } from '@/config/city';

const THEME_SCRIPT = `(function () {
  function set(t) {
    var el = document.documentElement;
    el.dataset.theme = t;
    el.dataset.kernTheme = t; // drives the KERN --kern-color-* tokens
  }
  try {
    var stored = null;
    try { stored = localStorage.getItem('theme'); } catch (e) {}
    var theme;
    if (stored === 'dark' || stored === 'light') {
      theme = stored;
    } else {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    set(theme);
  } catch (e) {
    set('light');
  }
})();`;

export const metadata: Metadata = {
  title: `${wordmarkText} — ${metaTitleSuffix}`,
  description: metaDescription,
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale, t } = await getT();
  return (
    <html lang={locale} data-kern-theme="light" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <I18nProvider locale={locale}>
          <header className="site-header">
            <div className="container">
              <Link href="/" className="brand" aria-label={t('Herdecke — Startseite')}>
                <StripeFlag className="brand-flag" stripes={city.flag.stripes} />
                <span>
                  {city.wordmark.prefix}
                  <span className="brand-dot">.</span>
                  {city.wordmark.suffix}
                </span>
              </Link>
              <SiteNav />
            </div>
          </header>
          <main className="container">{children}</main>
          <footer className="site-footer">
            <div className="container">
              <span className="footer-brand">{wordmarkText}</span>
              <span>{t('Ein unabhängiges Bürger-Projekt. Keine offizielle Seite der Stadt Herdecke.')}</span>
              <Link href="/datenschutz">{t('Datenschutz')}</Link>
              <Link href="/impressum">{t('Impressum')}</Link>
              <a href={city.repoUrl} target="_blank" rel="noreferrer">
                GitHub
              </a>
              <a
                className="footer-spacer"
                href="https://gitlab.opencode.de/kern-ux/pattern-library"
                target="_blank"
                rel="noreferrer"
                title={t('Gestaltet mit dem KERN Design-System')}
              >
                {t('Design')}: KERN ↗
              </a>
              <ShareButton />
            </div>
          </footer>
        </I18nProvider>
      </body>
    </html>
  );
}
