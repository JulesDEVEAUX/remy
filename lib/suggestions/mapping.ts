import type { Recipe, RecipeIngredient } from '@prisma/client';
import { toRecipeViewModel, type RecipeViewModel } from '@/lib/recipes/mapping';
import type { RecipeSuggestion } from './score';

export type SuggestionBadge = { label: string; tone: 'stock' | 'saison' | 'alerte' | 'neutre' };

// Sémantique couleur imposée par l'identité visuelle : sauge = stock/validation/saison,
// terracotta = urgence de péremption (cf. docs/identite-visuelle.md, section 2).
const REASON_BADGES: Record<RecipeSuggestion['reasons'][number], SuggestionBadge> = {
  'couverture-totale': { label: '100% en stock', tone: 'stock' },
  saison: { label: 'De saison', tone: 'saison' },
  'peremption-proche': { label: 'À utiliser bientôt', tone: 'alerte' },
};

export type SuggestionViewModel = RecipeViewModel & {
  score: number;
  coveragePercentLabel: string;
  badges: SuggestionBadge[];
};

/** Convertit une recette notée en modèle d'affichage : libellés et badges de justification. */
export function toSuggestionViewModel(
  recipe: Recipe & { ingredients: RecipeIngredient[] },
  suggestion: RecipeSuggestion,
): SuggestionViewModel {
  return {
    ...toRecipeViewModel(recipe),
    score: suggestion.score,
    coveragePercentLabel: `${Math.round(suggestion.coverageRatio * 100)}%`,
    badges: suggestion.reasons.map((reason) => REASON_BADGES[reason]),
  };
}

/** Tags uniques disponibles pour le filtre, triés pour un affichage stable. */
export function extractAvailableTags(recipes: { tags: string[] }[]): string[] {
  return Array.from(new Set(recipes.flatMap((recipe) => recipe.tags))).sort((a, b) => a.localeCompare(b, 'fr'));
}
