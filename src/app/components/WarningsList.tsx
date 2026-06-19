'use client';

import { useEffect, useRef, useState } from 'react';
import { useT } from './i18n';
import { Icon, Badge, Button } from './kern';

export interface WarningView {
  event: string;
  severity: string; // minor | moderate | severe | extreme
  headline: string;
  instruction?: string;
  start?: string;
  end?: string;
}

const WARN_LEVEL: Record<string, string> = {
  minor: 'Wetterhinweis',
  moderate: 'Markant',
  severe: 'Unwetter',
  extreme: 'Extremes Unwetter',
};

const STORAGE_KEY = 'dismissed-warnings';
// Identity for "this exact warning" — re-issued warnings (new expiry) reappear.
const keyOf = (w: WarningView) => `${w.event}|${w.headline}|${w.end ?? ''}`;

/**
 * Renders the active weather warnings and lets the user dismiss each once read.
 * Dismissals persist (localStorage), keyed by the warning's identity, and are
 * pruned to the currently-active set so the store can't grow unbounded — a new
 * or re-issued warning still shows.
 */
export function WarningsList({ warnings }: { warnings: WarningView[] }) {
  const { t } = useT();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);
  const regionRef = useRef<HTMLDivElement>(null);
  const pendingFocus = useRef(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
      if (Array.isArray(saved)) setDismissed(new Set(saved as string[]));
    } catch {
      /* ignore */
    }
    setMounted(true);
  }, []);

  // After a dismissal, keep keyboard focus somewhere sensible instead of letting
  // it fall back to <body> when the focused close button unmounts.
  useEffect(() => {
    if (!pendingFocus.current) return;
    pendingFocus.current = false;
    if (regionRef.current) {
      regionRef.current.focus();
    } else {
      const main = document.querySelector('main');
      if (main instanceof HTMLElement) {
        main.setAttribute('tabindex', '-1');
        main.focus();
      }
    }
  }, [dismissed]);

  function dismiss(w: WarningView) {
    pendingFocus.current = true;
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(keyOf(w));
      try {
        const live = new Set(warnings.map(keyOf));
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next].filter((k) => live.has(k))));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  // Before mount we can't know what was dismissed; render all (matching the
  // server HTML) to avoid a hydration mismatch, then filter once mounted.
  const visible = mounted ? warnings.filter((w) => !dismissed.has(keyOf(w))) : warnings;
  if (visible.length === 0) return null;

  return (
    <div
      ref={regionRef}
      tabIndex={-1}
      role="region"
      aria-label={t('Wetterwarnungen')}
      className="warn-banner"
    >
      {visible.map((w, i) => {
        const danger = w.severity === 'severe' || w.severity === 'extreme';
        return (
          <div key={keyOf(w) || i} role={danger ? 'alert' : undefined} className={`warn warn-${w.severity}`}>
            <Icon name="warning" size="large" className="warn-icon" aria-hidden={true} />
            <div className="warn-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                <strong className="warn-title">{w.event}</strong>
                <Badge variant={danger ? 'danger' : 'warning'} title={t(WARN_LEVEL[w.severity] ?? 'Warnung')} />
              </div>
              {w.headline && <p style={{ margin: 0 }}>{w.headline}</p>}
              {w.instruction && <p className="warn-instruction">{w.instruction}</p>}
            </div>
            <Button
              variant="tertiary"
              iconOnly={true}
              icon={{ name: 'close' }}
              className="warn-dismiss"
              onClick={() => dismiss(w)}
              aria-label={t('Warnung ausblenden')}
            />
          </div>
        );
      })}
    </div>
  );
}
