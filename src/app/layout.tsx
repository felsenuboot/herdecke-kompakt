import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { ShareButton } from './components/ShareButton';
import { I18nProvider, LocaleSwitcher } from './components/i18n';
import { getT } from '@/lib/i18n-server';

export const metadata: Metadata = {
  title: 'Digital.Herdecke — Wetter, Verkehr, Ruhr-Pegel & Stadtrat',
  description:
    'Das Wichtigste aus Herdecke auf einen Blick: aktuelles Wetter und Unwetterwarnungen, nächste Abfahrten, Ruhr-Pegel, Müllabfuhr — plus Stichwort-Alarme für den Stadtrat.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale, t } = await getT();
  return (
    <html lang={locale}>
      <body>
        <I18nProvider locale={locale}>
          <header className="site-header">
            <div className="container">
              <Link href="/" className="brand">
                Herdecke
              </Link>
              <nav>
                <Link href="/">{t('Start')}</Link>
                <Link href="/abfahrten">{t('Abfahrten')}</Link>
                <Link href="/muell">{t('Müll')}</Link>
                <Link href="/schulen">{t('Schulen')}</Link>
                <Link href="/sitzungen">{t('Sitzungen')}</Link>
                <Link href="/datenschutz">{t('Datenschutz')}</Link>
                <Link href="/impressum">{t('Impressum')}</Link>
                <LocaleSwitcher />
              </nav>
            </div>
          </header>
          <main className="container">{children}</main>
          <footer className="site-footer">
            <div className="container">
              <span>{t('Ein unabhängiges Bürger-Projekt. Keine offizielle Seite der Stadt Herdecke.')}</span>
              <Link href="/datenschutz">{t('Datenschutz')}</Link>
              <Link href="/impressum">{t('Impressum')}</Link>
              <a href="https://github.com/felsenuboot/herdecke-kompakt" target="_blank" rel="noreferrer">
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
