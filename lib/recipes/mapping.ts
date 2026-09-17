import type { Recipe, RecipeIngredient, Saison } from '@prisma/client';
import { formatLastMade } from './history';
import type { RecipeFormValues, RecipeIngredientRowInput } from './validation';

/** Extrait les champs bruts d'un <form> recette — aucune validation ici. */
export function parseRecipeFormData(formData: FormData): RecipeFormValues {
  const ingredientIds = formData.getAll('ingredientId[]').map(String);
  const quantities = formData.getAll('quantity[]').map(String);
  const units = formData.getAll('unit[]').map(String);

  const ingredientRows: RecipeIngredientRowInput[] = ingredientIds.map((ingredientId, index) => ({
    ingredientId,
    quantity: quantities[index] ?? '',
    unit: units[index] ?? '',
  }));

  return {
    name: String(formData.get('name') ?? ''),
    sourceUrl: String(formData.get('sourceUrl') ?? ''),
    instructions: String(formData.get('instructions') ?? ''),
    prepMinutes: String(formData.get('prepMinutes') ?? ''),
    seasons: formData.getAll('seasons').map(String),
    tags: String(formData.get('tags') ?? ''),
    ingredientRows,
  };
}

const SEASON_LABELS: Record<Saison, string> = {
  PRINTEMPS: 'Printemps',
  ETE: 'Été',
  AUTOMNE: 'Automne',
  HIVER: 'Hiver',
  TOUTE_ANNEE: "Toute l'année",
};

export type RecipeViewModel = {
  id: string;
  name: string;
  sourceUrl: string | null;
  prepMinutesLabel: string | null;
  seasonLabels: string[];
  tags: string[];
  ingredientCount: number;
  lastMadeLabel: string;
};

/** Convertit une Recipe Prisma (avec ses ingrédients) en modèle d'affichage. */
export function toRecipeViewModel(recipe: Recipe & { ingredients: RecipeIngredient[] }): RecipeViewModel {
  return {
    id: recipe.id,
    name: recipe.name,
    sourceUrl: recipe.sourceUrl,
    prepMinutesLabel: recipe.prepMinutes ? `${recipe.prepMinutes} min` : null,
    seasonLabels: recipe.seasons.map((season) => SEASON_LABELS[season]),
    tags: recipe.tags,
    ingredientCount: recipe.ingredients.length,
    lastMadeLabel: formatLastMade(recipe.lastMadeAt),
  };
}

/** Reconstruit les valeurs de formulaire à partir d'une Recipe existante (pré-remplissage édition). */
export function toRecipeFormValues(recipe: Recipe & { ingredients: RecipeIngredient[] }): RecipeFormValues {
  return {
    name: recipe.name,
    sourceUrl: recipe.sourceUrl ?? '',
    instructions: recipe.instructions,
    prepMinutes: recipe.prepMinutes ? String(recipe.prepMinutes) : '',
    seasons: recipe.seasons,
    tags: recipe.tags.join(', '),
    ingredientRows: recipe.ingredients.map((recipeIngredient) => ({
      ingredientId: recipeIngredient.ingredientId,
      quantity: String(recipeIngredient.quantity),
      unit: recipeIngredient.unit,
    })),
  };
}
