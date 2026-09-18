import type { HouseholdNeedFormValues } from './validation';

/** Extrait les champs bruts d'un <form> d'ajout de besoin récurrent — aucune validation ici. */
export function parseHouseholdNeedFormData(formData: FormData): HouseholdNeedFormValues {
  return {
    ingredientId: String(formData.get('ingredientId') ?? ''),
    monthlyQuantity: String(formData.get('monthlyQuantity') ?? ''),
    unit: String(formData.get('unit') ?? ''),
  };
}

export type HouseholdNeedViewModel = {
  id: string;
  ingredientId: string;
  ingredientName: string;
  quantityLabel: string;
};

type HouseholdNeedWithIngredientName = {
  id: string;
  ingredientId: string;
  monthlyQuantity: number;
  unit: string;
  ingredient: { name: string };
};

export function toHouseholdNeedViewModel(need: HouseholdNeedWithIngredientName): HouseholdNeedViewModel {
  return {
    id: need.id,
    ingredientId: need.ingredientId,
    ingredientName: need.ingredient.name,
    quantityLabel: `${need.monthlyQuantity} ${need.unit} / mois`,
  };
}