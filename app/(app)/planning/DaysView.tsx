'use client';

import { useRef, useState } from 'react';
import clsx from 'clsx';
import { EmptyState, ICONS, ListRow, Tag } from '@/components/ui';
import type { DayViewModel } from '@/lib/planning/mapping';

/** Vue swipeable par jour : scroll-snap CSS, pas de logique de geste JS (cf. doctrine no drag-and-drop). */
export function DaysView({ days, weekStartParam }: { days: DayViewModel[]; weekStartParam: string }) {
  const [selected, setSelected] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);

  function goToDay(index: number) {
    setSelected(index);
    const panel = scrollerRef.current?.children[index] as HTMLElement | undefined;
    panel?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }

  return (
    <>
      <div className="mb-6 flex gap-2 overflow-x-auto">
        {days.map((day, index) => (
          <button
            key={day.dateKey}
            type="button"
            onClick={() => goToDay(index)}
            className={clsx(
              'flex h-11 flex-none items-center justify-center rounded-full px-4 font-sans text-[13px] font-bold transition-colors',
              index === selected ? 'bg-terracotta text-terracotta-100' : 'bg-sand text-clay-700',
            )}
          >
            {day.dayLabel.slice(0, 3)}
          </button>
        ))}
      </div>

      <div ref={scrollerRef} className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
        {days.map((day) => (
          <section key={day.dateKey} className="w-full flex-none snap-center">
            <h2 className="mb-3 flex items-baseline gap-2 font-display text-[20px] text-ink">
              {day.dayLabel}
              <span className="font-mono text-[12px] font-normal text-clay-600">{day.dateLabel}</span>
            </h2>
            {day.slots.length === 0 ? (
              <EmptyState icon={ICONS.semaine} title="Aucun créneau configuré ce jour." />
            ) : (
              <div className="flex flex-col gap-1.5">
                {day.slots.map((slot) => (
                  <ListRow
                    key={slot.id}
                    href={`/planning/${slot.id}?start=${weekStartParam}`}
                    icon={ICONS.cuisine}
                    label={slot.recipeName ?? 'Aucune recette'}
                    meta={slot.mealTypeLabel}
                    tag={
                      <>
                        {slot.isBatch && <Tag tone="stock">Batch</Tag>}
                        {slot.isEmpty && <Tag tone="alerte">À assigner</Tag>}
                      </>
                    }
                  />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </>
  );
}
