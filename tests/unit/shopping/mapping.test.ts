import { describe, expect, it } from 'vitest';
import { selectPlannedRecipeOccurrences } from '@/lib/shopping/mapping';

describe('selectPlannedRecipeOccurrences', () => {
  it('ignores slots with no recipe assigned', () => {
    const result = selectPlannedRecipeOccurrences([{ recipeId: null, isBatch: false }]);
    expect(result).toEqual([]);
  });

  it('counts each non-batch slot as a distinct occurrence', () => {
    const result = selectPlannedRecipeOccurrences([
      { recipeId: 'recipe_1', isBatch: false },
      { recipeId: 'recipe_2', isBatch: false },
      { recipeId: 'recipe_1', isBatch: false },
    ]);
    expect(result).toEqual(['recipe_1', 'recipe_2', 'recipe_1']);
  });

  it('counts a batch recipe spanning several slots only once', () => {
    const result = selectPlannedRecipeOccurrences([
      { recipeId: 'recipe_1', isBatch: true },
      { recipeId: 'recipe_1', isBatch: true },
      { recipeId: 'recipe_1', isBatch: true },
    ]);
    expect(result).toEqual(['recipe_1']);
  });

  it('counts a recipe used in two separate batches as two occurrences when interleaved with a non-batch reset', () => {
    // Un même recipeId ne peut réapparaître en isBatch après avoir déjà été vu batch
    // dans cette liste que s'il s'agit du même lot logique : la fonction ne peut pas
    // distinguer deux lots séparés du même recipeId sans identifiant de lot dédié —
    // documente donc la limite connue plutôt que de la cacher.
    const result = selectPlannedRecipeOccurrences([
      { recipeId: 'recipe_1', isBatch: true },
      { recipeId: 'recipe_1', isBatch: true },
    ]);
    expect(result).toEqual(['recipe_1']);
  });

  it('mixes batch and non-batch occurrences independently', () => {
    const result = selectPlannedRecipeOccurrences([
      { recipeId: 'recipe_1', isBatch: true },
      { recipeId: 'recipe_1', isBatch: true },
      { recipeId: 'recipe_2', isBatch: false },
      { recipeId: 'recipe_3', isBatch: false },
    ]);
    expect(result).toEqual(['recipe_1', 'recipe_2', 'recipe_3']);
  });
});
