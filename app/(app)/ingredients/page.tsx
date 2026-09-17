import Link from 'next/link';
import { Button, Icon, ListRow, RayonGroup, Tag } from '@/components/ui';
import { getCurrentHousehold } from '@/lib/household';
import { toIngredientViewModel, type IngredientViewModel } from '@/lib/ingredients/mapping';
import { prisma } from '@/lib/prisma';

export default async function IngredientsPage() {
  const household = await getCurrentHousehold();
  const ingredients = await prisma.ingredient.findMany({
    where: { householdId: household.id },
    orderBy: { name: 'asc' },
  });

  const groups = new Map<string, IngredientViewModel[]>();
  for (const ingredient of ingredients) {
    const viewModel = toIngredientViewModel(ingredient);
    const group = groups.get(viewModel.categoryLabel) ?? [];
    group.push(viewModel);
    groups.set(viewModel.categoryLabel, group);
  }

  return (
    <main className="min-h-screen bg-cream p-6 pb-28">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-[30px] text-ink">Ingrédients</h1>
        <Link href="/ingredients/nouveau">
          <Button icon={<Icon name="Plus" size={18} />}>Ajouter</Button>
        </Link>
      </header>

      {ingredients.length === 0 ? (
        <p className="font-sans text-[15px] text-clay-700">
          Aucun ingrédient pour l&apos;instant. Ajoute le premier.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {[...groups.entries()].map(([categoryLabel, items]) => (
            <RayonGroup key={categoryLabel} rayon={categoryLabel} icon={items[0].categoryIcon}>
              {items.map((item) => (
                <ListRow
                  key={item.id}
                  href={`/ingredients/${item.id}`}
                  label={item.name}
                  meta={item.defaultUnit}
                  tag={<Tag tone="neutre">{item.conservationLabel}</Tag>}
                />
              ))}
            </RayonGroup>
          ))}
        </div>
      )}
    </main>
  );
}
