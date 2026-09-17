import { IngredientCategory, SourceAchat, type Ingredient, type ShoppingListItem } from '@prisma/client';
import type { IconName } from '@/components/ui';
import { toIngredientViewModel } from '@/lib/ingredients/mapping';
import type { ShoppingItemFormValues } from './validation';

/** Extrait les champs bruts d'un <form> d'ajout manuel — aucune validation ici. */
export function parseShoppingItemFormData(formData: FormData): ShoppingItemFormValues {
  return {
    ingredientId: String(formData.get('ingredientId') ?? ''),
    quantity: String(formData.get('quantity') ?? ''),
    unit: String(formData.get('unit') ?? ''),
  };
}

export type ShoppingItemViewModel = {
  id: string;
  ingredientName: string;
  quantityLabel: string;
  checked: boolean;
};

type ShoppingListItemWithIngredient = ShoppingListItem & { ingredient: Ingredient };

function toShoppingItemViewModel(item: ShoppingListItemWithIngredient): ShoppingItemViewModel {
  return {
    id: item.id,
    ingredientName: item.ingredient.name,
    quantityLabel: `${item.quantity} ${item.unit}`,
    checked: item.checked,
  };
}

// Ordre d'affichage imposé par le PRD, indépendant de l'ordre de l'enum Prisma.
const CATEGORY_ORDER: IngredientCategory[] = [
  IngredientCategory.FRAIS,
  IngredientCategory.EPICERIE,
  IngredientCategory.MENAGER,
  IngredientCategory.BEAUTE,
  IngredientCategory.AUTRE,
];

export type ShoppingCategoryGroup = {
  category: IngredientCategory;
  label: string;
  icon: IconName;
  items: ShoppingItemViewModel[];
};

export type ShoppingSection = {
  source: 'CARREFOUR' | 'HORS_CARREFOUR';
  label: string;
  groups: ShoppingCategoryGroup[];
};

function groupByCategory(items: ShoppingListItemWithIngredient[]): ShoppingCategoryGroup[] {
  const byCategory = new Map<IngredientCategory, ShoppingListItemWithIngredient[]>();
  for (const item of items) {
    const category = item.ingredient.category;
    const group = byCategory.get(category) ?? [];
    group.push(item);
    byCategory.set(category, group);
  }

  return CATEGORY_ORDER.filter((category) => byCategory.has(category)).map((category) => {
    const categoryItems = byCategory.get(category)!;
    const ingredientViewModel = toIngredientViewModel(categoryItems[0].ingredient);
    return {
      category,
      label: ingredientViewModel.categoryLabel,
      icon: ingredientViewModel.categoryIcon,
      items: categoryItems.map(toShoppingItemViewModel),
    };
  });
}

/**
 * Groupe les items de la liste de courses en deux sections d'achat (Carrefour /
 * hors-Carrefour, d'après `ShoppingListItem.source`), chacune groupée par
 * catégorie d'ingrédient dans l'ordre imposé par le PRD.
 */
export function groupShoppingItems(items: ShoppingListItemWithIngredient[]): ShoppingSection[] {
  const carrefourItems = items.filter((item) => item.source === SourceAchat.CARREFOUR);
  const horsCarrefourItems = items.filter((item) => item.source !== SourceAchat.CARREFOUR);

  return [
    { source: 'CARREFOUR', label: 'Carrefour', groups: groupByCategory(carrefourItems) },
    { source: 'HORS_CARREFOUR', label: 'Hors Carrefour', groups: groupByCategory(horsCarrefourItems) },
  ];
}
