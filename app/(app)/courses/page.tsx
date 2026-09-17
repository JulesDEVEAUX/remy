'use client';

import { useMemo, useState } from 'react';
import { Button, CheckRow, EmptyState, ICONS, PageHeader, RayonGroup } from '@/components/ui';

type DemoItem = {
  id: string;
  rayon: string;
  icon: keyof typeof ICONS;
  source: 'Carrefour' | 'Hors Carrefour';
  label: string;
  qty: string;
};

// Démo statique : la génération réelle (agrégation stock + recettes planifiées)
// n'est pas encore construite. Sert à caler le design de l'écran.
const DEMO_ITEMS: DemoItem[] = [
  { id: '1', rayon: 'Fruits et légumes', icon: 'legume', source: 'Carrefour', label: 'Oignons', qty: '1 kg' },
  { id: '2', rayon: 'Fruits et légumes', icon: 'legume', source: 'Carrefour', label: 'Tomates', qty: '500 g' },
  { id: '3', rayon: 'Crèmerie', icon: 'cremerie', source: 'Carrefour', label: 'Lait demi-écrémé', qty: '1 L' },
  { id: '4', rayon: 'Épicerie', icon: 'epicerie', source: 'Carrefour', label: 'Lentilles corail', qty: '500 g' },
  { id: '5', rayon: 'Hors Carrefour', icon: 'horsCarrefour', source: 'Hors Carrefour', label: 'Pain de campagne', qty: '1' },
];

export default function CoursesPage() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  function toggle(id: string) {
    setChecked((current) => ({ ...current, [id]: !current[id] }));
  }

  const groups = useMemo(() => {
    const map = new Map<string, DemoItem[]>();
    for (const item of DEMO_ITEMS) {
      const group = map.get(item.rayon) ?? [];
      group.push(item);
      map.set(item.rayon, group);
    }
    return [...map.entries()];
  }, []);

  const remaining = DEMO_ITEMS.filter((item) => !checked[item.id]).length;
  const carrefourCount = DEMO_ITEMS.filter((item) => item.source === 'Carrefour').length;
  const horsCarrefourCount = DEMO_ITEMS.length - carrefourCount;

  return (
    <main className="p-6 pb-32">
      <PageHeader title="Courses" />
      <p className="-mt-4 mb-6 font-mono text-[12px] text-clay-600">
        {remaining} article{remaining > 1 ? 's' : ''} restant{remaining > 1 ? 's' : ''}
      </p>

      {DEMO_ITEMS.length === 0 ? (
        <EmptyState
          icon={ICONS.courses}
          title="Rien à acheter pour l'instant."
          description="La liste se remplira une fois le planning et le stock branchés."
        />
      ) : (
        <>
          <div className="flex flex-col gap-6">
            {groups.map(([rayon, items]) => (
              <RayonGroup key={rayon} rayon={rayon} icon={ICONS[items[0].icon]} source={items[0].source}>
                {items.map((item) => (
                  <CheckRow
                    key={item.id}
                    label={item.label}
                    qty={item.qty}
                    checked={Boolean(checked[item.id])}
                    onToggle={() => toggle(item.id)}
                  />
                ))}
              </RayonGroup>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 rounded-lg bg-sand p-4 shadow-md">
            <div className="flex justify-between font-sans text-[13px] font-medium text-clay-700">
              <span>Carrefour</span>
              <span className="font-mono">{carrefourCount}</span>
            </div>
            <div className="flex justify-between font-sans text-[13px] font-medium text-clay-700">
              <span>Hors Carrefour</span>
              <span className="font-mono">{horsCarrefourCount}</span>
            </div>
            <Button block disabled title="Bientôt disponible">
              Copier pour Carrefour
            </Button>
          </div>
        </>
      )}
    </main>
  );
}
