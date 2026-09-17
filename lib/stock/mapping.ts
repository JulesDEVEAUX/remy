import { ConservationDuree, type Ingredient, type Stock } from '@prisma/client';
import type { IconName } from '@/components/ui';
import { toIngredientViewModel } from '@/lib/ingredients/mapping';
import type { StockFormValues } from './validation';

/** Extrait les champs bruts d'un <form> stock — aucune validation ici. */
export function parseStockFormData(formData: FormData): StockFormValues {
  return {
    ingredientId: String(formData.get('ingredientId') ?? ''),
    quantity: String(formData.get('quantity') ?? ''),
    unit: String(formData.get('unit') ?? ''),
    expiresAt: String(formData.get('expiresAt') ?? ''),
  };
}

/** Formate une Date en valeur `yyyy-mm-dd` pour pré-remplir un <input type="date"> — en heure locale, pas UTC. */
export function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

type UrgencyTone = 'alerte' | 'neutre' | 'stock';

// Distinction visuelle courte/moyenne/longue imposée par l'identité visuelle :
// courte = urgence (terracotta), moyenne = neutre (argile), longue = abondance (sauge).
const URGENCY_TONE: Record<ConservationDuree, UrgencyTone> = {
  COURTE: 'alerte',
  MOYENNE: 'neutre',
  LONGUE: 'stock',
};

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatExpiryLabel(expiresAt: Date, now: Date): string {
  const diffDays = Math.round((startOfDay(expiresAt).getTime() - startOfDay(now).getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return `Périmé depuis ${Math.abs(diffDays)} j`;
  }
  if (diffDays === 0) {
    return "Périme aujourd'hui";
  }
  if (diffDays === 1) {
    return 'Périme demain';
  }
  if (diffDays <= 30) {
    return `Périme dans ${diffDays} j`;
  }
  return `Périme le ${expiresAt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`;
}

export type StockViewModel = {
  id: string;
  ingredientName: string;
  ingredientIcon: IconName;
  quantityLabel: string;
  conservationLabel: string;
  urgencyTone: UrgencyTone;
  expiresAt: Date;
  expiryLabel: string;
};

/** Convertit une entrée de Stock Prisma (avec son ingrédient) en modèle d'affichage. */
export function toStockViewModel(stock: Stock & { ingredient: Ingredient }, now: Date): StockViewModel {
  const ingredientViewModel = toIngredientViewModel(stock.ingredient);
  // expiresAt est toujours renseigné en écriture (fourni ou estimé) ; le repli
  // sur createdAt ne couvre qu'une donnée historique incomplète.
  const expiresAt = stock.expiresAt ?? stock.createdAt;

  return {
    id: stock.id,
    ingredientName: ingredientViewModel.name,
    ingredientIcon: ingredientViewModel.categoryIcon,
    quantityLabel: `${stock.quantity} ${stock.unit}`,
    conservationLabel: ingredientViewModel.conservationLabel,
    urgencyTone: URGENCY_TONE[stock.ingredient.conservation],
    expiresAt,
    expiryLabel: formatExpiryLabel(expiresAt, now),
  };
}
