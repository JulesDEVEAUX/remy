import { describe, expect, it } from 'vitest';
import { otherHouseholdsPublicRecipesWhere, recipeReadWhere } from '@/lib/recipes/catalog';

describe('otherHouseholdsPublicRecipesWhere', () => {
  it('matches public recipes of any household but this one and excludes test households, for a real household', () => {
    expect(otherHouseholdsPublicRecipesWhere('household_1', false)).toEqual({
      householdId: { not: 'household_1' },
      isPrivate: false,
      household: { isTestHousehold: false },
    });
  });

  it('lets a test household see public recipes from any household, test or not', () => {
    expect(otherHouseholdsPublicRecipesWhere('household_1', true)).toEqual({
      householdId: { not: 'household_1' },
      isPrivate: false,
    });
  });
});

describe('recipeReadWhere', () => {
  it('matches the given id, owned by this household or public from a non-test household', () => {
    expect(recipeReadWhere('recipe_1', 'household_1', false)).toEqual({
      id: 'recipe_1',
      OR: [{ householdId: 'household_1' }, { isPrivate: false, household: { isTestHousehold: false } }],
    });
  });

  it('lets a test household read a public recipe from any household, test or not', () => {
    expect(recipeReadWhere('recipe_1', 'household_1', true)).toEqual({
      id: 'recipe_1',
      OR: [{ householdId: 'household_1' }, { isPrivate: false }],
    });
  });
});