import type { Metadata } from 'next';
import Link from 'next/link';
import '@publicplan/kern-react-kit/index.css';
import './globals.css';
import { ShareButton } from './components/ShareButton';
import { I18nProvider } from './components/i18n';
import { SiteNav } from './components/SiteNav';
import { getT } from '@/lib/i18n-server';

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
  title: 'Digital.Herdecke — Wetter, Verkehr, Ruhr-Pegel & Stadtrat',
  description:
    'Das Wichtigste aus Herdecke auf einen Blick: aktuelles Wetter und Unwetterwarnungen, nächste Abfahrten, Ruhr-Pegel, Müllabfuhr — plus Stichwort-Alarme für den Stadtrat.',
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
                <svg className="brand-flag" viewBox="0 0 36 24" role="img" aria-hidden="true">
                  <rect width="36" height="12" fill="#DA121A" />
                  <rect width="36" height="12" y="12" fill="#FFFFFF" />
                </svg>
                <span>
                  Digital<span className="brand-dot">.</span>Herdecke
                </span>
              </Link>
              <SiteNav />
            </div>
          </header>
          <main className="container">{children}</main>
          <footer className="site-footer">
            <div className="container">
              <span className="footer-brand">Digital.Herdecke</span>
              <span>{t('Ein unabhängiges Bürger-Projekt. Keine offizielle Seite der Stadt Herdecke.')}</span>
              <Link href="/datenschutz">{t('Datenschutz')}</Link>
              <Link href="/impressum">{t('Impressum')}</Link>
              <a href="https://github.com/felsenuboot/herdecke-digital" target="_blank" rel="noreferrer">
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
