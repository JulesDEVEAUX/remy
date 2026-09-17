import { Saison } from '@prisma/client';

const NAME_MAX_LENGTH = 120;
const SOURCE_URL_MAX_LENGTH = 500;
const INSTRUCTIONS_MAX_LENGTH = 4000;
const UNIT_MAX_LENGTH = 20;
const TAG_MAX_LENGTH = 30;
const TAGS_MAX_COUNT = 10;

export type RecipeIngredientRowInput = {
  ingredientId: string;
  quantity: string;
  unit: string;
};

export type RecipeFormValues = {
  name: string;
  sourceUrl: string;
  instructions: string;
  prepMinutes: string;
  seasons: string[];
  tags: string;
  ingredientRows: RecipeIngredientRowInput[];
};

export type RecipeIngredientInput = {
  ingredientId: string;
  quantity: number;
  unit: string;
};

export type RecipeInput = {
  name: string;
  sourceUrl: string | null;
  instructions: string;
  prepMinutes: number | null;
  seasons: Saison[];
  tags: string[];
  ingredients: RecipeIngredientInput[];
};

export type RecipeFieldErrors = Partial<
  Record<'name' | 'sourceUrl' | 'instructions' | 'prepMinutes' | 'seasons' | 'tags' | 'ingredients', string>
>;

export type RecipeValidationResult = { ok: true; data: RecipeInput } | { ok: false; errors: RecipeFieldErrors };

function isSaison(value: string): value is Saison {
  return (Object.values(Saison) as string[]).includes(value);
}

function isBlankRow(row: RecipeIngredientRowInput) {
  return row.ingredientId.trim() === '' && row.quantity.trim() === '' && row.unit.trim() === '';
}

/**
 * Valide une recette avant écriture Prisma. `validIngredientIds` restreint la
 * composition aux ingrédients déjà catalogués du foyer : ce formulaire ne crée
 * jamais d'ingrédient à la volée.
 */
export function validateRecipeInput(
  values: RecipeFormValues,
  validIngredientIds: ReadonlySet<string>,
): RecipeValidationResult {
  const errors: RecipeFieldErrors = {};

  const name = values.name.trim();
  if (!name) {
    errors.name = 'Le nom est obligatoire.';
  } else if (name.length > NAME_MAX_LENGTH) {
    errors.name = `Le nom dépasse ${NAME_MAX_LENGTH} caractères.`;
  }

  let sourceUrl: string | null = null;
  const rawSourceUrl = values.sourceUrl.trim();
  if (rawSourceUrl) {
    if (rawSourceUrl.length > SOURCE_URL_MAX_LENGTH) {
      errors.sourceUrl = `Le lien dépasse ${SOURCE_URL_MAX_LENGTH} caractères.`;
    } else {
      try {
        new URL(rawSourceUrl);
        sourceUrl = rawSourceUrl;
      } catch {
        errors.sourceUrl = 'Le lien source est invalide.';
      }
    }
  }

  const instructions = values.instructions.trim();
  if (!instructions) {
    errors.instructions = 'Les instructions sont obligatoires.';
  } else if (instructions.length > INSTRUCTIONS_MAX_LENGTH) {
    errors.instructions = `Les instructions dépassent ${INSTRUCTIONS_MAX_LENGTH} caractères.`;
  }

  let prepMinutes: number | null = null;
  const rawPrepMinutes = values.prepMinutes.trim();
  if (rawPrepMinutes) {
    const parsed = Number(rawPrepMinutes);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      errors.prepMinutes = 'Le temps de préparation doit être un nombre entier positif.';
    } else {
      prepMinutes = parsed;
    }
  }

  const seasons: Saison[] = [];
  for (const value of values.seasons) {
    if (!isSaison(value)) {
      errors.seasons = 'Choisis une saison valide.';
      continue;
    }
    if (!seasons.includes(value)) {
      seasons.push(value);
    }
  }

  const tags: string[] = [];
  const rawTags = values.tags
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
  for (const tag of rawTags) {
    if (tag.length > TAG_MAX_LENGTH) {
      errors.tags = `Un tag dépasse ${TAG_MAX_LENGTH} caractères.`;
      continue;
    }
    if (!tags.includes(tag)) {
      tags.push(tag);
    }
  }
  if (!errors.tags && tags.length > TAGS_MAX_COUNT) {
    errors.tags = `Limite ${TAGS_MAX_COUNT} tags.`;
  }

  const ingredients: RecipeIngredientInput[] = [];
  const seenIngredientIds = new Set<string>();
  let hasInvalidRow = false;
  let hasDuplicateRow = false;
  for (const row of values.ingredientRows) {
    if (isBlankRow(row)) {
      continue;
    }

    const ingredientId = row.ingredientId.trim();
    const unit = row.unit.trim();
    const quantity = Number(row.quantity);

    if (!ingredientId || !validIngredientIds.has(ingredientId) || !unit || unit.length > UNIT_MAX_LENGTH) {
      hasInvalidRow = true;
      continue;
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      hasInvalidRow = true;
      continue;
    }
    if (seenIngredientIds.has(ingredientId)) {
      hasDuplicateRow = true;
      continue;
    }

    seenIngredientIds.add(ingredientId);
    ingredients.push({ ingredientId, quantity, unit });
  }

  if (hasDuplicateRow) {
    errors.ingredients = "Un ingrédient ne peut apparaître qu'une fois.";
  } else if (hasInvalidRow) {
    errors.ingredients = 'Chaque ligne doit avoir un ingrédient existant, une quantité positive et une unité.';
  } else if (ingredients.length === 0) {
    errors.ingredients = 'Ajoute au moins un ingrédient.';
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: { name, sourceUrl, instructions, prepMinutes, seasons, tags, ingredients },
  };
}
