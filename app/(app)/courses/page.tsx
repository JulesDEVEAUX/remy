import { Button, EmptyState, ICONS, PageHeader, RayonGroup } from '@/components/ui';
import { getCurrentHousehold } from '@/lib/household';
import { startOfDay } from '@/lib/planning/dates';
import { groupShoppingItems, selectPlannedRecipeOccurrences } from '@/lib/shopping/mapping';
import { prisma } from '@/lib/prisma';
import { addShoppingItemAction, clearCheckedItemsAction, generateShoppingListAction } from './actions';
import { ShoppingItemForm } from './ShoppingItemForm';
import { ShoppingItemRow } from './ShoppingItemRow';

export default async function CoursesPage() {
  const household = await getCurrentHousehold();

  const [items, upcomingMealPlans, ingredients, householdNeedsCount] = await Promise.all([
    prisma.shoppingListItem.findMany({
      where: { householdId: household.id },
      include: { ingredient: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.mealPlan.findMany({
      where: { householdId: household.id, date: { gte: startOfDay(new Date()) }, recipeId: { not: null } },
      select: { recipeId: true, isBatch: true, recipe: { select: { name: true } } },
    }),
    prisma.ingredient.findMany({
      where: { householdId: household.id },
      select: { id: true, name: true },
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
      <p className="-mt-4 mb-6 font-mono text-[12px] text-clay-600 dark:text-clay-400">
        {remaining} article{remaining !== 1 ? 's' : ''} restant{remaining !== 1 ? 's' : ''}
      </p>

      {(plannedMeals.length > 0 || householdNeedsCount > 0) && (
        <form action={generateShoppingListAction} className="mb-8 flex flex-col gap-3 rounded-lg bg-sand p-4 dark:bg-clay-800">
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-clay-700 dark:text-clay-400">
            Générer depuis mon planning
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

      <ShoppingItemForm action={addShoppingItemAction} ingredientOptions={ingredients} />

      {items.length === 0 ? (
        <EmptyState
          icon={ICONS.courses}
          title="Rien à acheter pour l'instant."
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
