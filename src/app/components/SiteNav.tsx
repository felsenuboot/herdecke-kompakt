'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useT, LocaleSwitcher } from './i18n';
import { ThemeToggle } from './ThemeToggle';

const ITEMS = [
  { href: '/', label: 'Start' },
  { href: '/abfahrten', label: 'Abfahrten' },
  { href: '/muell', label: 'Müll' },
  { href: '/schulen', label: 'Schulen' },
  { href: '/sitzungen', label: 'Sitzungen' },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  if (pathname === href || pathname.startsWith(`${href}/`)) return true;
  // Council-session detail pages live under /meetings/* but belong to "Sitzungen".
  if (href === '/sitzungen' && pathname.startsWith('/meetings')) return true;
  return false;
}

export function SiteNav() {
  const pathname = usePathname();
  const { t } = useT();

  return (
    <>
      {/* Real <a> links (Next.js Link) styled with KERN's button classes — nav
          must be anchors (a11y, open-in-new, prefetch), not <button>s. */}
      <nav className="site-nav" aria-label={t('Hauptnavigation')}>
        {ITEMS.map(({ href, label }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`kern-btn kern-btn--${active ? 'secondary' : 'tertiary'}`}
            >
              <span className="kern-label">{t(label)}</span>
            </Link>
          );
        })}
      </nav>

      <div className="nav-utils">
        <LocaleSwitcher />
        <ThemeToggle />
      </div>
    </>
  );
}
