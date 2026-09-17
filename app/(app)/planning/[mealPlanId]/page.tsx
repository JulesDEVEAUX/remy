import { notFound } from 'next/navigation';
import { Button, EmptyState, ICONS, PageHeader } from '@/components/ui';
import { getCurrentHousehold } from '@/lib/household';
import { addDays, formatDateParam, getCurrentWeekStart, getWeekDates, parseDateParam } from '@/lib/planning/dates';
import { MEAL_TYPE_LABELS } from '@/lib/planning/mapping';
import { rankRecipesForSlot } from '@/lib/planning/picker';
import { prisma } from '@/lib/prisma';
import { assignRecipeAction, unassignRecipeAction } from '../actions';
import { AssignRecipeForm } from './AssignRecipeForm';

export default async function AssignSlotPage({
  params,
  searchParams,
}: {
  params: Promise<{ mealPlanId: string }>;
  searchParams: Promise<{ start?: string }>;
}) {
  const { mealPlanId } = await params;
  const { start } = await searchParams;
  const household = await getCurrentHousehold();

  const target = await prisma.mealPlan.findFirst({ where: { id: mealPlanId, householdId: household.id } });
  if (!target) {
    notFound();
  }

  const weekStart = parseDateParam(start) ?? getCurrentWeekStart(target.date);
  const weekStartParam = formatDateParam(weekStart);
  const weekDates = getWeekDates(weekStart);

  const [recipes, stockEntries, otherMealPlans] = await Promise.all([
    prisma.recipe.findMany({ where: { householdId: household.id }, include: { ingredients: true } }),
    prisma.stock.findMany({ where: { householdId: household.id }, include: { ingredient: true } }),
    prisma.mealPlan.findMany({
      where: {
        householdId: household.id,
        date: { gte: weekDates[0], lt: addDays(weekDates[6], 1) },
        id: { not: mealPlanId },
      },
      include: { recipe: true },
      orderBy: { date: 'asc' },
    }),
  ]);

  const rankedRecipes = rankRecipesForSlot(recipes, stockEntries);
  const otherSlots = otherMealPlans.map((mealPlan) => ({
    id: mealPlan.id,
    label: `${mealPlan.date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })} · ${MEAL_TYPE_LABELS[mealPlan.mealType]}`,
    recipeName: mealPlan.recipe?.name ?? null,
  }));

  return (
    <main className="p-6 pb-32">
      <PageHeader title={MEAL_TYPE_LABELS[target.mealType]} backHref={`/planning?start=${weekStartParam}`} />
      <p className="mb-6 font-mono text-[12px] uppercase tracking-[0.08em] text-clay-700 dark:text-clay-400">
        {target.date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })}
      </p>

      {rankedRecipes.length === 0 ? (
        <EmptyState
          icon={ICONS.cuisine}
          title="Aucune recette pour l'instant."
          description="Ajoute une recette pour pouvoir l'assigner à ce créneau."
        />
      ) : (
        <AssignRecipeForm
          action={assignRecipeAction.bind(null, mealPlanId, weekStartParam)}
          recipes={rankedRecipes}
          otherSlots={otherSlots}
          defaultRecipeId={target.recipeId}
          defaultIsBatch={target.isBatch}
        />
      )}

      {target.recipeId && (
        <form action={unassignRecipeAction.bind(null, mealPlanId, weekStartParam)} className="mt-6">
          <Button type="submit" variant="secondary" block>
            Retirer la recette
          </Button>
        </form>
      )}
    </main>
  );
}
