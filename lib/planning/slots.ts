import { TypeRepas } from '@prisma/client';
import { getWeekDates } from './dates';

export const MIN_MEALS_PER_DAY = 1;
export const MAX_MEALS_PER_DAY = 4;

/**
 * Types de repas générés selon le nombre de repas/jour choisi en configuration.
 * Non spécifié au PRD : mapping par défaut retenu faute de mieux (voir
 * docs/CONTEXT.md, Risques et décisions ouvertes), à affiner à l'usage.
 */
export const MEAL_TYPES_BY_COUNT: Record<number, TypeRepas[]> = {
  1: [TypeRepas.DINER],
  2: [TypeRepas.DEJEUNER, TypeRepas.DINER],
  3: [TypeRepas.PETIT_DEJEUNER, TypeRepas.DEJEUNER, TypeRepas.DINER],
  4: [TypeRepas.PETIT_DEJEUNER, TypeRepas.DEJEUNER, TypeRepas.DINER, TypeRepas.COLLATION],
};

export type WeekSlot = { date: Date; mealType: TypeRepas };

/**
 * Génère les créneaux d'une semaine (7 jours × mealsPerDay) à partir de la date de
 * début choisie par l'utilisateur. Pure : la persistance (création idempotente des
 * `MealPlan` manquants) est faite côté action serveur.
 */
export function generateWeekSlots(startDate: Date, mealsPerDay: number): WeekSlot[] {
  const mealTypes = MEAL_TYPES_BY_COUNT[mealsPerDay];
  if (!mealTypes) {
    throw new Error(`Nombre de repas/jour invalide : ${mealsPerDay}`);
  }

  const dates = getWeekDates(startDate);
  return dates.flatMap((date) => mealTypes.map((mealType) => ({ date, mealType })));
}

/**
 * Retrouve le nombre de repas/jour correspondant à un ensemble de types de repas déjà
 * générés (pour préremplir le formulaire de reconfiguration d'une semaine existante).
 * `null` si l'ensemble ne correspond à aucune configuration connue.
 */
export function detectMealsPerDay(existingMealTypes: TypeRepas[]): number | null {
  const set = new Set(existingMealTypes);
  for (const [count, mealTypes] of Object.entries(MEAL_TYPES_BY_COUNT)) {
    if (mealTypes.length === set.size && mealTypes.every((mealType) => set.has(mealType))) {
      return Number(count);
    }
  }
  return null;
}
