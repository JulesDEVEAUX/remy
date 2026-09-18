import { describe, expect, it } from 'vitest';
import { ingredientCatalogWhere } from '@/lib/ingredients/catalog';

describe('ingredientCatalogWhere', () => {
  it('matches the household own ingredients regardless of isPrivate, plus any public ingredient from a non-test household', () => {
    expect(ingredientCatalogWhere('household_1', false)).toEqual({
      OR: [{ householdId: 'household_1' }, { isPrivate: false, household: { isTestHousehold: false } }],
    });
  });

  it('lets a test household see public ingredients from any household, test or not', () => {
    expect(ingredientCatalogWhere('household_1', true)).toEqual({
      OR: [{ householdId: 'household_1' }, { isPrivate: false }],
    });
  });
});