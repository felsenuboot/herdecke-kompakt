import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { ShareButton } from './components/ShareButton';

export const metadata: Metadata = {
  title: 'Digital.Herdecke — Wetter, Verkehr, Ruhr-Pegel & Stadtrat',
  description:
    'Das Wichtigste aus Herdecke auf einen Blick: aktuelles Wetter und Unwetterwarnungen, nächste Abfahrten, Ruhr-Pegel, Müllabfuhr — plus Stichwort-Alarme für den Stadtrat.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <header className="site-header">
          <div className="container">
            <Link href="/" className="brand">
              Herdecke
            </Link>
            <nav>
              <Link href="/">Start</Link>
              <Link href="/abfahrten">Abfahrten</Link>
              <Link href="/muell">Müll</Link>
              <Link href="/schulen">Schulen</Link>
              <Link href="/sitzungen">Sitzungen</Link>
              <Link href="/datenschutz">Datenschutz</Link>
              <Link href="/impressum">Impressum</Link>
            </nav>
          </div>
        </header>
        <main className="container">{children}</main>
        <footer className="site-footer">
          <div className="container">
            <span>Ein unabhängiges Bürger-Projekt. Keine offizielle Seite der Stadt Herdecke.</span>
            <Link href="/datenschutz">Datenschutz</Link>
            <Link href="/impressum">Impressum</Link>
            <a href="https://github.com/felsenuboot/herdecke-kompakt" target="_blank" rel="noreferrer">
              GitHub
            </a>
            <ShareButton />
          </div>
        </footer>
      </body>
    </html>
  );
}
