import { ConservationDuree, IngredientCategory, SourceAchat } from '@prisma/client';

const NAME_MAX_LENGTH = 80;
const UNIT_MAX_LENGTH = 20;

export type IngredientFormValues = {
  name: string;
  category: string;
  defaultUnit: string;
  conservation: string;
  defaultSource: string;
  isPrivate: boolean;
};

export type IngredientInput = {
  name: string;
  category: IngredientCategory;
  defaultUnit: string;
  conservation: ConservationDuree;
  defaultSource: SourceAchat;
  isPrivate: boolean;
};

export type IngredientFieldErrors = Partial<Record<keyof IngredientFormValues, string>>;

export type IngredientValidationResult =
  | { ok: true; data: IngredientInput }
  | { ok: false; errors: IngredientFieldErrors };

function isIngredientCategory(value: string): value is IngredientCategory {
  return (Object.values(IngredientCategory) as string[]).includes(value);
}

function isConservationDuree(value: string): value is ConservationDuree {
  return (Object.values(ConservationDuree) as string[]).includes(value);
}

function isSourceAchat(value: string): value is SourceAchat {
  return (Object.values(SourceAchat) as string[]).includes(value);
}

/**
 * Valide les champs d'un ingrédient avant écriture Prisma. Ne fait confiance à
 * rien de ce qui vient du formulaire : catégories/durées/sources sont vérifiées
 * contre les enums Prisma plutôt que castées directement.
 */
export function validateIngredientInput(values: IngredientFormValues): IngredientValidationResult {
  const errors: IngredientFieldErrors = {};

  const name = values.name.trim();
  if (!name) {
    errors.name = 'Le nom est obligatoire.';
  } else if (name.length > NAME_MAX_LENGTH) {
    errors.name = `Le nom dépasse ${NAME_MAX_LENGTH} caractères.`;
  }

  if (!isIngredientCategory(values.category)) {
    errors.category = 'Choisis une catégorie valide.';
  }

  const defaultUnit = values.defaultUnit.trim();
  if (!defaultUnit) {
    errors.defaultUnit = "L'unité par défaut est obligatoire.";
  } else if (defaultUnit.length > UNIT_MAX_LENGTH) {
    errors.defaultUnit = `L'unité dépasse ${UNIT_MAX_LENGTH} caractères.`;
  }

  if (!isConservationDuree(values.conservation)) {
    errors.conservation = 'Choisis une durée de conservation valide.';
  }

  if (!isSourceAchat(values.defaultSource)) {
    errors.defaultSource = "Choisis une source d'achat valide.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      name,
      category: values.category as IngredientCategory,
      defaultUnit,
      conservation: values.conservation as ConservationDuree,
      defaultSource: values.defaultSource as SourceAchat,
      isPrivate: values.isPrivate,
    },
  };
}
