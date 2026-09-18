const UNIT_MAX_LENGTH = 20;

export type HouseholdNeedFormValues = {
  ingredientId: string;
  monthlyQuantity: string;
  unit: string;
};

export type HouseholdNeedInput = {
  ingredientId: string;
  monthlyQuantity: number;
  unit: string;
};

export type HouseholdNeedFieldErrors = Partial<Record<keyof HouseholdNeedFormValues, string>>;

export type HouseholdNeedValidationResult =
  | { ok: true; data: HouseholdNeedInput }
  | { ok: false; errors: HouseholdNeedFieldErrors };

/**
 * Valide l'ajout d'un besoin récurrent du foyer. `validIngredientIds` restreint
 * la saisie au catalogue existant, `existingIngredientIds` évite un doublon
 * (un seul besoin récurrent par ingrédient, cf. contrainte Prisma).
 */
export function validateHouseholdNeedInput(
  values: HouseholdNeedFormValues,
  validIngredientIds: ReadonlySet<string>,
  existingIngredientIds: ReadonlySet<string>,
): HouseholdNeedValidationResult {
  const errors: HouseholdNeedFieldErrors = {};

  const ingredientId = values.ingredientId.trim();
  if (!ingredientId || !validIngredientIds.has(ingredientId)) {
    errors.ingredientId = 'Choisis un ingrédient existant.';
  } else if (existingIngredientIds.has(ingredientId)) {
    errors.ingredientId = 'Ce besoin existe déjà — modifie-le plutôt que d’en créer un autre.';
  }

  const monthlyQuantity = Number(values.monthlyQuantity);
  if (!Number.isFinite(monthlyQuantity) || monthlyQuantity <= 0) {
    errors.monthlyQuantity = 'La quantité doit être un nombre positif.';
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

  return { ok: true, data: { ingredientId, monthlyQuantity, unit } };
}