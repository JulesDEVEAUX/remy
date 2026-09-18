import { IngredientCategory } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { isValidSubcategory, SUBCATEGORY_OPTIONS, subcategoryLabel } from '@/lib/ingredients/subcategories';

describe('SUBCATEGORY_OPTIONS', () => {
  it('covers every IngredientCategory, AUTRE excepted (no detail needed)', () => {
    for (const category of Object.values(IngredientCategory)) {
      expect(SUBCATEGORY_OPTIONS[category]).toBeDefined();
      if (category !== IngredientCategory.AUTRE) {
        expect(SUBCATEGORY_OPTIONS[category].length).toBeGreaterThan(0);
      }
    }
  });

  it('uses globally unique values across every category', () => {
    const values = Object.values(SUBCATEGORY_OPTIONS).flat().map((option) => option.value);
    expect(new Set(values).size).toBe(values.length);
  });
});

describe('isValidSubcategory', () => {
  it('accepts a subcategory that belongs to its category', () => {
    expect(isValidSubcategory(IngredientCategory.FRAIS, 'FRUITS_LEGUMES')).toBe(true);
  });

  it('rejects a subcategory that belongs to a different category', () => {
    expect(isValidSubcategory(IngredientCategory.EPICERIE, 'FRUITS_LEGUMES')).toBe(false);
  });

  it('rejects an unknown value', () => {
    expect(isValidSubcategory(IngredientCategory.FRAIS, 'JOUETS')).toBe(false);
  });
});

describe('subcategoryLabel', () => {
  it('returns the French label for a known value', () => {
    expect(subcategoryLabel('FRUITS_LEGUMES')).toBe('Fruits et légumes');
  });

  it('returns undefined for an unknown value', () => {
    expect(subcategoryLabel('INCONNU')).toBeUndefined();
  });
});