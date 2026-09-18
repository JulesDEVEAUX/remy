import { notFound } from 'next/navigation';
import { Button, PageHeader } from '@/components/ui';
import { getCurrentHousehold } from '@/lib/household';
import { toDateInputValue } from '@/lib/stock/mapping';
import { prisma } from '@/lib/prisma';
import { deleteStockAction, updateStockAction } from '../actions';
import { StockForm } from '../StockForm';

export default async function AdjustStockPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const household = await getCurrentHousehold();
  const stock = await prisma.stock.findFirst({
    where: { id, householdId: household.id },
    include: { ingredient: true },
  });

  if (!stock) {
    notFound();
  }

  return (
    <main className="p-6 pb-32">
      <PageHeader title={stock.ingredient.name} backHref="/stock" />
      <StockForm
        action={updateStockAction.bind(null, id)}
        submitLabel="Enregistrer"
        ingredientOptions={[]}
        fixedIngredientName={stock.ingredient.name}
        defaultValues={{
          ingredientId: stock.ingredientId,
          quantity: String(stock.quantity),
          unit: stock.unit,
          location: stock.location,
          expiresAt: stock.expiresAt ? toDateInputValue(stock.expiresAt) : '',
        }}
      />
      <form action={deleteStockAction.bind(null, id)} className="mt-6">
        <Button type="submit" variant="secondary" block>
          Retirer
        </Button>
      </form>
    </main>
  );
}
