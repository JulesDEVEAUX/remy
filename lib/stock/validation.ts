import { StockLocation } from '@prisma/client';

const UNIT_MAX_LENGTH = 20;

export type StockFormValues = {
  ingredientId: string;
  quantity: string;
  unit: string;
  location: string;
  expiresAt: string;
};

export type StockInput = {
  ingredientId: string;
  quantity: number;
  unit: string;
  location: StockLocation;
  /** null = non renseigné à la saisie ; l'appelant calcule alors une estimation. */
  expiresAt: Date | null;
};

export type StockFieldErrors = Partial<Record<keyof StockFormValues, string>>;

export type StockValidationResult = { ok: true; data: StockInput } | { ok: false; errors: StockFieldErrors };

function parseDateOnly(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }
  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Valide une entrée de stock avant écriture Prisma. `validIngredientIds` restreint
 * la saisie aux ingrédients déjà catalogués du foyer : cet écran ne crée jamais
 * d'ingrédient à la volée.
 */
export function validateStockInput(
  values: StockFormValues,
  validIngredientIds: ReadonlySet<string>,
): StockValidationResult {
  const errors: StockFieldErrors = {};

  const ingredientId = values.ingredientId.trim();
  if (!ingredientId || !validIngredientIds.has(ingredientId)) {
    errors.ingredientId = 'Choisis un ingrédient existant.';
  }

  const quantity = Number(values.quantity);
  if (!Number.isFinite(quantity) || quantity <= 0) {
    errors.quantity = 'La quantité doit être un nombre positif.';
  }

  const unit = values.unit.trim();
  if (!unit) {
    errors.unit = "L'unité est obligatoire.";
  } else if (unit.length > UNIT_MAX_LENGTH) {
    errors.unit = `L'unité dépasse ${UNIT_MAX_LENGTH} caractères.`;
  }

  const location = values.location.trim();
  if (!Object.values(StockLocation).includes(location as StockLocation)) {
    errors.location = 'Choisis un emplacement.';
  }

  let expiresAt: Date | null = null;
  const rawExpiresAt = values.expiresAt.trim();
  if (rawExpiresAt) {
    const parsed = parseDateOnly(rawExpiresAt);
    if (!parsed) {
      errors.expiresAt = 'La date de péremption est invalide.';
    } else {
      expiresAt = parsed;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, data: { ingredientId, quantity, unit, location: location as StockLocation, expiresAt } };
}
