import { notFound } from 'next/navigation';
import { Button, PageHeader } from '@/components/ui';
import { getCurrentHousehold } from '@/lib/household';
import { toRecipeFormValues } from '@/lib/recipes/mapping';
import { prisma } from '@/lib/prisma';
import { deleteRecipeAction, updateRecipeAction } from '../actions';
import { RecipeForm } from '../RecipeForm';

export default async function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const household = await getCurrentHousehold();
  const [recipe, ingredients] = await Promise.all([
    prisma.recipe.findFirst({
      where: { id, householdId: household.id },
      include: { ingredients: true },
    }),
    prisma.ingredient.findMany({ where: { householdId: household.id }, orderBy: { name: 'asc' } }),
  ]);

  if (!recipe) {
    notFound();
  }

  return (
    <main className="p-6 pb-32">
      <PageHeader title={recipe.name} backHref="/recettes" />
      <RecipeForm
        action={updateRecipeAction.bind(null, id)}
        defaultValues={toRecipeFormValues(recipe)}
        submitLabel="Enregistrer"
        ingredientOptions={ingredients.map((ingredient) => ({ id: ingredient.id, name: ingredient.name }))}
      />
      <form action={deleteRecipeAction.bind(null, id)} className="mt-6">
        <Button type="submit" variant="secondary" block>
          Supprimer
        </Button>
      </form>
    </main>
  );
}
