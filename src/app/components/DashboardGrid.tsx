'use client';

import { useEffect, useState } from 'react';

export interface DashboardItem {
  id: string;
  node: React.ReactNode;
}

const STORAGE_KEY = 'dashboard-order';

/** Drag-and-drop reorderable dashboard grid; order persisted per browser. */
export function DashboardGrid({ items }: { items: DashboardItem[] }) {
  const defaultOrder = items.map((i) => i.id);
  const [order, setOrder] = useState<string[]>(defaultOrder);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  // Restore saved order, keeping it in sync with the current set of cards.
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

  function persist(next: string[]) {
    setOrder(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  function reorder(targetId: string) {
    if (!dragId || dragId === targetId) return;
    const next = [...order];
    next.splice(next.indexOf(dragId), 1);
    next.splice(next.indexOf(targetId), 0, dragId);
    persist(next);
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
        <span>↕ Kacheln per Ziehen anordnen</span>
        {customised && (
          <button type="button" className="linklike" onClick={reset}>
            Zurücksetzen
          </button>
        )}
      </div>
      <div className="overview">
        {ordered.map((id) => (
          <div
            key={id}
            className={`overview-item${dragId === id ? ' dragging' : ''}${
              overId === id && dragId !== id ? ' dragover' : ''
            }`}
            draggable
            onDragStart={() => setDragId(id)}
            onDragOver={(e) => {
              e.preventDefault();
              if (overId !== id) setOverId(id);
            }}
            onDragLeave={() => setOverId((o) => (o === id ? null : o))}
            onDrop={() => {
              reorder(id);
              setOverId(null);
            }}
            onDragEnd={() => {
              setDragId(null);
              setOverId(null);
            }}
          >
            {byId.get(id)}
          </div>
        ))}
      </div>
    </>
  );
}
