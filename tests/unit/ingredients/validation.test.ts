import { describe, expect, it } from 'vitest';
import { validateIngredientInput, type IngredientFormValues } from '@/lib/ingredients/validation';
import { SUBCATEGORY_OPTIONS } from '@/lib/ingredients/subcategories';
import { UNIT_OPTIONS } from '@/lib/ingredients/units';

const validValues: IngredientFormValues = {
  name: 'Farine T55',
  category: 'EPICERIE',
  subcategory: '',
  defaultUnit: 'g',
  conservation: 'LONGUE',
  defaultSource: 'CARREFOUR',
  isPrivate: false,
  emoji: '🌾',
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
        subcategory: null,
        defaultUnit: 'g',
        conservation: 'LONGUE',
        defaultSource: 'CARREFOUR',
        isPrivate: false,
        emoji: '🌾',
      },
    });
  });

  it('carries a checked isPrivate through unchanged', () => {
    const result = validateIngredientInput({ ...validValues, isPrivate: true });
    expect(result).toEqual({ ok: true, data: { ...validValues, subcategory: null, isPrivate: true } });
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

  it('leaves emoji null when left blank, to be assigned at random by the caller', () => {
    const result = validateIngredientInput({ ...validValues, emoji: '  ' });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.emoji).toBeNull();
    }
  });

  it('rejects a value that is not a single emoji', () => {
    const result = validateIngredientInput({ ...validValues, emoji: 'abc' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.emoji).toBeDefined();
    }
  });

  it('leaves subcategory null when left blank — it stays optional (cf. issue #67)', () => {
    const result = validateIngredientInput({ ...validValues, subcategory: '  ' });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.subcategory).toBeNull();
    }
  });

  it('accepts every subcategory option of the chosen category', () => {
    for (const category of Object.keys(SUBCATEGORY_OPTIONS) as (keyof typeof SUBCATEGORY_OPTIONS)[]) {
      for (const option of SUBCATEGORY_OPTIONS[category]) {
        const result = validateIngredientInput({ ...validValues, category, subcategory: option.value });
        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.data.subcategory).toBe(option.value);
        }
      }
    }
  });

  it('rejects a subcategory that does not belong to the chosen category', () => {
    const result = validateIngredientInput({
      ...validValues,
      category: 'EPICERIE',
      subcategory: 'FRUITS_LEGUMES',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.subcategory).toBeDefined();
    }
  });

  it('rejects an unknown subcategory value', () => {
    const result = validateIngredientInput({ ...validValues, subcategory: 'JOUETS_DIVERS' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.subcategory).toBeDefined();
    }
  });

  it('reports every invalid field at once', () => {
    const result = validateIngredientInput({
      name: '',
      category: '',
      subcategory: '',
      defaultUnit: '',
      conservation: '',
      defaultSource: '',
      isPrivate: false,
      emoji: '',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.errors).sort()).toEqual(
        ['category', 'conservation', 'defaultSource', 'defaultUnit', 'name'].sort(),
      );
    }
  });
});