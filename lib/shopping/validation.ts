const UNIT_MAX_LENGTH = 20;
const LIST_NAME_MAX_LENGTH = 40;

export type ShoppingItemFormValues = {
  ingredientId: string;
  quantity: string;
  unit: string;
};

export type ShoppingItemInput = {
  ingredientId: string;
  quantity: number;
  unit: string;
};

export type ShoppingItemFieldErrors = Partial<Record<keyof ShoppingItemFormValues, string>>;

export type ShoppingItemValidationResult =
  | { ok: true; data: ShoppingItemInput }
  | { ok: false; errors: ShoppingItemFieldErrors };

/**
 * Valide un ajout manuel à la liste de courses. `validIngredientIds` restreint
 * la saisie aux ingrédients déjà catalogués du foyer, y compris pour les
 * produits non-alimentaires sans recette associée.
 */
export function validateShoppingItemInput(
  values: ShoppingItemFormValues,
  validIngredientIds: ReadonlySet<string>,
): ShoppingItemValidationResult {
  const errors: ShoppingItemFieldErrors = {};

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

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, data: { ingredientId, quantity, unit } };
}

/**
 * Valide le nom d'une nouvelle liste de courses. `existingNames` restreint aux
 * noms déjà pris par le foyer (contrainte d'unicité Prisma sur householdId+name).
 */
export function validateShoppingListName(
  rawName: string,
  existingNames: ReadonlySet<string>,
): { ok: true; data: string } | { ok: false; error: string } {
  const name = rawName.trim();
  if (!name) {
    return { ok: false, error: 'Le nom de la liste est obligatoire.' };
  }
  if (name.length > LIST_NAME_MAX_LENGTH) {
    return { ok: false, error: `Le nom dépasse ${LIST_NAME_MAX_LENGTH} caractères.` };
  }
  if (existingNames.has(name)) {
    return { ok: false, error: 'Une liste porte déjà ce nom.' };
  }
  return { ok: true, data: name };
}
