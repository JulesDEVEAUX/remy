import { PageHeader } from '@/components/ui';
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
    <main className="p-6 pb-32">
      <PageHeader title="Nouvelle recette" backHref="/recettes" />
      <RecipeForm
        action={createRecipeAction}
        submitLabel="Ajouter"
        ingredientOptions={ingredients.map((ingredient) => ({ id: ingredient.id, name: ingredient.name }))}
      />
    </main>
  );
}
