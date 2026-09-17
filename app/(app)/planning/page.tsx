'use client';

import { useRef, useState } from 'react';
import clsx from 'clsx';
import { EmptyState, ICONS, Icon, PageHeader, Tag } from '@/components/ui';

type DemoMeal = { type: string; recipeName: string };
type DemoDay = { label: string; meals: DemoMeal[] };

// Démo statique : le planning réel (génération + persistance MealPlan) n'est
// pas encore construit. Sert à caler le design de la vue swipeable par jour.
const DEMO_DAYS: DemoDay[] = [
  { label: 'Lundi', meals: [{ type: 'Déjeuner', recipeName: 'Curry de lentilles' }] },
  { label: 'Mardi', meals: [] },
  { label: 'Mercredi', meals: [{ type: 'Dîner', recipeName: 'Soupe de légumes' }] },
  { label: 'Jeudi', meals: [] },
  { label: 'Vendredi', meals: [] },
  {
    label: 'Samedi',
    meals: [
      { type: 'Déjeuner', recipeName: 'Poulet rôti' },
      { type: 'Dîner', recipeName: 'Salade composée' },
    ],
  },
  { label: 'Dimanche', meals: [] },
];

export default function PlanningPage() {
  const [selected, setSelected] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);

  function goToDay(index: number) {
    setSelected(index);
    const panel = scrollerRef.current?.children[index] as HTMLElement | undefined;
    panel?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }

  return (
    <main className="p-6 pb-32">
      <PageHeader title="Planning" />

      <div className="mb-6 flex gap-2 overflow-x-auto">
        {DEMO_DAYS.map((day, index) => (
          <button
            key={day.label}
            type="button"
            onClick={() => goToDay(index)}
            className={clsx(
              'flex h-11 flex-none items-center justify-center rounded-full px-4 font-sans text-[13px] font-bold transition-colors',
              index === selected ? 'bg-terracotta text-terracotta-100' : 'bg-sand text-clay-700',
            )}
          >
            {day.label.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* Défilement horizontal avec scroll-snap CSS : effet « swipe » sans logique de geste JS. */}
      <div ref={scrollerRef} className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
        {DEMO_DAYS.map((day) => (
          <section key={day.label} className="w-full flex-none snap-center">
            <h2 className="mb-3 font-display text-[20px] text-ink">{day.label}</h2>
            {day.meals.length === 0 ? (
              <EmptyState icon={ICONS.semaine} title="Rien de planifié." />
            ) : (
              <div className="flex flex-col gap-1.5">
                {day.meals.map((meal) => (
                  <div
                    key={meal.type}
                    className="flex min-h-[46px] items-center gap-3 rounded-md bg-sand px-4"
                  >
                    <Icon name={ICONS.cuisine} size={18} className="text-terracotta-700" />
                    <span className="font-sans text-[15px] font-semibold text-ink">{meal.recipeName}</span>
                    <Tag tone="neutre" className="ml-auto">
                      {meal.type}
                    </Tag>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
