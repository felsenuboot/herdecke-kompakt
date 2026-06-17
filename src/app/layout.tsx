import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { ShareButton } from './components/ShareButton';
import { I18nProvider } from './components/i18n';
import { SiteNav } from './components/SiteNav';
import { getT } from '@/lib/i18n-server';

const THEME_SCRIPT = `(function () {
  try {
    var stored = null;
    try { stored = localStorage.getItem('theme'); } catch (e) {}
    var theme;
    if (stored === 'dark' || stored === 'light') {
      theme = stored;
    } else {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.dataset.theme = theme;
  } catch (e) {
    document.documentElement.dataset.theme = 'light';
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
    <html lang={locale} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <I18nProvider locale={locale}>
          <header className="site-header">
            <div className="container">
              <Link href="/" className="brand" aria-label={t('Herdecke — Startseite')}>
                <span className="brand-mark" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <span>
                  Herdecke<span className="brand-dot">.Digital</span>
                </span>
              </Link>
              <SiteNav />
            </div>
          </header>
          <main className="container">{children}</main>
          <footer className="site-footer">
            <div className="container">
              <span>{t('Ein unabhängiges Bürger-Projekt. Keine offizielle Seite der Stadt Herdecke.')}</span>
              <Link href="/datenschutz">{t('Datenschutz')}</Link>
              <Link href="/impressum">{t('Impressum')}</Link>
              <a href="https://github.com/felsenuboot/herdecke-digital" target="_blank" rel="noreferrer">
                GitHub
              </a>
              <ShareButton />
            </div>
          </footer>
        </I18nProvider>
      </body>
    </html>
  );
}
