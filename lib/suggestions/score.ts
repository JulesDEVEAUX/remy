import { ConservationDuree, Saison, type Ingredient, type Recipe, type RecipeIngredient, type Stock } from '@prisma/client';
import { getCurrentSeason } from './season';

// Poids de score : non spécifiés au PRD, valeurs par défaut retenues faute de mieux
// (couverture du stock = poids le plus fort, comme demandé) — voir docs/CONTEXT.md,
// Risques et décisions ouvertes, à affiner à l'usage.
const COVERAGE_WEIGHT = 60;
const EXPIRING_SOON_BONUS = 25;
const SEASON_BONUS = 15;
const TAG_BOOST_PER_TAG = 10;

// Un stock est considéré "à utiliser bientôt" s'il périme dans ce délai, même pour
// un ingrédient à conservation moyenne/longue dont la date réelle approche.
const EXPIRING_SOON_DAYS = 5;

export type RecipeWithIngredients = Recipe & { ingredients: RecipeIngredient[] };
export type StockWithIngredient = Stock & { ingredient: Ingredient };

export type SuggestionReason = 'couverture-totale' | 'saison' | 'peremption-proche';

export type RecipeSuggestion = {
  recipeId: string;
  score: number;
  coverageRatio: number;
  isFullyCovered: boolean;
  isInSeason: boolean;
  hasExpiringSoonIngredient: boolean;
  matchedTags: string[];
  reasons: SuggestionReason[];
};

export type ScoreOptions = {
  /** Instant de référence pour la péremption et la saison — défaut : maintenant. */
  now?: Date;
  /** Tags sélectionnés dans le filtre : boostent le score au lieu de filtrer en dur. */
  boostedTags?: ReadonlySet<string>;
};

function isExpiringSoon(stockEntry: StockWithIngredient, now: Date): boolean {
  if (stockEntry.ingredient.conservation === ConservationDuree.COURTE) {
    return true;
  }
  if (!stockEntry.expiresAt) {
    return false;
  }
  const diffDays = Math.ceil((stockEntry.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays <= EXPIRING_SOON_DAYS;
}

function isSeasonMatch(recipe: Recipe, currentSeason: Saison): boolean {
  return recipe.seasons.includes(currentSeason) || recipe.seasons.includes(Saison.TOUTE_ANNEE);
}

/** Regroupe les entrées de stock par ingrédient, pour un lookup en O(1) lors du scoring. */
export function groupStockByIngredientId(stockEntries: StockWithIngredient[]): Map<string, StockWithIngredient[]> {
  const map = new Map<string, StockWithIngredient[]>();
  for (const entry of stockEntries) {
    const entries = map.get(entry.ingredientId) ?? [];
    entries.push(entry);
    map.set(entry.ingredientId, entries);
  }
  return map;
}

/**
 * Calcule le score de suggestion d'une recette pour un foyer donné.
 * Le taux de couverture du stock pèse le plus (poids demandé), avec des bonus
 * pour un ingrédient à utiliser bientôt et pour l'accord de saison.
 */
export function scoreRecipe(
  recipe: RecipeWithIngredients,
  stockByIngredientId: Map<string, StockWithIngredient[]>,
  options: ScoreOptions = {},
): RecipeSuggestion {
  const now = options.now ?? new Date();
  const boostedTags = options.boostedTags ?? new Set<string>();

  const totalIngredients = recipe.ingredients.length;
  let coveredCount = 0;
  let hasExpiringSoonIngredient = false;

  for (const recipeIngredient of recipe.ingredients) {
    const stockEntries = stockByIngredientId.get(recipeIngredient.ingredientId) ?? [];
    const inStockEntries = stockEntries.filter((entry) => entry.quantity > 0);

    if (inStockEntries.length > 0) {
      coveredCount += 1;
    }
    if (inStockEntries.some((entry) => isExpiringSoon(entry, now))) {
      hasExpiringSoonIngredient = true;
    }
  }

  const coverageRatio = totalIngredients === 0 ? 0 : coveredCount / totalIngredients;
  const isFullyCovered = totalIngredients > 0 && coveredCount === totalIngredients;
  const isInSeason = isSeasonMatch(recipe, getCurrentSeason(now));
  const matchedTags = recipe.tags.filter((tag) => boostedTags.has(tag));

  const score =
    coverageRatio * COVERAGE_WEIGHT +
    (hasExpiringSoonIngredient ? EXPIRING_SOON_BONUS : 0) +
    (isInSeason ? SEASON_BONUS : 0) +
    matchedTags.length * TAG_BOOST_PER_TAG;

  const reasons: SuggestionReason[] = [];
  if (isFullyCovered) reasons.push('couverture-totale');
  if (isInSeason) reasons.push('saison');
  if (hasExpiringSoonIngredient) reasons.push('peremption-proche');

  return {
    recipeId: recipe.id,
    score,
    coverageRatio,
    isFullyCovered,
    isInSeason,
    hasExpiringSoonIngredient,
    matchedTags,
    reasons,
  };
}

/** Score puis trie toutes les recettes du foyer, la plus pertinente en tête. */
export function rankRecipes(
  recipes: RecipeWithIngredients[],
  stockEntries: StockWithIngredient[],
  options: ScoreOptions = {},
): RecipeSuggestion[] {
  const stockByIngredientId = groupStockByIngredientId(stockEntries);
  return recipes
    .map((recipe) => scoreRecipe(recipe, stockByIngredientId, options))
    .sort((a, b) => b.score - a.score);
}
