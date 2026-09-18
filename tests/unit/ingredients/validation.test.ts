import { describe, expect, it } from 'vitest';
import { validateIngredientInput, type IngredientFormValues } from '@/lib/ingredients/validation';
import { UNIT_OPTIONS } from '@/lib/ingredients/units';

const validValues: IngredientFormValues = {
  name: 'Farine T55',
  category: 'EPICERIE',
  defaultUnit: 'g',
  conservation: 'LONGUE',
  defaultSource: 'CARREFOUR',
  isPrivate: false,
};

describe('validateIngredientInput', () => {
  it('accepts fully valid values and normalizes trimmed fields', () => {
    const result = validateIngredientInput({
      ...validValues,
      name: '  Farine T55  ',
      defaultUnit: ' g ',
    });

    expect(result).toEqual({
      ok: true,
      data: {
        name: 'Farine T55',
        category: 'EPICERIE',
        defaultUnit: 'g',
        conservation: 'LONGUE',
        defaultSource: 'CARREFOUR',
        isPrivate: false,
      },
    });
  });

  it('carries a checked isPrivate through unchanged', () => {
    const result = validateIngredientInput({ ...validValues, isPrivate: true });
    expect(result).toEqual({ ok: true, data: { ...validValues, isPrivate: true } });
  });

  it('rejects an empty name', () => {
    const result = validateIngredientInput({ ...validValues, name: '   ' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.name).toBeDefined();
    }
  });

  it('rejects a name longer than 80 characters', () => {
    const result = validateIngredientInput({ ...validValues, name: 'a'.repeat(81) });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.name).toBeDefined();
    }
  });

  it('rejects an unknown category', () => {
    const result = validateIngredientInput({ ...validValues, category: 'JOUETS' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.category).toBeDefined();
    }
  });

  it('rejects an empty default unit', () => {
    const result = validateIngredientInput({ ...validValues, defaultUnit: '' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.defaultUnit).toBeDefined();
    }
  });

  it('rejects a default unit outside the fixed list', () => {
    const result = validateIngredientInput({ ...validValues, defaultUnit: 'litres' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.defaultUnit).toBeDefined();
    }
  });

  it('accepts every unit option of the fixed list', () => {
    for (const option of UNIT_OPTIONS) {
      const result = validateIngredientInput({ ...validValues, defaultUnit: option.value });
      expect(result.ok).toBe(true);
    }
  });

  it('rejects an unknown conservation duration', () => {
    const result = validateIngredientInput({ ...validValues, conservation: 'ETERNELLE' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.conservation).toBeDefined();
    }
  });

  it('rejects an unknown purchase source', () => {
    const result = validateIngredientInput({ ...validValues, defaultSource: 'AMAZON' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.defaultSource).toBeDefined();
    }
  });

  it('reports every invalid field at once', () => {
    const result = validateIngredientInput({
      name: '',
      category: '',
      defaultUnit: '',
      conservation: '',
      defaultSource: '',
      isPrivate: false,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.errors).sort()).toEqual(
        ['category', 'conservation', 'defaultSource', 'defaultUnit', 'name'].sort(),
      );
    }
  });
});
