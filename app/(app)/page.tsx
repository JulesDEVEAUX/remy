import Link from 'next/link';
import { Button, EmptyState, ICONS, ListRow, Tag, Wordmark } from '@/components/ui';
import { getCurrentHousehold } from '@/lib/household';
import { toStockViewModel } from '@/lib/stock/mapping';
import { prisma } from '@/lib/prisma';

const SOON_EXPIRING_COUNT = 3;

function capitalize(label: string) {
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export default async function HomePage() {
  const household = await getCurrentHousehold();
  const now = new Date();
  const stockEntries = await prisma.stock.findMany({
    where: { householdId: household.id },
    include: { ingredient: true },
    orderBy: { expiresAt: 'asc' },
    take: SOON_EXPIRING_COUNT,
  });
  const soonExpiring = stockEntries.map((entry) => toStockViewModel(entry, now));

  const dateLabel = capitalize(
    now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }),
  );

  return (
    <main className="p-6 pb-32">
      <header className="mb-6 flex items-center justify-between">
        <Wordmark size={28} />
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-clay-600">
          {dateLabel}
        </span>
      </header>

      <h1 className="mb-8 font-display text-[30px] leading-[1.1] text-ink">Voici où tu en es.</h1>

      <section className="mb-6">
        <h2 className="mb-2 font-sans text-[13px] font-bold uppercase tracking-[0.04em] text-clay-800">
          Ça périme bientôt
        </h2>
        {soonExpiring.length === 0 ? (
          <EmptyState
            icon={ICONS.peremption}
            title="Rien à surveiller pour l'instant."
            description="Ton stock est vide ou sans date de péremption proche."
            action={
              <Link href="/stock">
                <Button variant="secondary">Voir le stock</Button>
              </Link>
            }
          />
        ) : (
          <div className="flex flex-col gap-1.5">
            {soonExpiring.map((item) => (
              <ListRow
                key={item.id}
                href={`/stock/${item.id}`}
                icon={item.ingredientIcon}
                label={item.ingredientName}
                tag={<Tag tone={item.urgencyTone}>{item.expiryLabel}</Tag>}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mb-8">
        <h2 className="mb-2 font-sans text-[13px] font-bold uppercase tracking-[0.04em] text-clay-800">
          Repas du jour
        </h2>
        <EmptyState
          icon={ICONS.semaine}
          title="Rien de planifié aujourd'hui."
          description="Le planning n'est pas encore construit."
          action={
            <Link href="/planning">
              <Button variant="secondary">Voir le planning</Button>
            </Link>
          }
        />
      </section>

      <section>
        <h2 className="mb-2 font-sans text-[13px] font-bold uppercase tracking-[0.04em] text-clay-800">
          Accès rapides
        </h2>
        <div className="flex flex-col gap-1.5">
          <ListRow href="/ingredients/nouveau" icon={ICONS.epicerie} label="Ajouter un ingrédient" />
          <ListRow href="/recettes/nouveau" icon={ICONS.cuisine} label="Ajouter une recette" />
          <ListRow href="/courses" icon={ICONS.courses} label="Liste de courses" />
        </div>
      </section>
    </main>
  );
}
