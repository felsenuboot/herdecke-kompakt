'use client';

import { useEffect, useRef, useState } from 'react';
import { useT } from './i18n';

export interface DashboardItem {
  id: string;
  node: React.ReactNode;
}

const STORAGE_KEY = 'dashboard-order';

/**
 * Reorderable dashboard grid. Uses Pointer Events on a per-tile grip, so it
 * works with mouse, touch (iPad) and pen alike; order persisted per browser.
 */
export function DashboardGrid({ items }: { items: DashboardItem[] }) {
  const { t } = useT();
  const defaultOrder = items.map((i) => i.id);
  const [order, setOrder] = useState<string[]>(defaultOrder);
  const [dragId, setDragId] = useState<string | null>(null);
  const dragIdRef = useRef<string | null>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as string[] | null;
      if (Array.isArray(saved)) {
        const known = new Set(defaultOrder);
        const merged = saved.filter((id) => known.has(id));
        for (const id of defaultOrder) if (!merged.includes(id)) merged.push(id);
        setOrder(merged);
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  function save(next: string[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  function onPointerDown(e: React.PointerEvent, id: string) {
    e.preventDefault();
    dragIdRef.current = id;
    setDragId(id);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    const id = dragIdRef.current;
    if (!id) return;
    e.preventDefault();
    const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    const overId = (el?.closest('[data-tile-id]') as HTMLElement | null)?.dataset.tileId;
    if (!overId || overId === id) return;
    setOrder((cur) => {
      const from = cur.indexOf(id);
      const to = cur.indexOf(overId);
      if (from === -1 || to === -1) return cur;
      const next = [...cur];
      next.splice(from, 1);
      next.splice(to, 0, id);
      return next;
    });
  }

  function onPointerUp() {
    if (!dragIdRef.current) return;
    dragIdRef.current = null;
    setDragId(null);
    setOrder((cur) => {
      save(cur);
      return cur;
    });
  }

  function reset() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setOrder(defaultOrder);
  }

  const byId = new Map(items.map((i) => [i.id, i.node]));
  const ordered = order.filter((id) => byId.has(id));
  const customised = JSON.stringify(order) !== JSON.stringify(defaultOrder);

  return (
    <>
      <div className="dashboard-toolbar">
        <span>{t('⠿ Kacheln am Griff anordnen')}</span>
        {customised && (
          <button type="button" className="linklike" onClick={reset}>
            {t('Zurücksetzen')}
          </button>
        )}
      </div>
      <div className="overview">
        {ordered.map((id) => (
          <div key={id} data-tile-id={id} className={`overview-item${dragId === id ? ' dragging' : ''}`}>
            {byId.get(id)}
            <button
              type="button"
              className="tile-grip"
              aria-label={t('Kachel verschieben')}
              onPointerDown={(e) => onPointerDown(e, id)}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              ⠿
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
