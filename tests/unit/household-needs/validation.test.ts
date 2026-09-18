import { describe, expect, it } from 'vitest';
import { validateHouseholdNeedInput, type HouseholdNeedFormValues } from '@/lib/household-needs/validation';

const validIngredientIds = new Set(['ing_1', 'ing_2']);
const existingIngredientIds = new Set(['ing_2']);

const validValues: HouseholdNeedFormValues = {
  ingredientId: 'ing_1',
  monthlyQuantity: '4',
  unit: 'L',
};

describe('validateHouseholdNeedInput', () => {
  it('accepts valid values', () => {
    const result = validateHouseholdNeedInput(validValues, validIngredientIds, existingIngredientIds);
    expect(result).toEqual({ ok: true, data: { ingredientId: 'ing_1', monthlyQuantity: 4, unit: 'L' } });
  });

  it('rejects a missing ingredient', () => {
    const result = validateHouseholdNeedInput({ ...validValues, ingredientId: '' }, validIngredientIds, existingIngredientIds);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.ingredientId).toBeDefined();
    }
  });

  it('rejects an ingredient outside the household catalog', () => {
    const result = validateHouseholdNeedInput(
      { ...validValues, ingredientId: 'ing_ailleurs' },
      validIngredientIds,
      existingIngredientIds,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.ingredientId).toBeDefined();
    }
  });

  it('rejects an ingredient that already has a recurring need', () => {
    const result = validateHouseholdNeedInput(
      { ...validValues, ingredientId: 'ing_2' },
      validIngredientIds,
      existingIngredientIds,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.ingredientId).toBeDefined();
    }
  });

  it('rejects a zero or negative monthly quantity', () => {
    const zero = validateHouseholdNeedInput({ ...validValues, monthlyQuantity: '0' }, validIngredientIds, existingIngredientIds);
    expect(zero.ok).toBe(false);

    const negative = validateHouseholdNeedInput(
      { ...validValues, monthlyQuantity: '-1' },
      validIngredientIds,
      existingIngredientIds,
    );
    expect(negative.ok).toBe(false);
  });

  it('rejects a non-numeric monthly quantity', () => {
    const result = validateHouseholdNeedInput(
      { ...validValues, monthlyQuantity: 'plein' },
      validIngredientIds,
      existingIngredientIds,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.monthlyQuantity).toBeDefined();
    }
  });

  it('rejects an empty unit', () => {
    const result = validateHouseholdNeedInput({ ...validValues, unit: '' }, validIngredientIds, existingIngredientIds);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.unit).toBeDefined();
    }
  });

  it('rejects a unit longer than 20 characters', () => {
    const result = validateHouseholdNeedInput(
      { ...validValues, unit: 'a'.repeat(21) },
      validIngredientIds,
      existingIngredientIds,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.unit).toBeDefined();
    }
  });

  it('reports every invalid field at once', () => {
    const result = validateHouseholdNeedInput(
      { ingredientId: '', monthlyQuantity: '', unit: '' },
      validIngredientIds,
      existingIngredientIds,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.errors).sort()).toEqual(['ingredientId', 'monthlyQuantity', 'unit'].sort());
    }
  });
});