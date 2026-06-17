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

export function SiteNav() {
  const pathname = usePathname();
  const { t } = useT();

  return (
    <>
      <nav className="site-nav" aria-label={t('Hauptnavigation')}>
        {ITEMS.map(({ href, label }) => {
          const active = href === '/' ? pathname === '/' : pathname === href;
          return (
            <Link key={href} href={href} aria-current={active ? 'page' : undefined}>
              {t(label)}
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
