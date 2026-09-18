import Link from 'next/link';
import { Button, EmptyState, ICONS, Icon, ListRow, PageHeader, Tag } from '@/components/ui';
import { getCurrentHousehold } from '@/lib/household';
import { toRecipeViewModel } from '@/lib/recipes/mapping';
import { prisma } from '@/lib/prisma';

export default async function RecettesPage() {
  const household = await getCurrentHousehold();
  const [recipes, publicRecipes] = await Promise.all([
    prisma.recipe.findMany({
      where: { householdId: household.id },
      include: { ingredients: true },
      orderBy: { name: 'asc' },
    }),
    prisma.recipe.findMany({
      where: { householdId: { not: household.id }, isPrivate: false },
      include: { ingredients: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <main className="p-6 pb-32">
      <PageHeader
        title="Recettes"
        action={
          <Link href="/recettes/nouveau">
            <Button icon={<Icon name="Plus" size={18} />}>Ajouter</Button>
          </Link>
        }
      />
      <Link
        href="/ingredients"
        className="mb-6 inline-flex items-center gap-1 font-sans text-[13px] font-semibold text-terracotta-700"
      >
        Voir le catalogue d&apos;ingrédients
        <Icon name="ChevronRight" size={14} />
      </Link>

      {recipes.length === 0 ? (
        <EmptyState
          icon={ICONS.cuisine}
          title="Aucune recette pour l'instant."
          description="Ajoute-en une pour la retrouver ici."
          action={
            <Link href="/recettes/nouveau">
              <Button variant="secondary">Ajouter la première</Button>
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-1.5">
          {recipes.map((recipe) => {
            const viewModel = toRecipeViewModel(recipe);
            const meta = [viewModel.prepMinutesLabel, viewModel.lastMadeLabel].filter(Boolean).join(' · ');
            return (
              <ListRow
                key={viewModel.id}
                href={`/recettes/${viewModel.id}`}
                icon="ChefHat"
                label={viewModel.name}
                meta={meta}
                tag={viewModel.seasonLabels[0] ? <Tag tone="saison">{viewModel.seasonLabels[0]}</Tag> : undefined}
              />
            );
          })}
        </div>
      )}

      {publicRecipes.length > 0 && (
        <section className="mt-8 flex flex-col gap-1.5">
          <h2 className="mb-1 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-clay-700 dark:text-clay-400">
            Recettes partagées par d&apos;autres foyers
          </h2>
          {publicRecipes.map((recipe) => {
            const viewModel = toRecipeViewModel(recipe);
            return (
              <ListRow
                key={viewModel.id}
                href={`/recettes/${viewModel.id}`}
                icon="ChefHat"
                label={viewModel.name}
                tag={<Tag tone="neutre">Public</Tag>}
              />
            );
          })}
        </section>
      )}
    </main>
  );
}
