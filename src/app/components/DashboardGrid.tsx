'use client';

import { useEffect, useState } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type ScreenReaderInstructions,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useT } from './i18n';
import { Badge } from './kern';

export interface DashboardItem {
  id: string;
  node: React.ReactNode;
}

const STORAGE_KEY = 'dashboard-order';

function GripIcon() {
  return (
    <svg className="tile-grip__icon" width="10" height="16" viewBox="0 0 10 16" aria-hidden="true" focusable="false">
      <circle cx="2" cy="2" r="1.4" />
      <circle cx="8" cy="2" r="1.4" />
      <circle cx="2" cy="8" r="1.4" />
      <circle cx="8" cy="8" r="1.4" />
      <circle cx="2" cy="14" r="1.4" />
      <circle cx="8" cy="14" r="1.4" />
    </svg>
  );
}

/** One sortable tile: the card content plus a dedicated drag handle (the only
 *  drag activator, so links/buttons inside the card stay clickable). */
function SortableTile({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <li ref={setNodeRef} style={style} className={`overview-item${isDragging ? ' is-dragging' : ''}`}>
      {children}
      <button
        type="button"
        ref={setActivatorNodeRef}
        className="tile-grip"
        {...attributes}
        {...listeners}
        aria-label={label}
        aria-roledescription="verschiebbare Kachel"
      >
        <GripIcon />
      </button>
    </li>
  );
}

/**
 * Reorderable dashboard grid built on @dnd-kit: pointer, touch AND keyboard
 * dragging with screen-reader announcements; order persisted per browser.
 */
export function DashboardGrid({ items }: { items: DashboardItem[] }) {
  const { t } = useT();
  const defaultOrder = items.map((i) => i.id);
  const [order, setOrder] = useState<string[]>(defaultOrder);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

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

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setOrder((cur) => {
      const oldIndex = cur.indexOf(String(active.id));
      const newIndex = cur.indexOf(String(over.id));
      if (oldIndex === -1 || newIndex === -1) return cur;
      const next = arrayMove(cur, oldIndex, newIndex);
      save(next);
      return next;
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

  const announcements: Announcements = {
    onDragStart: () =>
      'Kachel aufgenommen. Mit den Pfeiltasten verschieben, mit Leertaste oder Enter ablegen, Escape zum Abbrechen.',
    onDragOver: ({ over }) =>
      over ? `An Position ${ordered.indexOf(String(over.id)) + 1} von ${ordered.length}.` : undefined,
    onDragEnd: ({ over }) =>
      over
        ? `Kachel an Position ${ordered.indexOf(String(over.id)) + 1} von ${ordered.length} abgelegt.`
        : 'Verschieben beendet.',
    onDragCancel: () => 'Verschieben abgebrochen. Die Reihenfolge bleibt unverändert.',
  };
  const screenReaderInstructions: ScreenReaderInstructions = {
    draggable:
      'Zum Anordnen: Mit der Leertaste oder Enter aufnehmen, mit den Pfeiltasten verschieben, erneut Leertaste oder Enter zum Ablegen, Escape zum Abbrechen.',
  };

  return (
    <>
      <div className="dashboard-head">
        <h2>{t('Überblick')}</h2>
        <span className="rule" />
        {customised && (
          <button type="button" className="linklike" onClick={reset}>
            {t('Zurücksetzen')}
          </button>
        )}
        <Badge variant="success" title={t('Live-Daten')} />
      </div>
      <p className="dashboard-hint">
        <GripIcon />
        {t('Kacheln lassen sich neu anordnen — am Griff ziehen oder mit der Tastatur (Leertaste, dann Pfeiltasten).')}
      </p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
        accessibility={{ announcements, screenReaderInstructions }}
      >
        <SortableContext items={ordered} strategy={rectSortingStrategy}>
          <ul className="overview">
            {ordered.map((id) => (
              <SortableTile key={id} id={id} label={t('Kachel verschieben')}>
                {byId.get(id)}
              </SortableTile>
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </>
  );
}
