import { Button, EmptyState, ICONS, PageHeader, RayonGroup } from '@/components/ui';
import { getCurrentHousehold } from '@/lib/household';
import { groupShoppingItems } from '@/lib/shopping/mapping';
import { prisma } from '@/lib/prisma';
import { addShoppingItemAction, clearCheckedItemsAction, generateShoppingListAction } from './actions';
import { ShoppingItemForm } from './ShoppingItemForm';
import { ShoppingItemRow } from './ShoppingItemRow';

export default async function CoursesPage() {
  const household = await getCurrentHousehold();

  const [items, recipes, ingredients] = await Promise.all([
    prisma.shoppingListItem.findMany({
      where: { householdId: household.id },
      include: { ingredient: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.recipe.findMany({
      where: { householdId: household.id },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.ingredient.findMany({
      where: { householdId: household.id },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  const sections = groupShoppingItems(items);
  const remaining = items.filter((item) => !item.checked).length;
  const hasChecked = items.some((item) => item.checked);

  return (
    <main className="p-6 pb-32">
      <PageHeader title="Courses" />
      <p className="-mt-4 mb-6 font-mono text-[12px] text-clay-600 dark:text-clay-400">
        {remaining} article{remaining !== 1 ? 's' : ''} restant{remaining !== 1 ? 's' : ''}
      </p>

      {recipes.length > 0 && (
        <form action={generateShoppingListAction} className="mb-8 flex flex-col gap-3 rounded-lg bg-sand p-4 dark:bg-clay-800">
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-clay-700 dark:text-clay-400">
            Générer depuis des recettes
          </span>
          <div className="flex flex-col gap-1.5">
            {recipes.map((recipe) => (
              <label
                key={recipe.id}
                className="flex min-h-[44px] items-center gap-3 rounded-md bg-cream px-4 dark:bg-ink"
              >
                <input type="checkbox" name="recipeIds" value={recipe.id} className="size-5 accent-terracotta" />
                <span className="font-sans text-[14px] font-semibold text-ink dark:text-cream">{recipe.name}</span>
              </label>
            ))}
          </div>
          <Button type="submit" variant="secondary" block>
            Générer la liste
          </Button>
        </form>
      )}

      <ShoppingItemForm action={addShoppingItemAction} ingredientOptions={ingredients} />

      {items.length === 0 ? (
        <EmptyState
          icon={ICONS.courses}
          title="Rien à acheter pour l'instant."
          description="Sélectionne des recettes ci-dessus ou ajoute un article manuellement."
        />
      ) : (
        <div className="flex flex-col gap-8">
          {sections.map(
            (section) =>
              section.groups.length > 0 && (
                <section key={section.source} className="flex flex-col gap-6">
                  <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-clay-700 dark:text-clay-400">
                    {section.label}
                  </h2>
                  {section.groups.map((group) => (
                    <RayonGroup key={group.category} rayon={group.label} icon={group.icon}>
                      {group.items.map((item) => (
                        <ShoppingItemRow
                          key={item.id}
                          id={item.id}
                          label={item.ingredientName}
                          qty={item.quantityLabel}
                          checked={item.checked}
                        />
                      ))}
                    </RayonGroup>
                  ))}
                </section>
              ),
          )}

          {hasChecked && (
            <form action={clearCheckedItemsAction}>
              <Button type="submit" variant="secondary" block>
                Vider les cochés
              </Button>
            </form>
          )}
        </div>
      )}
    </main>
  );
}
