import { describe, expect, it } from 'vitest';
import {
  validatePersonalNote,
  validateRecipeComment,
  validateRecipeInput,
  type RecipeFormValues,
} from '@/lib/recipes/validation';

const validIngredientIds = new Set(['ing_1', 'ing_2']);

const validValues: RecipeFormValues = {
  name: 'Curry de lentilles',
  sourceUrl: 'https://example.com/recette',
  instructions: 'Faire revenir les oignons puis ajouter les lentilles.',
  prepMinutes: '25',
  seasons: ['HIVER'],
  tags: 'rapide, végétarien',
  ingredientRows: [{ ingredientId: 'ing_1', quantity: '200', unit: 'g' }],
  isPrivate: false,
  emoji: '🍛',
};

describe('validateRecipeInput', () => {
  it('accepts fully valid values and normalizes fields', () => {
    const result = validateRecipeInput(
      { ...validValues, name: '  Curry de lentilles  ' },
      validIngredientIds,
    );

    expect(result).toEqual({
      ok: true,
      data: {
        name: 'Curry de lentilles',
        sourceUrl: 'https://example.com/recette',
        instructions: 'Faire revenir les oignons puis ajouter les lentilles.',
        prepMinutes: 25,
        seasons: ['HIVER'],
        tags: ['rapide', 'végétarien'],
        ingredients: [{ ingredientId: 'ing_1', quantity: 200, unit: 'g' }],
        isPrivate: false,
        emoji: '🍛',
      },
    });
  });

  it('carries a checked isPrivate through unchanged', () => {
    const result = validateRecipeInput({ ...validValues, isPrivate: true }, validIngredientIds);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.isPrivate).toBe(true);
    }
  });

  it('accepts optional fields left empty', () => {
    const result = validateRecipeInput(
      { ...validValues, sourceUrl: '', prepMinutes: '', seasons: [], tags: '', emoji: '' },
      validIngredientIds,
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.sourceUrl).toBeNull();
      expect(result.data.prepMinutes).toBeNull();
      expect(result.data.seasons).toEqual([]);
      expect(result.data.tags).toEqual([]);
      expect(result.data.emoji).toBeNull();
    }
  });

  it('rejects a value that is not a single emoji', () => {
    const result = validateRecipeInput({ ...validValues, emoji: 'pas un emoji' }, validIngredientIds);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.emoji).toBeDefined();
    }
  });

  it('rejects an empty name', () => {
    const result = validateRecipeInput({ ...validValues, name: '   ' }, validIngredientIds);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.name).toBeDefined();
    }
  });

  it('rejects a name longer than 120 characters', () => {
    const result = validateRecipeInput({ ...validValues, name: 'a'.repeat(121) }, validIngredientIds);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.name).toBeDefined();
    }
  });

  it('rejects an invalid source url', () => {
    const result = validateRecipeInput({ ...validValues, sourceUrl: 'pas une url' }, validIngredientIds);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.sourceUrl).toBeDefined();
    }
  });

  it('rejects empty instructions', () => {
    const result = validateRecipeInput({ ...validValues, instructions: '   ' }, validIngredientIds);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.instructions).toBeDefined();
    }
  });

  it('rejects a non-integer or negative prep time', () => {
    const negative = validateRecipeInput({ ...validValues, prepMinutes: '-5' }, validIngredientIds);
    expect(negative.ok).toBe(false);

    const decimal = validateRecipeInput({ ...validValues, prepMinutes: '12.5' }, validIngredientIds);
    expect(decimal.ok).toBe(false);

    const notANumber = validateRecipeInput({ ...validValues, prepMinutes: 'vite' }, validIngredientIds);
    expect(notANumber.ok).toBe(false);
  });

  it('rejects an unknown season', () => {
    const result = validateRecipeInput({ ...validValues, seasons: ['MOUSSON'] }, validIngredientIds);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.seasons).toBeDefined();
    }
  });

  it('deduplicates and trims tags', () => {
    const result = validateRecipeInput(
      { ...validValues, tags: ' rapide , rapide,  végétarien ' },
      validIngredientIds,
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.tags).toEqual(['rapide', 'végétarien']);
    }
  });

  it('rejects a tag longer than 30 characters', () => {
    const result = validateRecipeInput({ ...validValues, tags: 'a'.repeat(31) }, validIngredientIds);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.tags).toBeDefined();
    }
  });

  it('requires at least one ingredient', () => {
    const result = validateRecipeInput({ ...validValues, ingredientRows: [] }, validIngredientIds);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.ingredients).toBeDefined();
    }
  });

  it('ignores fully blank ingredient rows', () => {
    const result = validateRecipeInput(
      { ...validValues, ingredientRows: [...validValues.ingredientRows, { ingredientId: '', quantity: '', unit: '' }] },
      validIngredientIds,
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.ingredients).toHaveLength(1);
    }
  });

  it('rejects an ingredient id outside the household catalog', () => {
    const result = validateRecipeInput(
      { ...validValues, ingredientRows: [{ ingredientId: 'ing_ailleurs', quantity: '1', unit: 'g' }] },
      validIngredientIds,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.ingredients).toBeDefined();
    }
  });

  it('rejects a quantity that is zero or negative', () => {
    const zero = validateRecipeInput(
      { ...validValues, ingredientRows: [{ ingredientId: 'ing_1', quantity: '0', unit: 'g' }] },
      validIngredientIds,
    );
    expect(zero.ok).toBe(false);

    const negative = validateRecipeInput(
      { ...validValues, ingredientRows: [{ ingredientId: 'ing_1', quantity: '-3', unit: 'g' }] },
      validIngredientIds,
    );
    expect(negative.ok).toBe(false);
  });

  it('rejects a row missing its unit', () => {
    const result = validateRecipeInput(
      { ...validValues, ingredientRows: [{ ingredientId: 'ing_1', quantity: '1', unit: '' }] },
      validIngredientIds,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.ingredients).toBeDefined();
    }
  });

  it('rejects the same ingredient used twice', () => {
    const result = validateRecipeInput(
      {
        ...validValues,
        ingredientRows: [
          { ingredientId: 'ing_1', quantity: '100', unit: 'g' },
          { ingredientId: 'ing_1', quantity: '50', unit: 'g' },
        ],
      },
      validIngredientIds,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.ingredients).toBeDefined();
    }
  });

  it('accepts several distinct ingredients', () => {
    const result = validateRecipeInput(
      {
        ...validValues,
        ingredientRows: [
          { ingredientId: 'ing_1', quantity: '100', unit: 'g' },
          { ingredientId: 'ing_2', quantity: '2', unit: 'pièce' },
        ],
      },
      validIngredientIds,
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.ingredients).toHaveLength(2);
    }
  });
});

describe('validateRecipeComment', () => {
  it('rejects an empty comment', () => {
    expect(validateRecipeComment('   ')).toEqual({ ok: false, error: expect.any(String) });
  });

  it('trims a valid comment', () => {
    expect(validateRecipeComment('  Un délice, à refaire.  ')).toEqual({
      ok: true,
      body: 'Un délice, à refaire.',
    });
  });

  it('rejects a comment longer than 1000 characters', () => {
    const result = validateRecipeComment('a'.repeat(1001));
    expect(result.ok).toBe(false);
  });
});

describe('validatePersonalNote', () => {
  it('accepts an empty note and normalizes it to null', () => {
    expect(validatePersonalNote('   ')).toEqual({ ok: true, note: null });
  });

  it('trims a valid note', () => {
    expect(validatePersonalNote('  Moins de cumin la prochaine fois.  ')).toEqual({
      ok: true,
      note: 'Moins de cumin la prochaine fois.',
    });
  });

  it('rejects a note longer than 2000 characters', () => {
    const result = validatePersonalNote('a'.repeat(2001));
    expect(result.ok).toBe(false);
  });
});
