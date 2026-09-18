import { PageHeader } from '@/components/ui';
import { pickRandomEmoji } from '@/lib/emoji';
import { getCurrentHousehold } from '@/lib/household';
import { ingredientCatalogWhere } from '@/lib/ingredients/catalog';
import { safeRedirectTarget } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import { createRecipeAction } from '../actions';
import { RecipeForm } from '../RecipeForm';

export default async function NewRecipePage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const [household, { redirectTo }] = await Promise.all([getCurrentHousehold(), searchParams]);
  const ingredients = await prisma.ingredient.findMany({
    where: ingredientCatalogWhere(household.id, household.isTestHousehold),
    orderBy: { name: 'asc' },
  });
  const backHref = safeRedirectTarget(redirectTo, '/recettes');

  return (
    <main className="p-6 pb-32">
      <PageHeader title="Nouvelle recette" backHref={backHref} />
      <RecipeForm
        action={createRecipeAction}
        submitLabel="Ajouter"
        ingredientOptions={ingredients.map((ingredient) => ({
          id: ingredient.id,
          name: ingredient.name,
          defaultUnit: ingredient.defaultUnit,
        }))}
        redirectTo={backHref}
        randomEmoji={pickRandomEmoji()}
      />
    </main>
  );
}
