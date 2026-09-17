import {
  ConservationDuree,
  IngredientCategory,
  Saison,
  SourceAchat,
  type Ingredient,
  type Recipe,
  type RecipeIngredient,
  type Stock,
} from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { groupStockByIngredientId, rankRecipes, scoreRecipe, type StockWithIngredient } from '@/lib/suggestions/score';

const NOW = new Date(2026, 0, 5); // 5 janvier 2026 -> HIVER

function makeIngredient(overrides: Partial<Ingredient> = {}): Ingredient {
  return {
    id: 'ing_1',
    householdId: 'household_1',
    name: 'Carottes',
    category: IngredientCategory.FRAIS,
    defaultUnit: 'g',
    conservation: ConservationDuree.LONGUE,
    defaultSource: SourceAchat.MARCHE,
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
    expiresAt: null,
    createdAt: new Date(2026, 0, 1),
    updatedAt: new Date(2026, 0, 1),
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

function makeRecipe(overrides: Partial<Recipe> = {}, ingredients: RecipeIngredient[] = [makeRecipeIngredient()]) {
  const recipe: Recipe = {
    id: 'recipe_1',
    householdId: 'household_1',
    name: 'Curry de lentilles',
    sourceUrl: null,
    instructions: 'Faire revenir puis mijoter.',
    prepMinutes: 25,
    seasons: [],
    tags: [],
    personalNote: null,
    lastMadeAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
  return { ...recipe, ingredients };
}

describe('scoreRecipe — couverture du stock', () => {
  it('note à 1 le taux de couverture quand tous les ingrédients sont en stock', () => {
    const recipe = makeRecipe({}, [
      makeRecipeIngredient({ id: 'ri_1', ingredientId: 'ing_1' }),
      makeRecipeIngredient({ id: 'ri_2', ingredientId: 'ing_2' }),
    ]);
    const stock = groupStockByIngredientId([
      makeStock({ ingredientId: 'ing_1' }),
      makeStock({ id: 'stock_2', ingredientId: 'ing_2' }),
    ]);

    const suggestion = scoreRecipe(recipe, stock, { now: NOW });

    expect(suggestion.coverageRatio).toBe(1);
    expect(suggestion.isFullyCovered).toBe(true);
    expect(suggestion.reasons).toContain('couverture-totale');
  });

  it('calcule un taux de couverture partiel quand seuls certains ingrédients sont en stock', () => {
    const recipe = makeRecipe({}, [
      makeRecipeIngredient({ id: 'ri_1', ingredientId: 'ing_1' }),
      makeRecipeIngredient({ id: 'ri_2', ingredientId: 'ing_2' }),
    ]);
    const stock = groupStockByIngredientId([makeStock({ ingredientId: 'ing_1' })]);

    const suggestion = scoreRecipe(recipe, stock, { now: NOW });

    expect(suggestion.coverageRatio).toBe(0.5);
    expect(suggestion.isFullyCovered).toBe(false);
    expect(suggestion.reasons).not.toContain('couverture-totale');
  });

  it("ignore une entrée de stock à quantité nulle : l'ingrédient n'est pas couvert", () => {
    const recipe = makeRecipe({}, [makeRecipeIngredient({ ingredientId: 'ing_1' })]);
    const stock = groupStockByIngredientId([makeStock({ ingredientId: 'ing_1', quantity: 0 })]);

    const suggestion = scoreRecipe(recipe, stock, { now: NOW });

    expect(suggestion.coverageRatio).toBe(0);
  });

  it('ne couvre jamais un ingrédient absent du stock', () => {
    const recipe = makeRecipe({}, [makeRecipeIngredient({ ingredientId: 'ing_1' })]);
    const suggestion = scoreRecipe(recipe, groupStockByIngredientId([]), { now: NOW });

    expect(suggestion.coverageRatio).toBe(0);
    expect(suggestion.isFullyCovered).toBe(false);
  });

  it('ne considère pas une recette sans ingrédient comme entièrement couverte', () => {
    const recipe = makeRecipe({}, []);
    const suggestion = scoreRecipe(recipe, groupStockByIngredientId([]), { now: NOW });

    expect(suggestion.coverageRatio).toBe(0);
    expect(suggestion.isFullyCovered).toBe(false);
  });

  it('pèse la couverture comme composante principale du score (poids 60)', () => {
    const recipe = makeRecipe({}, [makeRecipeIngredient({ ingredientId: 'ing_1' })]);
    const stock = groupStockByIngredientId([makeStock({ ingredientId: 'ing_1' })]);

    const suggestion = scoreRecipe(recipe, stock, { now: NOW });

    expect(suggestion.score).toBe(60);
  });
});

describe('scoreRecipe — bonus péremption', () => {
  it('déclenche le bonus pour un ingrédient à conservation courte, même sans date de péremption', () => {
    const recipe = makeRecipe({}, [makeRecipeIngredient({ ingredientId: 'ing_1' })]);
    const stock = groupStockByIngredientId([
      makeStock({ ingredientId: 'ing_1', expiresAt: null, ingredient: makeIngredient({ conservation: ConservationDuree.COURTE }) }),
    ]);

    const suggestion = scoreRecipe(recipe, stock, { now: NOW });

    expect(suggestion.hasExpiringSoonIngredient).toBe(true);
    expect(suggestion.reasons).toContain('peremption-proche');
  });

  it('déclenche le bonus pour une date de péremption proche, même en conservation longue', () => {
    const recipe = makeRecipe({}, [makeRecipeIngredient({ ingredientId: 'ing_1' })]);
    const stock = groupStockByIngredientId([
      makeStock({
        ingredientId: 'ing_1',
        expiresAt: new Date(2026, 0, 8),
        ingredient: makeIngredient({ conservation: ConservationDuree.LONGUE }),
      }),
    ]);

    const suggestion = scoreRecipe(recipe, stock, { now: NOW });

    expect(suggestion.hasExpiringSoonIngredient).toBe(true);
  });

  it('ne déclenche pas le bonus pour une date de péremption lointaine en conservation longue', () => {
    const recipe = makeRecipe({}, [makeRecipeIngredient({ ingredientId: 'ing_1' })]);
    const stock = groupStockByIngredientId([
      makeStock({
        ingredientId: 'ing_1',
        expiresAt: new Date(2026, 5, 1),
        ingredient: makeIngredient({ conservation: ConservationDuree.LONGUE }),
      }),
    ]);

    const suggestion = scoreRecipe(recipe, stock, { now: NOW });

    expect(suggestion.hasExpiringSoonIngredient).toBe(false);
    expect(suggestion.reasons).not.toContain('peremption-proche');
  });

  it("ignore la péremption d'un ingrédient à quantité nulle", () => {
    const recipe = makeRecipe({}, [makeRecipeIngredient({ ingredientId: 'ing_1' })]);
    const stock = groupStockByIngredientId([
      makeStock({
        ingredientId: 'ing_1',
        quantity: 0,
        ingredient: makeIngredient({ conservation: ConservationDuree.COURTE }),
      }),
    ]);

    const suggestion = scoreRecipe(recipe, stock, { now: NOW });

    expect(suggestion.hasExpiringSoonIngredient).toBe(false);
  });

  it('ajoute 25 points au score quand le bonus péremption est déclenché', () => {
    const recipe = makeRecipe({}, [makeRecipeIngredient({ ingredientId: 'ing_1' })]);
    const stock = groupStockByIngredientId([
      makeStock({ ingredientId: 'ing_1', ingredient: makeIngredient({ conservation: ConservationDuree.COURTE }) }),
    ]);

    const suggestion = scoreRecipe(recipe, stock, { now: NOW });

    expect(suggestion.score).toBe(60 + 25);
  });
});

describe('scoreRecipe — bonus saison', () => {
  it('accorde le bonus quand la saison courante figure dans Recipe.seasons', () => {
    const recipe = makeRecipe({ seasons: [Saison.HIVER] }, []);
    const suggestion = scoreRecipe(recipe, groupStockByIngredientId([]), { now: NOW });

    expect(suggestion.isInSeason).toBe(true);
    expect(suggestion.reasons).toContain('saison');
    expect(suggestion.score).toBe(15);
  });

  it('accorde le bonus pour une recette marquée TOUTE_ANNEE quelle que soit la saison', () => {
    const recipe = makeRecipe({ seasons: [Saison.TOUTE_ANNEE] }, []);
    const suggestion = scoreRecipe(recipe, groupStockByIngredientId([]), { now: NOW });

    expect(suggestion.isInSeason).toBe(true);
  });

  it("n'accorde pas le bonus pour une saison qui ne correspond pas", () => {
    const recipe = makeRecipe({ seasons: [Saison.ETE] }, []);
    const suggestion = scoreRecipe(recipe, groupStockByIngredientId([]), { now: NOW });

    expect(suggestion.isInSeason).toBe(false);
    expect(suggestion.reasons).not.toContain('saison');
    expect(suggestion.score).toBe(0);
  });
});

describe('scoreRecipe — combinaison des bonus et filtre de tags', () => {
  it('additionne couverture, péremption et saison pour une recette qui cumule les trois', () => {
    const recipe = makeRecipe({ seasons: [Saison.HIVER] }, [makeRecipeIngredient({ ingredientId: 'ing_1' })]);
    const stock = groupStockByIngredientId([
      makeStock({ ingredientId: 'ing_1', ingredient: makeIngredient({ conservation: ConservationDuree.COURTE }) }),
    ]);

    const suggestion = scoreRecipe(recipe, stock, { now: NOW });

    expect(suggestion.score).toBe(60 + 25 + 15);
    expect(suggestion.reasons).toEqual(
      expect.arrayContaining(['couverture-totale', 'saison', 'peremption-proche']),
    );
  });

  it('booste le score de 10 points par tag sélectionné qui correspond à la recette', () => {
    const recipe = makeRecipe({ tags: ['rapide', 'végétarien'] }, []);

    const noBoost = scoreRecipe(recipe, groupStockByIngredientId([]), { now: NOW });
    const oneTagBoost = scoreRecipe(recipe, groupStockByIngredientId([]), {
      now: NOW,
      boostedTags: new Set(['rapide']),
    });
    const twoTagsBoost = scoreRecipe(recipe, groupStockByIngredientId([]), {
      now: NOW,
      boostedTags: new Set(['rapide', 'végétarien']),
    });

    expect(noBoost.score).toBe(0);
    expect(oneTagBoost.score).toBe(10);
    expect(twoTagsBoost.score).toBe(20);
    expect(twoTagsBoost.matchedTags).toEqual(['rapide', 'végétarien']);
  });

  it("n'applique aucun boost pour un tag sélectionné que la recette ne porte pas", () => {
    const recipe = makeRecipe({ tags: ['rapide'] }, []);
    const suggestion = scoreRecipe(recipe, groupStockByIngredientId([]), {
      now: NOW,
      boostedTags: new Set(['végétarien']),
    });

    expect(suggestion.score).toBe(0);
    expect(suggestion.matchedTags).toEqual([]);
  });
});

describe('rankRecipes', () => {
  it('trie les recettes par score décroissant', () => {
    const lowScore = makeRecipe({ id: 'recipe_low', seasons: [] }, []);
    const highScore = makeRecipe({ id: 'recipe_high', seasons: [Saison.HIVER] }, [
      makeRecipeIngredient({ ingredientId: 'ing_1' }),
    ]);
    const stock: StockWithIngredient[] = [makeStock({ ingredientId: 'ing_1' })];

    const ranked = rankRecipes([lowScore, highScore], stock, { now: NOW });

    expect(ranked.map((suggestion) => suggestion.recipeId)).toEqual(['recipe_high', 'recipe_low']);
  });
});
