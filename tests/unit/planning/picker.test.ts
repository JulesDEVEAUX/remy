import {
  ConservationDuree,
  IngredientCategory,
  SourceAchat,
  StockLocation,
  type Ingredient,
  type Recipe,
  type RecipeIngredient,
  type Stock,
} from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { rankRecipesForSlot } from '@/lib/planning/picker';
import type { StockWithIngredient } from '@/lib/suggestions/score';

const NOW = new Date(2026, 8, 21);

function makeIngredient(overrides: Partial<Ingredient> = {}): Ingredient {
  return {
    id: 'ing_1',
    householdId: 'household_1',
    name: 'Courgettes',
    category: IngredientCategory.FRAIS,
    defaultUnit: 'g',
    conservation: ConservationDuree.LONGUE,
    defaultSource: SourceAchat.MARCHE,
    isPrivate: false,
    emoji: '🥒',
    kcalPer100g: null,
    proteinPer100g: null,
    carbsPer100g: null,
    fatPer100g: null,
    fiberPer100g: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeStock(overrides: Partial<StockWithIngredient> = {}): StockWithIngredient {
  const base: Stock = {
    id: 'stock_1',
    householdId: 'household_1',
    ingredientId: 'ing_1',
    quantity: 500,
    unit: 'g',
    location: StockLocation.FRIGO,
    expiresAt: null,
    createdAt: new Date(2026, 8, 20),
    updatedAt: new Date(2026, 8, 20),
  };
  return { ...base, ingredient: makeIngredient(), ...overrides };
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

function makeRecipe(overrides: Partial<Recipe> = {}, ingredients: RecipeIngredient[]) {
  const recipe: Recipe = {
    id: 'recipe_1',
    householdId: 'household_1',
    name: 'Recette',
    sourceUrl: null,
    instructions: 'Préparer.',
    prepMinutes: 20,
    seasons: [],
    tags: [],
    personalNote: null,
    lastMadeAt: null,
    isPrivate: false,
    emoji: '🍽️',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
  return { ...recipe, ingredients };
}

describe('rankRecipesForSlot — priorisation péremption dans le sélecteur de créneau', () => {
  it("place en tête la recette dont un ingrédient périme bientôt, même entièrement couverte comme l'autre", () => {
    const urgentRecipe = makeRecipe({ id: 'recipe_urgent', name: 'Gratin de courgettes' }, [
      makeRecipeIngredient({ id: 'ri_urgent', recipeId: 'recipe_urgent', ingredientId: 'ing_urgent' }),
    ]);
    const laterRecipe = makeRecipe({ id: 'recipe_later', name: 'Riz cantonais' }, [
      makeRecipeIngredient({ id: 'ri_later', recipeId: 'recipe_later', ingredientId: 'ing_later' }),
    ]);

    const stockEntries: StockWithIngredient[] = [
      makeStock({
        id: 'stock_urgent',
        ingredientId: 'ing_urgent',
        expiresAt: new Date(2026, 8, 22),
        ingredient: makeIngredient({ id: 'ing_urgent', conservation: ConservationDuree.LONGUE }),
      }),
      makeStock({
        id: 'stock_later',
        ingredientId: 'ing_later',
        expiresAt: new Date(2027, 5, 1),
        ingredient: makeIngredient({ id: 'ing_later', conservation: ConservationDuree.LONGUE }),
      }),
    ];

    const ranked = rankRecipesForSlot([urgentRecipe, laterRecipe], stockEntries, NOW);

    expect(ranked.map((suggestion) => suggestion.id)).toEqual(['recipe_urgent', 'recipe_later']);
    expect(ranked[0].badges.map((badge) => badge.label)).toContain('À utiliser bientôt');
  });

  it('ne classe aucune recette dont les ingrédients ne sont pas en stock avant une recette couverte', () => {
    const covered = makeRecipe({ id: 'recipe_covered', name: 'Couverte' }, [
      makeRecipeIngredient({ id: 'ri_covered', recipeId: 'recipe_covered', ingredientId: 'ing_covered' }),
    ]);
    const uncovered = makeRecipe({ id: 'recipe_uncovered', name: 'Non couverte' }, [
      makeRecipeIngredient({ id: 'ri_uncovered', recipeId: 'recipe_uncovered', ingredientId: 'ing_missing' }),
    ]);
    const stockEntries: StockWithIngredient[] = [makeStock({ ingredientId: 'ing_covered' })];

    const ranked = rankRecipesForSlot([covered, uncovered], stockEntries, NOW);

    expect(ranked.map((suggestion) => suggestion.id)).toEqual(['recipe_covered', 'recipe_uncovered']);
  });

  it('renvoie une liste vide sans recette au catalogue', () => {
    expect(rankRecipesForSlot([], [], NOW)).toEqual([]);
  });
});
