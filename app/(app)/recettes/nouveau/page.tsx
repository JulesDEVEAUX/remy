import { getCurrentHousehold } from '@/lib/household';
import { prisma } from '@/lib/prisma';
import { createRecipeAction } from '../actions';
import { RecipeForm } from '../RecipeForm';

export default async function NewRecipePage() {
  const household = await getCurrentHousehold();
  const ingredients = await prisma.ingredient.findMany({
    where: { householdId: household.id },
    orderBy: { name: 'asc' },
  });

  return (
    <main className="min-h-screen bg-cream p-6 pb-28">
      <h1 className="mb-6 font-display text-[30px] text-ink">Nouvelle recette</h1>
      <RecipeForm
        action={createRecipeAction}
        submitLabel="Ajouter"
        ingredientOptions={ingredients.map((ingredient) => ({ id: ingredient.id, name: ingredient.name }))}
      />
    </main>
  );
}
