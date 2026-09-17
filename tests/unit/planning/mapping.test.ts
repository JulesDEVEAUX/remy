import { TypeRepas, type MealPlan, type Recipe } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { getWeekDates } from '@/lib/planning/dates';
import { buildWeekSummary, groupSlotsByDay, type MealPlanWithRecipe } from '@/lib/planning/mapping';

const WEEK_START = new Date(2026, 8, 21); // lundi 21 septembre 2026

function makeRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: 'recipe_1',
    householdId: 'household_1',
    name: 'Curry de lentilles',
    sourceUrl: null,
    instructions: 'Faire revenir puis mijoter.',
    prepMinutes: 25,
    seasons: [],
    tags: [],
    personalNote: null,
    lastMadeAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeMealPlan(overrides: Partial<MealPlanWithRecipe> = {}): MealPlanWithRecipe {
  const base: MealPlan = {
    id: 'mp_1',
    householdId: 'household_1',
    date: WEEK_START,
    mealType: TypeRepas.DINER,
    recipeId: null,
    isBatch: false,
    createdAt: new Date(),
  };
  return { ...base, recipe: null, ...overrides };
}

describe('groupSlotsByDay', () => {
  it('place chaque créneau sous le bon jour et trie petit-déjeuner avant déjeuner avant dîner', () => {
    const tuesday = new Date(2026, 8, 22);
    const mealPlans: MealPlanWithRecipe[] = [
      makeMealPlan({ id: 'mp_diner', date: WEEK_START, mealType: TypeRepas.DINER }),
      makeMealPlan({ id: 'mp_dejeuner', date: WEEK_START, mealType: TypeRepas.DEJEUNER }),
      makeMealPlan({ id: 'mp_mardi', date: tuesday, mealType: TypeRepas.DINER }),
    ];

    const days = groupSlotsByDay(getWeekDates(WEEK_START), mealPlans);

    expect(days[0].slots.map((slot) => slot.id)).toEqual(['mp_dejeuner', 'mp_diner']);
    expect(days[1].slots.map((slot) => slot.id)).toEqual(['mp_mardi']);
    expect(days[2].slots).toEqual([]);
  });

  it('marque un créneau sans recette comme vide, et un créneau assigné comme non vide', () => {
    const mealPlans: MealPlanWithRecipe[] = [
      makeMealPlan({ id: 'mp_vide', recipeId: null, recipe: null }),
      makeMealPlan({
        id: 'mp_assigne',
        mealType: TypeRepas.DEJEUNER,
        recipeId: 'recipe_1',
        recipe: makeRecipe(),
      }),
    ];

    const days = groupSlotsByDay(getWeekDates(WEEK_START), mealPlans);
    const empty = days[0].slots.find((slot) => slot.id === 'mp_vide')!;
    const assigned = days[0].slots.find((slot) => slot.id === 'mp_assigne')!;

    expect(empty.isEmpty).toBe(true);
    expect(empty.recipeName).toBeNull();
    expect(assigned.isEmpty).toBe(false);
    expect(assigned.recipeName).toBe('Curry de lentilles');
  });
});

describe('buildWeekSummary', () => {
  it('aplati les 7 jours en une liste de créneaux, avec le libellé du jour en méta', () => {
    const mealPlans: MealPlanWithRecipe[] = [makeMealPlan({ id: 'mp_1' })];
    const summary = buildWeekSummary(getWeekDates(WEEK_START), mealPlans);

    expect(summary).toHaveLength(1);
    expect(summary[0].dayLabel).toContain('Lundi');
    expect(summary[0].isEmpty).toBe(true);
  });

  it('compte les créneaux vides sur la semaine, tout jour confondu', () => {
    const mealPlans: MealPlanWithRecipe[] = [
      makeMealPlan({ id: 'mp_1', date: WEEK_START }),
      makeMealPlan({ id: 'mp_2', date: new Date(2026, 8, 22), recipeId: 'recipe_1', recipe: makeRecipe() }),
    ];

    const summary = buildWeekSummary(getWeekDates(WEEK_START), mealPlans);
    const emptyCount = summary.filter((row) => row.isEmpty).length;

    expect(emptyCount).toBe(1);
  });
});
