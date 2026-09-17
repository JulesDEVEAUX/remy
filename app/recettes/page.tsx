import Link from 'next/link';
import { Button, Icon, ListRow, Tag } from '@/components/ui';
import { getCurrentHousehold } from '@/lib/household';
import { toRecipeViewModel } from '@/lib/recipes/mapping';
import { prisma } from '@/lib/prisma';

export default async function RecettesPage() {
  const household = await getCurrentHousehold();
  const recipes = await prisma.recipe.findMany({
    where: { householdId: household.id },
    include: { ingredients: true },
    orderBy: { name: 'asc' },
  });

  return (
    <main className="min-h-screen bg-cream p-6 pb-28">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-[30px] text-ink">Recettes</h1>
        <Link href="/recettes/nouveau">
          <Button icon={<Icon name="Plus" size={18} />}>Ajouter</Button>
        </Link>
      </header>

      {recipes.length === 0 ? (
        <p className="font-sans text-[15px] text-clay-700">Aucune recette pour l&apos;instant. Ajoute la première.</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {recipes.map((recipe) => {
            const viewModel = toRecipeViewModel(recipe);
            return (
              <ListRow
                key={viewModel.id}
                href={`/recettes/${viewModel.id}`}
                icon="ChefHat"
                label={viewModel.name}
                meta={viewModel.prepMinutesLabel ?? undefined}
                tag={viewModel.seasonLabels[0] ? <Tag tone="saison">{viewModel.seasonLabels[0]}</Tag> : undefined}
              />
            );
          })}
        </div>
      )}
    </main>
  );
}
