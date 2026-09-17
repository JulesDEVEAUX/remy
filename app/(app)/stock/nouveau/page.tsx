import Link from 'next/link';
import { Button, PageHeader } from '@/components/ui';
import { getCurrentHousehold } from '@/lib/household';
import { prisma } from '@/lib/prisma';
import { createStockAction } from '../actions';
import { StockForm } from '../StockForm';

export default async function NewStockPage() {
  const household = await getCurrentHousehold();
  const ingredients = await prisma.ingredient.findMany({
    where: { householdId: household.id },
    orderBy: { name: 'asc' },
  });

  return (
    <main className="p-6 pb-32">
      <PageHeader title="Ajouter au stock" backHref="/stock" />
      {ingredients.length === 0 ? (
        <div className="flex flex-col gap-4">
          <p className="font-sans text-[15px] text-clay-700 dark:text-clay-400">
            Aucun ingrédient au catalogue. Ajoute-en un d&apos;abord.
          </p>
          <Link href="/ingredients/nouveau">
            <Button block>Ajouter un ingrédient</Button>
          </Link>
        </div>
      ) : (
        <StockForm
          action={createStockAction}
          submitLabel="Ajouter"
          ingredientOptions={ingredients.map((ingredient) => ({ id: ingredient.id, name: ingredient.name }))}
        />
      )}
    </main>
  );
}
