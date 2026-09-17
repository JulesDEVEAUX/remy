import { notFound } from 'next/navigation';
import { Button } from '@/components/ui';
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
    <main className="min-h-screen bg-cream p-6 pb-28">
      <h1 className="mb-6 font-display text-[30px] text-ink">{recipe.name}</h1>
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
