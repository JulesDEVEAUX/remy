import { MAX_MEALS_PER_DAY, MIN_MEALS_PER_DAY } from './slots';
import { parseDateParam } from './dates';

export type WeekConfigFormValues = { startDate: string; mealsPerDay: string };
export type WeekConfigFieldErrors = Partial<Record<'startDate' | 'mealsPerDay', string>>;
export type WeekConfigInput = { startDate: Date; mealsPerDay: number };
export type WeekConfigValidationResult =
  | { ok: true; data: WeekConfigInput }
  | { ok: false; errors: WeekConfigFieldErrors };

/** Valide la configuration de début de semaine : date de départ + nombre de repas/jour. */
export function validateWeekConfigInput(values: WeekConfigFormValues): WeekConfigValidationResult {
  const errors: WeekConfigFieldErrors = {};

  const startDate = parseDateParam(values.startDate.trim());
  if (!startDate) {
    errors.startDate = 'Choisis une date de début valide.';
  }

  const mealsPerDay = Number(values.mealsPerDay);
  if (!Number.isInteger(mealsPerDay) || mealsPerDay < MIN_MEALS_PER_DAY || mealsPerDay > MAX_MEALS_PER_DAY) {
    errors.mealsPerDay = `Choisis entre ${MIN_MEALS_PER_DAY} et ${MAX_MEALS_PER_DAY} repas par jour.`;
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, data: { startDate: startDate!, mealsPerDay } };
}

export type WeekSlotSummary = { id: string; recipeId: string | null; isBatch: boolean };

export type AssignmentFormValues = {
  recipeId: string;
  isBatch: boolean;
  additionalSlotIds: string[];
};

export type AssignmentFieldErrors = Partial<Record<'recipeId' | 'additionalSlotIds' | 'reuse', string>>;

export type AssignmentInput = {
  recipeId: string;
  isBatch: boolean;
  additionalSlotIds: string[];
};

export type AssignmentValidationResult =
  | { ok: true; data: AssignmentInput }
  | { ok: false; errors: AssignmentFieldErrors };

/**
 * Valide l'assignation d'une recette à un créneau. Règle serveur imposée par le
 * PRD : une recette ne peut couvrir plusieurs créneaux de la semaine que si le
 * flag batch cooking est activé — sur le créneau visé comme sur tout autre
 * créneau de la semaine qui la porte déjà.
 */
export function validateAssignmentInput(
  values: AssignmentFormValues,
  context: { targetSlotId: string; validRecipeIds: ReadonlySet<string>; weekSlots: WeekSlotSummary[] },
): AssignmentValidationResult {
  const errors: AssignmentFieldErrors = {};

  const recipeId = values.recipeId.trim();
  if (!recipeId || !context.validRecipeIds.has(recipeId)) {
    errors.recipeId = 'Choisis une recette existante.';
  }

  const weekSlotIds = new Set(context.weekSlots.map((slot) => slot.id));
  const additionalSlotIds = Array.from(new Set(values.additionalSlotIds.map((id) => id.trim()).filter(Boolean)));

  if (!values.isBatch && additionalSlotIds.length > 0) {
    errors.additionalSlotIds = 'Active le batch cooking pour couvrir plusieurs créneaux.';
  } else if (additionalSlotIds.some((id) => id === context.targetSlotId || !weekSlotIds.has(id))) {
    errors.additionalSlotIds = "Un des créneaux sélectionnés n'appartient pas à cette semaine.";
  }

  if (!values.isBatch && !errors.recipeId) {
    const reusedElsewhere = context.weekSlots.some(
      (slot) => slot.id !== context.targetSlotId && slot.recipeId === recipeId,
    );
    if (reusedElsewhere) {
      errors.reuse = 'Cette recette est déjà utilisée cette semaine : active le batch cooking pour la réutiliser.';
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, data: { recipeId, isBatch: values.isBatch, additionalSlotIds } };
}
