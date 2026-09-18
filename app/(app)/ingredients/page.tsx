import Link from 'next/link';
import { Button, EmptyState, Icon, ICONS, ListRow, PageHeader, RayonGroup, Tag } from '@/components/ui';
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
    <main className="p-6 pb-32">
      <PageHeader
        title="Ingrédients"
        action={
          <Link href="/ingredients/nouveau">
            <Button icon={<Icon name="Plus" size={18} />}>Ajouter</Button>
          </Link>
        }
      />

      {ingredients.length === 0 ? (
        <EmptyState
          icon={ICONS.epicerie}
          title="Aucun ingrédient pour l'instant."
          description="Le catalogue alimente les recettes et le stock."
          action={
            <Link href="/ingredients/nouveau">
              <Button variant="secondary">Ajouter le premier</Button>
            </Link>
          }
        />
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
                  tag={
                    <>
                      {item.isPrivate && <Tag tone="neutre">Privé</Tag>}
                      <Tag tone="neutre">{item.conservationLabel}</Tag>
                    </>
                  }
                />
              ))}
            </RayonGroup>
          ))}
        </div>
      )}
    </main>
  );
}
