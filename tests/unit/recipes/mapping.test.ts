import { Saison, type Recipe, type RecipeIngredient } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { parseRecipeFormData, toRecipeFormValues, toRecipeViewModel } from '@/lib/recipes/mapping';

function makeRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: 'recipe_1',
    householdId: 'household_1',
    name: 'Curry de lentilles',
    sourceUrl: null,
    instructions: 'Faire revenir puis mijoter.',
    prepMinutes: 25,
    seasons: [Saison.HIVER],
    tags: ['rapide', 'végétarien'],
    personalNote: null,
    lastMadeAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeRecipeIngredient(overrides: Partial<RecipeIngredient> = {}): RecipeIngredient {
  return {
    id: 'ri_1',
    recipeId: 'recipe_1',
    ingredientId: 'ing_1',
    quantity: 200,
    unit: 'g',
    ...overrides,
  };
}

describe('parseRecipeFormData', () => {
  it('extracts scalar fields and parallel ingredient row arrays', () => {
    const formData = new FormData();
    formData.set('name', 'Curry de lentilles');
    formData.set('sourceUrl', 'https://example.com');
    formData.set('instructions', 'Faire revenir puis mijoter.');
    formData.set('prepMinutes', '25');
    formData.append('seasons', 'HIVER');
    formData.append('seasons', 'ETE');
    formData.set('tags', 'rapide, végétarien');
    formData.append('ingredientId[]', 'ing_1');
    formData.append('quantity[]', '200');
    formData.append('unit[]', 'g');
    formData.append('ingredientId[]', 'ing_2');
    formData.append('quantity[]', '2');
    formData.append('unit[]', 'pièce');

    expect(parseRecipeFormData(formData)).toEqual({
      name: 'Curry de lentilles',
      sourceUrl: 'https://example.com',
      instructions: 'Faire revenir puis mijoter.',
      prepMinutes: '25',
      seasons: ['HIVER', 'ETE'],
      tags: 'rapide, végétarien',
      ingredientRows: [
        { ingredientId: 'ing_1', quantity: '200', unit: 'g' },
        { ingredientId: 'ing_2', quantity: '2', unit: 'pièce' },
      ],
    });
  });

  it('defaults missing fields to empty strings and arrays instead of throwing', () => {
    expect(parseRecipeFormData(new FormData())).toEqual({
      name: '',
      sourceUrl: '',
      instructions: '',
      prepMinutes: '',
      seasons: [],
      tags: '',
      ingredientRows: [],
    });
  });
});

describe('toRecipeViewModel', () => {
  it('formats the prep time label when set, and omits it otherwise', () => {
    const withPrep = toRecipeViewModel({ ...makeRecipe({ prepMinutes: 25 }), ingredients: [] });
    expect(withPrep.prepMinutesLabel).toBe('25 min');

    const withoutPrep = toRecipeViewModel({ ...makeRecipe({ prepMinutes: null }), ingredients: [] });
    expect(withoutPrep.prepMinutesLabel).toBeNull();
  });

  it('produces a French label for every season', () => {
    for (const season of Object.values(Saison)) {
      const viewModel = toRecipeViewModel({ ...makeRecipe({ seasons: [season] }), ingredients: [] });
      expect(viewModel.seasonLabels[0]?.length).toBeGreaterThan(0);
    }
  });

  it('counts the recipe ingredients', () => {
    const viewModel = toRecipeViewModel({
      ...makeRecipe(),
      ingredients: [makeRecipeIngredient(), makeRecipeIngredient({ id: 'ri_2', ingredientId: 'ing_2' })],
    });
    expect(viewModel.ingredientCount).toBe(2);
  });

  it('passes tags through unchanged', () => {
    const viewModel = toRecipeViewModel({ ...makeRecipe({ tags: ['rapide'] }), ingredients: [] });
    expect(viewModel.tags).toEqual(['rapide']);
  });

  it('reports the last-made state as a relative label', () => {
    const neverMade = toRecipeViewModel({ ...makeRecipe({ lastMadeAt: null }), ingredients: [] });
    expect(neverMade.lastMadeLabel).toBe('jamais réalisée');

    const madeToday = toRecipeViewModel({ ...makeRecipe({ lastMadeAt: new Date() }), ingredients: [] });
    expect(madeToday.lastMadeLabel).toBe("réalisée aujourd'hui");
  });
});

describe('toRecipeFormValues', () => {
  it('reconstructs editable form values from a persisted recipe', () => {
    const values = toRecipeFormValues({
      ...makeRecipe(),
      ingredients: [makeRecipeIngredient({ quantity: 200, unit: 'g' })],
    });

    expect(values).toEqual({
      name: 'Curry de lentilles',
      sourceUrl: '',
      instructions: 'Faire revenir puis mijoter.',
      prepMinutes: '25',
      seasons: ['HIVER'],
      tags: 'rapide, végétarien',
      ingredientRows: [{ ingredientId: 'ing_1', quantity: '200', unit: 'g' }],
    });
  });

  it('renders a null source url and prep time as empty strings', () => {
    const values = toRecipeFormValues({
      ...makeRecipe({ sourceUrl: null, prepMinutes: null }),
      ingredients: [],
    });
    expect(values.sourceUrl).toBe('');
    expect(values.prepMinutes).toBe('');
  });
});
