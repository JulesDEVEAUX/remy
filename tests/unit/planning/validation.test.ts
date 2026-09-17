import { describe, expect, it } from 'vitest';
import {
  validateAssignmentInput,
  validateWeekConfigInput,
  type WeekSlotSummary,
} from '@/lib/planning/validation';

describe('validateWeekConfigInput', () => {
  it('accepte une date valide et un nombre de repas/jour dans les bornes', () => {
    const result = validateWeekConfigInput({ startDate: '2026-09-21', mealsPerDay: '3' });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.mealsPerDay).toBe(3);
      expect(result.data.startDate.getFullYear()).toBe(2026);
    }
  });

  it('rejette une date de début manquante ou invalide', () => {
    const missing = validateWeekConfigInput({ startDate: '', mealsPerDay: '2' });
    const invalid = validateWeekConfigInput({ startDate: 'pas-une-date', mealsPerDay: '2' });

    expect(missing.ok).toBe(false);
    expect(invalid.ok).toBe(false);
  });

  it('rejette un nombre de repas/jour hors des bornes 1-4', () => {
    const tooLow = validateWeekConfigInput({ startDate: '2026-09-21', mealsPerDay: '0' });
    const tooHigh = validateWeekConfigInput({ startDate: '2026-09-21', mealsPerDay: '5' });
    const notInteger = validateWeekConfigInput({ startDate: '2026-09-21', mealsPerDay: '2.5' });

    expect(tooLow.ok).toBe(false);
    expect(tooHigh.ok).toBe(false);
    expect(notInteger.ok).toBe(false);
  });
});

describe('validateAssignmentInput', () => {
  const validRecipeIds = new Set(['recipe_1', 'recipe_2']);

  it('accepte une recette valide sans batch quand elle n’est utilisée sur aucun autre créneau', () => {
    const weekSlots: WeekSlotSummary[] = [
      { id: 'slot_1', recipeId: null, isBatch: false },
      { id: 'slot_2', recipeId: null, isBatch: false },
    ];

    const result = validateAssignmentInput(
      { recipeId: 'recipe_1', isBatch: false, additionalSlotIds: [] },
      { targetSlotId: 'slot_1', validRecipeIds, weekSlots },
    );

    expect(result.ok).toBe(true);
  });

  it('rejette une recette inconnue du catalogue du foyer', () => {
    const weekSlots: WeekSlotSummary[] = [{ id: 'slot_1', recipeId: null, isBatch: false }];

    const result = validateAssignmentInput(
      { recipeId: 'recipe_inconnue', isBatch: false, additionalSlotIds: [] },
      { targetSlotId: 'slot_1', validRecipeIds, weekSlots },
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.recipeId).toBeDefined();
    }
  });

  it('rejette la réutilisation d’une recette déjà sur un autre créneau de la semaine sans batch', () => {
    const weekSlots: WeekSlotSummary[] = [
      { id: 'slot_1', recipeId: null, isBatch: false },
      { id: 'slot_2', recipeId: 'recipe_1', isBatch: false },
    ];

    const result = validateAssignmentInput(
      { recipeId: 'recipe_1', isBatch: false, additionalSlotIds: [] },
      { targetSlotId: 'slot_1', validRecipeIds, weekSlots },
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.reuse).toBeDefined();
    }
  });

  it('accepte la réutilisation quand le batch cooking est activé', () => {
    const weekSlots: WeekSlotSummary[] = [
      { id: 'slot_1', recipeId: null, isBatch: false },
      { id: 'slot_2', recipeId: 'recipe_1', isBatch: true },
      { id: 'slot_3', recipeId: null, isBatch: false },
    ];

    const result = validateAssignmentInput(
      { recipeId: 'recipe_1', isBatch: true, additionalSlotIds: ['slot_3'] },
      { targetSlotId: 'slot_1', validRecipeIds, weekSlots },
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.additionalSlotIds).toEqual(['slot_3']);
    }
  });

  it('rejette des créneaux additionnels cochés alors que le batch cooking est désactivé', () => {
    const weekSlots: WeekSlotSummary[] = [
      { id: 'slot_1', recipeId: null, isBatch: false },
      { id: 'slot_2', recipeId: null, isBatch: false },
    ];

    const result = validateAssignmentInput(
      { recipeId: 'recipe_1', isBatch: false, additionalSlotIds: ['slot_2'] },
      { targetSlotId: 'slot_1', validRecipeIds, weekSlots },
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.additionalSlotIds).toBeDefined();
    }
  });

  it("rejette un créneau additionnel qui n'appartient pas à la semaine", () => {
    const weekSlots: WeekSlotSummary[] = [{ id: 'slot_1', recipeId: null, isBatch: false }];

    const result = validateAssignmentInput(
      { recipeId: 'recipe_1', isBatch: true, additionalSlotIds: ['slot_hors_semaine'] },
      { targetSlotId: 'slot_1', validRecipeIds, weekSlots },
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.additionalSlotIds).toBeDefined();
    }
  });

  it('rejette la désactivation du batch quand un autre créneau partage encore la recette', () => {
    const weekSlots: WeekSlotSummary[] = [
      { id: 'slot_1', recipeId: 'recipe_1', isBatch: true },
      { id: 'slot_2', recipeId: 'recipe_1', isBatch: true },
    ];

    const result = validateAssignmentInput(
      { recipeId: 'recipe_1', isBatch: false, additionalSlotIds: [] },
      { targetSlotId: 'slot_1', validRecipeIds, weekSlots },
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.reuse).toBeDefined();
    }
  });
});
