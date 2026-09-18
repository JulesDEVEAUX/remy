import { Saison, type Recipe, type RecipeIngredient } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { extractAvailableTags, toSuggestionViewModel } from '@/lib/suggestions/mapping';
import type { RecipeSuggestion } from '@/lib/suggestions/score';

function makeRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: 'recipe_1',
    householdId: 'household_1',
    name: 'Curry de lentilles',
    sourceUrl: null,
    instructions: 'Faire revenir puis mijoter.',
    prepMinutes: 25,
    seasons: [Saison.HIVER],
    tags: ['rapide'],
    personalNote: null,
    lastMadeAt: null,
    isPrivate: false,
    emoji: '🍛',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeSuggestion(overrides: Partial<RecipeSuggestion> = {}): RecipeSuggestion {
  return {
    recipeId: 'recipe_1',
    score: 75,
    coverageRatio: 0.5,
    isFullyCovered: false,
    isInSeason: false,
    hasExpiringSoonIngredient: false,
    matchedTags: [],
    reasons: [],
    ...overrides,
  };
}

describe('toSuggestionViewModel', () => {
  it('arrondit le taux de couverture en pourcentage lisible', () => {
    const viewModel = toSuggestionViewModel(
      { ...makeRecipe(), ingredients: [] as RecipeIngredient[] },
      makeSuggestion({ coverageRatio: 2 / 3 }),
    );
    expect(viewModel.coveragePercentLabel).toBe('67%');
  });

  it('traduit chaque raison en un badge au ton attendu par la charte couleur', () => {
    const viewModel = toSuggestionViewModel(
      { ...makeRecipe(), ingredients: [] as RecipeIngredient[] },
      makeSuggestion({ reasons: ['couverture-totale', 'saison', 'peremption-proche'] }),
    );

    expect(viewModel.badges).toEqual([
      { label: '100% en stock', tone: 'stock' },
      { label: 'De saison', tone: 'saison' },
      { label: 'À utiliser bientôt', tone: 'alerte' },
    ]);
  });

  it("ne produit aucun badge quand la suggestion n'a aucune raison associée", () => {
    const viewModel = toSuggestionViewModel(
      { ...makeRecipe(), ingredients: [] as RecipeIngredient[] },
      makeSuggestion({ reasons: [] }),
    );
    expect(viewModel.badges).toEqual([]);
  });
});

describe('extractAvailableTags', () => {
  it('déduplique et trie les tags de plusieurs recettes', () => {
    const tags = extractAvailableTags([{ tags: ['rapide', 'été'] }, { tags: ['végétarien', 'rapide'] }]);
    expect(tags).toEqual(['été', 'rapide', 'végétarien']);
  });

  it('renvoie un tableau vide sans recette', () => {
    expect(extractAvailableTags([])).toEqual([]);
  });
});
