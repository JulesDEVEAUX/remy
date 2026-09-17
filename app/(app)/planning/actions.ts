'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCurrentHousehold } from '@/lib/household';
import { addDays, formatDateParam, getCurrentWeekStart, getWeekDates, parseDateParam } from '@/lib/planning/dates';
import { parseAssignmentFormData, parseWeekConfigFormData } from '@/lib/planning/mapping';
import { generateWeekSlots } from '@/lib/planning/slots';
import {
  validateAssignmentInput,
  validateWeekConfigInput,
  type AssignmentFieldErrors,
  type WeekConfigFieldErrors,
  type WeekConfigFormValues,
} from '@/lib/planning/validation';
import { prisma } from '@/lib/prisma';

export type WeekConfigActionState = { errors: WeekConfigFieldErrors; values: WeekConfigFormValues } | undefined;
export type AssignmentActionState = { errors: AssignmentFieldErrors } | undefined;

/** Calcule la plage [début, fin exclusive) de 7 jours utilisée pour scoper les requêtes MealPlan d'une semaine. */
function weekRange(weekStart: Date) {
  const weekDates = getWeekDates(weekStart);
  return { gte: weekDates[0], lt: addDays(weekDates[6], 1) };
}

/**
 * Génère les créneaux manquants d'une semaine à partir du nombre de repas/jour choisi.
 * Idempotent grâce à la contrainte d'unicité (householdId, date, mealType) : ne
 * duplique jamais un créneau déjà configuré, que ce soit en revenant sur la même
 * semaine ou en augmentant le nombre de repas/jour depuis « Reconfigurer ».
 */
export async function configureWeekAction(
  _prevState: WeekConfigActionState,
  formData: FormData,
): Promise<WeekConfigActionState> {
  const household = await getCurrentHousehold();
  const values = parseWeekConfigFormData(formData);
  const result = validateWeekConfigInput(values);
  if (!result.ok) {
    return { errors: result.errors, values };
  }

  const slots = generateWeekSlots(result.data.startDate, result.data.mealsPerDay);
  await prisma.mealPlan.createMany({
    data: slots.map((slot) => ({
      householdId: household.id,
      date: slot.date,
      mealType: slot.mealType,
    })),
    skipDuplicates: true,
  });

  revalidatePath('/planning');
  redirect(`/planning?start=${formatDateParam(result.data.startDate)}`);
}

/**
 * Assigne une recette à un créneau, et — si le batch cooking est coché — aux
 * autres créneaux de la semaine sélectionnés. Rejette la réutilisation d'une
 * recette sur plusieurs créneaux sans batch (cf. lib/planning/validation.ts).
 */
export async function assignRecipeAction(
  mealPlanId: string,
  weekStartParam: string,
  _prevState: AssignmentActionState,
  formData: FormData,
): Promise<AssignmentActionState> {
  const household = await getCurrentHousehold();

  const target = await prisma.mealPlan.findFirst({ where: { id: mealPlanId, householdId: household.id } });
  if (!target) {
    redirect('/planning');
  }

  const weekStart = parseDateParam(weekStartParam) ?? getCurrentWeekStart();
  const [weekSlots, recipes] = await Promise.all([
    prisma.mealPlan.findMany({
      where: { householdId: household.id, date: weekRange(weekStart) },
      select: { id: true, recipeId: true, isBatch: true },
    }),
    prisma.recipe.findMany({ where: { householdId: household.id }, select: { id: true } }),
  ]);

  const values = parseAssignmentFormData(formData);
  const result = validateAssignmentInput(values, {
    targetSlotId: mealPlanId,
    validRecipeIds: new Set(recipes.map((recipe) => recipe.id)),
    weekSlots,
  });
  if (!result.ok) {
    return { errors: result.errors };
  }

  const slotIds = [mealPlanId, ...result.data.additionalSlotIds];
  await prisma.mealPlan.updateMany({
    where: { id: { in: slotIds }, householdId: household.id },
    data: { recipeId: result.data.recipeId, isBatch: result.data.isBatch },
  });

  revalidatePath('/planning');
  redirect(`/planning?start=${weekStartParam}`);
}

/** Vide un créneau (retire la recette et le flag batch), pour le rendre à nouveau assignable. */
export async function unassignRecipeAction(mealPlanId: string, weekStartParam: string) {
  const household = await getCurrentHousehold();
  await prisma.mealPlan.updateMany({
    where: { id: mealPlanId, householdId: household.id },
    data: { recipeId: null, isBatch: false },
  });

  revalidatePath('/planning');
  redirect(`/planning?start=${weekStartParam}`);
}
