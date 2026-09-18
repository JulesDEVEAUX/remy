import { notFound } from 'next/navigation';
import { Button, PageHeader } from '@/components/ui';
import { getCurrentHousehold } from '@/lib/household';
import { prisma } from '@/lib/prisma';
import { deleteIngredientAction, updateIngredientAction } from '../actions';
import { IngredientForm } from '../IngredientForm';

export default async function EditIngredientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const household = await getCurrentHousehold();
  const ingredient = await prisma.ingredient.findFirst({
    where: { id, householdId: household.id },
  });

  if (!ingredient) {
    notFound();
  }

  return (
    <main className="p-6 pb-32">
      <PageHeader title={ingredient.name} backHref="/ingredients" />
      <IngredientForm
        action={updateIngredientAction.bind(null, id)}
        defaultValues={{
          name: ingredient.name,
          category: ingredient.category,
          defaultUnit: ingredient.defaultUnit,
          conservation: ingredient.conservation,
          defaultSource: ingredient.defaultSource,
          isPrivate: ingredient.isPrivate,
        }}
        submitLabel="Enregistrer"
      />
      <form action={deleteIngredientAction.bind(null, id)} className="mt-6">
        <Button type="submit" variant="secondary" block>
          Supprimer
        </Button>
      </form>
    </main>
  );
}
