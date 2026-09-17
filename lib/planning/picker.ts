import type { Recipe, RecipeIngredient } from '@prisma/client';
import { rankRecipes, type RecipeWithIngredients, type StockWithIngredient } from '@/lib/suggestions/score';
import { toSuggestionViewModel, type SuggestionViewModel } from '@/lib/suggestions/mapping';

/**
 * Classe les recettes du foyer pour le sélecteur d'un créneau de planning, en
 * réutilisant le moteur de suggestion existant (couverture stock + bonus
 * péremption proche + saison) : un ingrédient qui périme bientôt fait remonter
 * la recette en tête, exactement comme sur l'écran Suggestions.
 */
export function rankRecipesForSlot(
  recipes: RecipeWithIngredients[],
  stockEntries: StockWithIngredient[],
  now: Date = new Date(),
): SuggestionViewModel[] {
  const ranked = rankRecipes(recipes, stockEntries, { now });
  const recipeById = new Map<string, Recipe & { ingredients: RecipeIngredient[] }>(
    recipes.map((recipe) => [recipe.id, recipe]),
  );

  return ranked
    .map((suggestion) => {
      const recipe = recipeById.get(suggestion.recipeId);
      if (!recipe) return null;
      return toSuggestionViewModel(recipe, suggestion);
    })
    .filter((viewModel): viewModel is SuggestionViewModel => viewModel !== null);
}
