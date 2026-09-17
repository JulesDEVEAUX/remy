import Link from 'next/link';
import { Button } from '@/components/ui';
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
    <main className="min-h-screen bg-cream p-6 pb-28">
      <h1 className="mb-6 font-display text-[30px] text-ink">Ajouter au stock</h1>
      {ingredients.length === 0 ? (
        <div className="flex flex-col gap-4">
          <p className="font-sans text-[15px] text-clay-700">
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
