export type UnitOption = { value: string; label: string };

/**
 * Unités proposées à la création/édition d'un produit (cf. issue #28) : liste
 * fermée plutôt qu'un champ libre, pour garantir une notation scientifique
 * cohérente d'un produit à l'autre ("mL", pas "ml"/"millilitres"/"cl").
 */
export const UNIT_OPTIONS: UnitOption[] = [
  { value: 'mg', label: 'mg (milligramme)' },
  { value: 'g', label: 'g (gramme)' },
  { value: 'kg', label: 'kg (kilogramme)' },
  { value: 'mL', label: 'mL (millilitre)' },
  { value: 'cL', label: 'cL (centilitre)' },
  { value: 'L', label: 'L (litre)' },
  { value: 'pièce', label: 'pièce' },
  { value: 'unité', label: 'unité' },
  { value: 'paire', label: 'paire' },
  { value: 'douzaine', label: 'douzaine' },
  { value: 'tranche', label: 'tranche' },
  { value: 'sachet', label: 'sachet' },
  { value: 'boîte', label: 'boîte' },
  { value: 'paquet', label: 'paquet' },
  { value: 'botte', label: 'botte' },
  { value: 'pot', label: 'pot' },
  { value: 'bouteille', label: 'bouteille' },
  { value: 'rouleau', label: 'rouleau' },
];

export const UNIT_VALUES = new Set(UNIT_OPTIONS.map((option) => option.value));
