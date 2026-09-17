import { TypeRepas, type MealPlan, type Recipe } from '@prisma/client';
import { formatDateParam, startOfDay } from './dates';
import type { AssignmentFormValues, WeekConfigFormValues } from './validation';

export type MealPlanWithRecipe = MealPlan & { recipe: Recipe | null };

export const MEAL_TYPE_LABELS: Record<TypeRepas, string> = {
  PETIT_DEJEUNER: 'Petit-déjeuner',
  DEJEUNER: 'Déjeuner',
  DINER: 'Dîner',
  COLLATION: 'Collation',
};

const MEAL_TYPE_ORDER: Record<TypeRepas, number> = {
  PETIT_DEJEUNER: 0,
  DEJEUNER: 1,
  DINER: 2,
  COLLATION: 3,
};

function capitalize(label: string) {
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function byMealTypeOrder(a: { mealType: TypeRepas }, b: { mealType: TypeRepas }) {
  return MEAL_TYPE_ORDER[a.mealType] - MEAL_TYPE_ORDER[b.mealType];
}

export type SlotViewModel = {
  id: string;
  date: Date;
  mealType: TypeRepas;
  mealTypeLabel: string;
  recipeId: string | null;
  recipeName: string | null;
  isBatch: boolean;
  isEmpty: boolean;
};

export function toSlotViewModel(mealPlan: MealPlanWithRecipe): SlotViewModel {
  return {
    id: mealPlan.id,
    date: mealPlan.date,
    mealType: mealPlan.mealType,
    mealTypeLabel: MEAL_TYPE_LABELS[mealPlan.mealType],
    recipeId: mealPlan.recipeId,
    recipeName: mealPlan.recipe?.name ?? null,
    isBatch: mealPlan.isBatch,
    isEmpty: mealPlan.recipeId === null,
  };
}

export type DayViewModel = {
  dateKey: string;
  dayLabel: string;
  dateLabel: string;
  slots: SlotViewModel[];
};

/** Regroupe les créneaux de la semaine par jour, dans l'ordre des 7 dates fournies. */
export function groupSlotsByDay(weekDates: Date[], mealPlans: MealPlanWithRecipe[]): DayViewModel[] {
  const slotsByDateKey = new Map<string, SlotViewModel[]>();
  for (const mealPlan of mealPlans) {
    const key = formatDateParam(startOfDay(mealPlan.date));
    const dayList = slotsByDateKey.get(key) ?? [];
    dayList.push(toSlotViewModel(mealPlan));
    slotsByDateKey.set(key, dayList);
  }

  return weekDates.map((date) => ({
    dateKey: formatDateParam(date),
    dayLabel: capitalize(date.toLocaleDateString('fr-FR', { weekday: 'long' })),
    dateLabel: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
    slots: (slotsByDateKey.get(formatDateParam(date)) ?? []).sort(byMealTypeOrder),
  }));
}

export type SummaryRowViewModel = SlotViewModel & { dayLabel: string; dateLabel: string };

/** Vue résumé à plat : un créneau par ligne, jour + repas en méta, pour repérer les créneaux vides. */
export function buildWeekSummary(weekDates: Date[], mealPlans: MealPlanWithRecipe[]): SummaryRowViewModel[] {
  return groupSlotsByDay(weekDates, mealPlans).flatMap((day) =>
    day.slots.map((slot) => ({ ...slot, dayLabel: day.dayLabel, dateLabel: day.dateLabel })),
  );
}

/** Résumé du jour pour l'écran Accueil, trié dans l'ordre des repas. */
export function toTodaySlotViewModels(mealPlans: MealPlanWithRecipe[]): SlotViewModel[] {
  return mealPlans.map(toSlotViewModel).sort(byMealTypeOrder);
}

export function parseWeekConfigFormData(formData: FormData): WeekConfigFormValues {
  return {
    startDate: String(formData.get('startDate') ?? ''),
    mealsPerDay: String(formData.get('mealsPerDay') ?? ''),
  };
}

export function parseAssignmentFormData(formData: FormData): AssignmentFormValues {
  return {
    recipeId: String(formData.get('recipeId') ?? ''),
    isBatch: formData.get('isBatch') === 'on',
    additionalSlotIds: formData.getAll('additionalSlotIds[]').map(String),
  };
}
