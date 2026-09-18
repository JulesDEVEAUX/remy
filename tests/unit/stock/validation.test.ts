import { StockLocation } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { validateStockInput, type StockFormValues } from '@/lib/stock/validation';

const validIngredientIds = new Set(['ing_1']);

const validValues: StockFormValues = {
  ingredientId: 'ing_1',
  quantity: '500',
  unit: 'g',
  location: StockLocation.FRIGO,
  expiresAt: '',
};

describe('validateStockInput', () => {
  it('accepts valid values with no expiry date and leaves it null', () => {
    const result = validateStockInput(validValues, validIngredientIds);
    expect(result).toEqual({
      ok: true,
      data: { ingredientId: 'ing_1', quantity: 500, unit: 'g', location: StockLocation.FRIGO, expiresAt: null },
    });
  });

  it('accepts and parses a provided expiry date', () => {
    const result = validateStockInput({ ...validValues, expiresAt: '2026-12-25' }, validIngredientIds);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.expiresAt).toEqual(new Date(2026, 11, 25));
    }
  });

  it('rejects a missing ingredient', () => {
    const result = validateStockInput({ ...validValues, ingredientId: '' }, validIngredientIds);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.ingredientId).toBeDefined();
    }
  });

  it('rejects an ingredient outside the household catalog', () => {
    const result = validateStockInput({ ...validValues, ingredientId: 'ing_ailleurs' }, validIngredientIds);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.ingredientId).toBeDefined();
    }
  });

  it('rejects a zero or negative quantity', () => {
    const zero = validateStockInput({ ...validValues, quantity: '0' }, validIngredientIds);
    expect(zero.ok).toBe(false);

    const negative = validateStockInput({ ...validValues, quantity: '-5' }, validIngredientIds);
    expect(negative.ok).toBe(false);
  });

  it('rejects a non-numeric quantity', () => {
    const result = validateStockInput({ ...validValues, quantity: 'beaucoup' }, validIngredientIds);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.quantity).toBeDefined();
    }
  });

  it('rejects an empty unit', () => {
    const result = validateStockInput({ ...validValues, unit: '' }, validIngredientIds);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.unit).toBeDefined();
    }
  });

  it('rejects a unit longer than 20 characters', () => {
    const result = validateStockInput({ ...validValues, unit: 'a'.repeat(21) }, validIngredientIds);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.unit).toBeDefined();
    }
  });

  it('rejects a missing location', () => {
    const result = validateStockInput({ ...validValues, location: '' }, validIngredientIds);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.location).toBeDefined();
    }
  });

  it('rejects a location outside the known enum', () => {
    const result = validateStockInput({ ...validValues, location: 'GARAGE' }, validIngredientIds);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.location).toBeDefined();
    }
  });

  it('rejects an invalid expiry date string', () => {
    const result = validateStockInput({ ...validValues, expiresAt: 'pas une date' }, validIngredientIds);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.expiresAt).toBeDefined();
    }
  });

  it('reports every invalid field at once', () => {
    const result = validateStockInput(
      { ingredientId: '', quantity: '', unit: '', location: '', expiresAt: 'nope' },
      validIngredientIds,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.errors).sort()).toEqual(
        ['expiresAt', 'ingredientId', 'location', 'quantity', 'unit'].sort(),
      );
    }
  });
});
