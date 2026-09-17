import { prisma } from '@/lib/prisma';

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  const result = startOfDay(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Vide les créneaux (MealPlan) d'une semaine pour repartir d'un état propre à chaque
 * run, sur le foyer de test stable réutilisé d'une nuit sur l'autre. Sans ça, générer
 * la même semaine plusieurs fois (retries Playwright, ou deux runs nocturnes le même
 * jour) accumule des créneaux/assignations d'un run précédent — les compteurs de la
 * vue résumé (Tag "Batch", "À assigner"...) ne sont jamais scopés à un seul run et
 * dérivent au fil des exécutions.
 */
export async function resetWeekMealPlans(ownerUserId: string | undefined, weekStart: Date) {
  if (!ownerUserId) {
    return;
  }
  const household = await prisma.household.findUnique({ where: { ownerUserId } });
  if (!household) {
    return;
  }
  const start = startOfDay(weekStart);
  const end = addDays(start, 7);
  await prisma.mealPlan.deleteMany({ where: { householdId: household.id, date: { gte: start, lt: end } } });
}
