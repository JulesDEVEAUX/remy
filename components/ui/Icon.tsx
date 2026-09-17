import { icons } from 'lucide-react';

export type IconName = keyof typeof icons;

/**
 * Toutes les icônes de Remy passent par ici : stroke 2.75 imposé,
 * pour la rondeur du système. Ne jamais importer lucide-react directement
 * dans un écran.
 */
export function Icon({
  name,
  size = 20,
  className,
  strokeWidth = 2.75,
}: {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  const Cmp = icons[name];
  if (!Cmp) return null;
  return <Cmp size={size} strokeWidth={strokeWidth} className={className} aria-hidden />;
}

/** Vocabulaire d'icônes du produit — un sens, une icône, partout. */
export const ICONS = {
  accueil: 'House',
  cuisine: 'ChefHat',
  stock: 'Refrigerator',
  semaine: 'CalendarDays',
  courses: 'ShoppingBasket',
  legume: 'Carrot',
  cremerie: 'Milk',
  epicerie: 'Package',
  horsCarrefour: 'Store',
  peremption: 'ClockAlert',
  congele: 'Snowflake',
  duree: 'Timer',
  saison: 'Leaf',
  vocal: 'Mic',
  fait: 'Check',
  ajouter: 'Plus',
  retirer: 'Minus',
  recherche: 'Search',
  notifications: 'Bell',
  copier: 'Copy',
  suivant: 'ArrowRight',
  fermer: 'X',
  refaire: 'Repeat',
} as const satisfies Record<string, IconName>;
