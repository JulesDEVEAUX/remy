import { describe, expect, it } from 'vitest';
import { ingredientCatalogWhere } from '@/lib/ingredients/catalog';

describe('ingredientCatalogWhere', () => {
  it('matches the household own ingredients regardless of isPrivate, plus any public ingredient', () => {
    expect(ingredientCatalogWhere('household_1')).toEqual({
      OR: [{ householdId: 'household_1' }, { isPrivate: false }],
    });
  });
});
