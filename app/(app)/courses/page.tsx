import Link from 'next/link';
import { Button, EmptyState, Icon, ICONS, IconButton, PageHeader, RayonGroup, Tag } from '@/components/ui';
import { getCurrentHousehold } from '@/lib/household';
import { ingredientCatalogWhere } from '@/lib/ingredients/catalog';
import { startOfDay } from '@/lib/planning/dates';
import { groupShoppingItems, selectPlannedRecipeOccurrences } from '@/lib/shopping/mapping';
import { prisma } from '@/lib/prisma';
import {
  addShoppingItemAction,
  clearCheckedItemsAction,
  deleteShoppingListAction,
  generateShoppingListAction,
} from './actions';
import { ShoppingItemForm } from './ShoppingItemForm';
import { ShoppingItemRow } from './ShoppingItemRow';
import { ShoppingListForm } from './ShoppingListForm';

/** Garantit qu'un foyer a toujours au moins une liste de courses à afficher. */
async function ensureDefaultShoppingList(householdId: string) {
  return prisma.shoppingList.upsert({
    where: { householdId_name: { householdId, name: 'Courses' } },
    update: {},
    create: { householdId, name: 'Courses' },
  });
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ listId?: string }>;
}) {
  const { listId } = await searchParams;
  const household = await getCurrentHousehold();

  const lists = await prisma.shoppingList.findMany({
    where: { householdId: household.id },
    orderBy: { createdAt: 'asc' },
  });
  const currentList = lists.find((list) => list.id === listId) ?? lists[0] ?? (await ensureDefaultShoppingList(household.id));
  if (lists.length === 0) {
    lists.push(currentList);
  }

  const [items, upcomingMealPlans, ingredients, householdNeedsCount] = await Promise.all([
    prisma.shoppingListItem.findMany({
      where: { householdId: household.id, shoppingListId: currentList.id },
      include: { ingredient: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.mealPlan.findMany({
      where: { householdId: household.id, date: { gte: startOfDay(new Date()) }, recipeId: { not: null } },
      select: { recipeId: true, isBatch: true, recipe: { select: { name: true } } },
    }),
    prisma.ingredient.findMany({
      where: ingredientCatalogWhere(household.id, household.isTestHousehold),
      select: { id: true, name: true, defaultUnit: true },
      orderBy: { name: 'asc' },
    }),
    prisma.householdNeed.count({ where: { householdId: household.id } }),
  ]);

  const sections = groupShoppingItems(items);
  const remaining = items.filter((item) => !item.checked).length;
  const hasChecked = items.some((item) => item.checked);

  const recipeNameById = new Map(
    upcomingMealPlans.map((plan) => [plan.recipeId!, plan.recipe!.name] as const),
  );
  const plannedOccurrenceCounts = new Map<string, number>();
  for (const recipeId of selectPlannedRecipeOccurrences(upcomingMealPlans)) {
    plannedOccurrenceCounts.set(recipeId, (plannedOccurrenceCounts.get(recipeId) ?? 0) + 1);
  }
  const plannedMeals = Array.from(plannedOccurrenceCounts, ([recipeId, count]) => ({
    recipeId,
    name: recipeNameById.get(recipeId)!,
    count,
  }));

  return (
    <main className="p-6 pb-32">
      <PageHeader title="Courses" />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {lists.map((list) => (
          <Link key={list.id} href={`/courses?listId=${list.id}`}>
            <Tag tone={list.id === currentList.id ? 'saison' : 'neutre'}>{list.name}</Tag>
          </Link>
        ))}
      </div>
      <div className="mb-6 flex items-end justify-between gap-3">
        <p className="font-mono text-[12px] text-clay-600 dark:text-clay-400">
          {remaining} article{remaining !== 1 ? 's' : ''} restant{remaining !== 1 ? 's' : ''}
        </p>
        {lists.length > 1 && (
          <form action={deleteShoppingListAction.bind(null, currentList.id)}>
            <IconButton type="submit" aria-label={`Supprimer la liste ${currentList.name}`}>
              <Icon name="Trash" size={18} />
            </IconButton>
          </form>
        )}
      </div>
      <div className="mb-8">
        <ShoppingListForm key={lists.length} />
      </div>

      {(plannedMeals.length > 0 || householdNeedsCount > 0) && (
        <form
          action={generateShoppingListAction.bind(null, currentList.id)}
          className="mb-8 flex flex-col gap-3 rounded-lg bg-sand p-4 dark:bg-clay-800"
        >
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-clay-700 dark:text-clay-400">
            Générer depuis mon planning — liste « {currentList.name} »
          </span>
          {plannedMeals.length > 0 && (
            <div className="flex flex-col gap-1.5">
              {plannedMeals.map((meal) => (
                <div
                  key={meal.recipeId}
                  className="flex min-h-[44px] items-center gap-3 rounded-md bg-cream px-4 dark:bg-ink"
                >
                  <span className="font-sans text-[14px] font-semibold text-ink dark:text-cream">{meal.name}</span>
                  {meal.count > 1 && (
                    <span className="ml-auto font-mono text-[12px] text-clay-600 dark:text-clay-400">
                      ×{meal.count}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          {householdNeedsCount > 0 && (
            <p className="font-sans text-[12px] text-clay-700 dark:text-clay-400">
              Inclut aussi tes besoins récurrents du foyer (huile, produits ménagers…).
            </p>
          )}
          <Button type="submit" variant="secondary" block>
            Générer la liste
          </Button>
        </form>
      )}

      <ShoppingItemForm action={addShoppingItemAction} ingredientOptions={ingredients} shoppingListId={currentList.id} />

      {items.length === 0 ? (
        <EmptyState
          icon={ICONS.courses}
          title="Rien à acheter pour l'instant dans cette liste."
          description="Planifie des repas pour générer la liste ci-dessus, ou ajoute un article manuellement."
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
            <form action={clearCheckedItemsAction.bind(null, currentList.id)}>
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
