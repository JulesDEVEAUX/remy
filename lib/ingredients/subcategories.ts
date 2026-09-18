import { IngredientCategory } from '@prisma/client';

export type SubcategoryOption = { value: string; label: string };

/**
 * Détail des catégories existantes (cf. issue #67) : liste fermée de sous-catégories
 * par `IngredientCategory`, proposée en second menu déroulant dépendant du premier.
 * Arborescence calquée sur les rayons réels d'un supermarché (Carrefour), ramenée
 * aux 5 catégories déjà en base — même approche que la liste fermée d'unités
 * (`lib/ingredients/units.ts`, issue #28) plutôt qu'un nouvel enum Prisma : les
 * valeurs sont globalement uniques pour permettre un lookup de libellé sans porter
 * la catégorie.
 */
export const SUBCATEGORY_OPTIONS: Record<IngredientCategory, SubcategoryOption[]> = {
  FRAIS: [
    { value: 'FRUITS_LEGUMES', label: 'Fruits et légumes' },
    { value: 'CREMERIE', label: 'Crèmerie (lait, beurre, fromage, yaourts)' },
    { value: 'VIANDE_VOLAILLE', label: 'Viandes et volailles' },
    { value: 'POISSON_FRUITS_MER', label: 'Poissons et fruits de mer' },
    { value: 'CHARCUTERIE_TRAITEUR', label: 'Charcuterie et traiteur' },
    { value: 'BOULANGERIE_PATISSERIE', label: 'Boulangerie et pâtisserie' },
    { value: 'SURGELES', label: 'Surgelés' },
    { value: 'AUTRE_FRAIS', label: 'Autre frais' },
  ],
  EPICERIE: [
    { value: 'PATES_RIZ_CEREALES', label: 'Pâtes, riz et céréales' },
    { value: 'CONSERVES', label: 'Conserves' },
    { value: 'HUILES_CONDIMENTS', label: 'Huiles, sauces et condiments' },
    { value: 'PETIT_DEJEUNER_SUCRE', label: 'Petit-déjeuner et épicerie sucrée' },
    { value: 'BISCUITS_CONFISERIE', label: 'Biscuits et confiserie' },
    { value: 'BOISSONS', label: 'Boissons' },
    { value: 'PRODUITS_DU_MONDE', label: 'Produits du monde' },
    { value: 'AUTRE_EPICERIE', label: 'Autre épicerie' },
  ],
  MENAGER: [
    { value: 'ENTRETIEN_MAISON', label: 'Entretien de la maison' },
    { value: 'LESSIVE_LINGE', label: 'Lessive et linge' },
    { value: 'VAISSELLE', label: 'Vaisselle' },
    { value: 'PAPIER_JETABLE', label: 'Papier et jetable' },
    { value: 'USTENSILES_CUISINE', label: 'Ustensiles de cuisine' },
    { value: 'AUTRE_MENAGER', label: 'Autre ménager' },
  ],
  BEAUTE: [
    { value: 'HYGIENE_CORPS', label: 'Hygiène du corps' },
    { value: 'SOIN_VISAGE', label: 'Soin du visage' },
    { value: 'HYGIENE_DENTAIRE', label: 'Hygiène dentaire' },
    { value: 'HYGIENE_FEMININE', label: 'Hygiène féminine' },
    { value: 'RASAGE', label: 'Rasage' },
    { value: 'AUTRE_BEAUTE', label: 'Autre beauté' },
  ],
  AUTRE: [],
};

const SUBCATEGORY_LABELS = new Map(
  Object.values(SUBCATEGORY_OPTIONS)
    .flat()
    .map((option) => [option.value, option.label]),
);

export function subcategoryLabel(value: string): string | undefined {
  return SUBCATEGORY_LABELS.get(value);
}

export function isValidSubcategory(category: IngredientCategory, value: string): boolean {
  return SUBCATEGORY_OPTIONS[category].some((option) => option.value === value);
}