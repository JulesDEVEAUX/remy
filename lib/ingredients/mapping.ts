import { ConservationDuree, IngredientCategory, SourceAchat, type Ingredient } from '@prisma/client';
import type { IconName } from '@/components/ui';
import { subcategoryLabel } from './subcategories';
import type { IngredientFormValues } from './validation';

/** Extrait les champs bruts d'un <form> ingrédient — aucune validation ici. */
export function parseIngredientFormData(formData: FormData): IngredientFormValues {
  return {
    name: String(formData.get('name') ?? ''),
    category: String(formData.get('category') ?? ''),
    subcategory: String(formData.get('subcategory') ?? ''),
    defaultUnit: String(formData.get('defaultUnit') ?? ''),
    conservation: String(formData.get('conservation') ?? ''),
    defaultSource: String(formData.get('defaultSource') ?? ''),
    isPrivate: formData.get('isPrivate') === 'on',
    emoji: String(formData.get('emoji') ?? ''),
  };
}

const CATEGORY_LABELS: Record<IngredientCategory, string> = {
  FRAIS: 'Frais',
  EPICERIE: 'Épicerie',
  MENAGER: 'Ménager',
  BEAUTE: 'Beauté',
  AUTRE: 'Autre',
};

const CATEGORY_ICONS: Record<IngredientCategory, IconName> = {
  FRAIS: 'Carrot',
  EPICERIE: 'Package',
  MENAGER: 'SprayCan',
  BEAUTE: 'Sparkles',
  AUTRE: 'Package',
};

const CONSERVATION_LABELS: Record<ConservationDuree, string> = {
  COURTE: 'Courte',
  MOYENNE: 'Moyenne',
  LONGUE: 'Longue',
};

const SOURCE_LABELS: Record<SourceAchat, string> = {
  CARREFOUR: 'Carrefour',
  MARCHE: 'Marché',
  AUTRE: 'Autre',
};

export type IngredientViewModel = {
  id: string;
  name: string;
  category: IngredientCategory;
  categoryLabel: string;
  categoryIcon: IconName;
  subcategoryLabel: string | null;
  defaultUnit: string;
  conservationLabel: string;
  sourceLabel: string;
  isPrivate: boolean;
  emoji: string;
};

/** Convertit un Ingredient Prisma en modèle d'affichage (libellés FR, icône). */
export function toIngredientViewModel(ingredient: Ingredient): IngredientViewModel {
  return {
    id: ingredient.id,
    name: ingredient.name,
    category: ingredient.category,
    categoryLabel: CATEGORY_LABELS[ingredient.category],
    categoryIcon: CATEGORY_ICONS[ingredient.category],
    subcategoryLabel: ingredient.subcategory ? (subcategoryLabel(ingredient.subcategory) ?? null) : null,
    defaultUnit: ingredient.defaultUnit,
    conservationLabel: CONSERVATION_LABELS[ingredient.conservation],
    sourceLabel: SOURCE_LABELS[ingredient.defaultSource],
    isPrivate: ingredient.isPrivate,
    emoji: ingredient.emoji,
  };
}
