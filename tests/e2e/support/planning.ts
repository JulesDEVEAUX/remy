import { prisma } from '@/lib/prisma';

/**
 * Planifie une recette (déjà créée) sur le créneau déjeuner du jour, pour
 * tester la génération de liste de courses depuis le planning sans dérouler
 * tout le flux de configuration de semaine.
 */
export async function planTodayLunch(ownerUserId: string | undefined, recipeName: string) {
  if (!ownerUserId) {
    return;
  }
  const household = await prisma.household.findUnique({ where: { ownerUserId } });
  if (!household) {
    return;
  }
  const recipe = await prisma.recipe.findFirst({ where: { householdId: household.id, name: recipeName } });
  if (!recipe) {
    return;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.mealPlan.upsert({
    where: { householdId_date_mealType: { householdId: household.id, date: today, mealType: 'DEJEUNER' } },
    update: { recipeId: recipe.id, isBatch: false },
    create: { householdId: household.id, date: today, mealType: 'DEJEUNER', recipeId: recipe.id },
  });
}
