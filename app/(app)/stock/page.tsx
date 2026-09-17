import Link from 'next/link';
import { Button, EmptyState, ICONS, Icon, ListRow, PageHeader, Tag } from '@/components/ui';
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
    <main className="p-6 pb-32">
      <PageHeader
        title="Stock"
        action={
          <Link href="/stock/nouveau">
            <Button icon={<Icon name="Plus" size={18} />}>Ajouter</Button>
          </Link>
        }
      />
      <Link
        href="/ingredients"
        className="mb-6 inline-flex items-center gap-1 font-sans text-[13px] font-semibold text-terracotta-700"
      >
        Voir le catalogue d&apos;ingrédients
        <Icon name="ChevronRight" size={14} />
      </Link>

      {items.length === 0 ? (
        <EmptyState
          icon={ICONS.stock}
          title="Rien en stock pour l'instant."
          description="Ajoute un produit pour suivre sa péremption."
          action={
            <Link href="/stock/nouveau">
              <Button variant="secondary">Ajouter le premier</Button>
            </Link>
          }
        />
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
