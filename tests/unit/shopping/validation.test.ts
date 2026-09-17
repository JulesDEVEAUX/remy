import { describe, expect, it } from 'vitest';
import { validateShoppingItemInput, type ShoppingItemFormValues } from '@/lib/shopping/validation';

const validIngredientIds = new Set(['ing_1']);

const validValues: ShoppingItemFormValues = {
  ingredientId: 'ing_1',
  quantity: '2',
  unit: 'pièce',
};

describe('validateShoppingItemInput', () => {
  it('accepts valid values', () => {
    const result = validateShoppingItemInput(validValues, validIngredientIds);
    expect(result).toEqual({ ok: true, data: { ingredientId: 'ing_1', quantity: 2, unit: 'pièce' } });
  });

  it('rejects a missing ingredient', () => {
    const result = validateShoppingItemInput({ ...validValues, ingredientId: '' }, validIngredientIds);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.ingredientId).toBeDefined();
    }
  });

  it('rejects an ingredient outside the household catalog', () => {
    const result = validateShoppingItemInput({ ...validValues, ingredientId: 'ing_ailleurs' }, validIngredientIds);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.ingredientId).toBeDefined();
    }
  });

  it('rejects a zero or negative quantity', () => {
    const zero = validateShoppingItemInput({ ...validValues, quantity: '0' }, validIngredientIds);
    expect(zero.ok).toBe(false);

    const negative = validateShoppingItemInput({ ...validValues, quantity: '-1' }, validIngredientIds);
    expect(negative.ok).toBe(false);
  });

  it('rejects a non-numeric quantity', () => {
    const result = validateShoppingItemInput({ ...validValues, quantity: 'plein' }, validIngredientIds);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.quantity).toBeDefined();
    }
  });

  it('rejects an empty unit', () => {
    const result = validateShoppingItemInput({ ...validValues, unit: '' }, validIngredientIds);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.unit).toBeDefined();
    }
  });

  it('rejects a unit longer than 20 characters', () => {
    const result = validateShoppingItemInput({ ...validValues, unit: 'a'.repeat(21) }, validIngredientIds);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.unit).toBeDefined();
    }
  });

  it('reports every invalid field at once', () => {
    const result = validateShoppingItemInput({ ingredientId: '', quantity: '', unit: '' }, validIngredientIds);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.errors).sort()).toEqual(['ingredientId', 'quantity', 'unit'].sort());
    }
  });
});
