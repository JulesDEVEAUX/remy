import Link from 'next/link';
import { Button, Icon, ListRow, Tag } from '@/components/ui';
import { getCurrentHousehold } from '@/lib/household';
import { toStockViewModel } from '@/lib/stock/mapping';
import { prisma } from '@/lib/prisma';

export default async function StockPage() {
  const household = await getCurrentHousehold();
  const stockEntries = await prisma.stock.findMany({
    where: { householdId: household.id },
    include: { ingredient: true },
    orderBy: { expiresAt: 'asc' },
  });

  const now = new Date();
  const items = stockEntries.map((entry) => toStockViewModel(entry, now));

  return (
    <main className="min-h-screen bg-cream p-6 pb-28">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-[30px] text-ink">Stock</h1>
        <Link href="/stock/nouveau">
          <Button icon={<Icon name="Plus" size={18} />}>Ajouter</Button>
        </Link>
      </header>

      {items.length === 0 ? (
        <p className="font-sans text-[15px] text-clay-700">
          Rien en stock pour l&apos;instant. Ajoute le premier produit.
        </p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {items.map((item) => (
            <ListRow
              key={item.id}
              href={`/stock/${item.id}`}
              icon={item.ingredientIcon}
              label={item.ingredientName}
              meta={item.quantityLabel}
              tag={<Tag tone={item.urgencyTone}>{item.expiryLabel}</Tag>}
            />
          ))}
        </div>
      )}
    </main>
  );
}
