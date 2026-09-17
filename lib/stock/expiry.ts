import { ConservationDuree } from '@prisma/client';

// Durées de conservation estimées (en jours) : valeurs par défaut indicatives,
// utilisées uniquement quand l'utilisateur ne renseigne pas de date de péremption
// à la saisie. À affiner par ingrédient plus tard si besoin.
const ESTIMATED_SHELF_LIFE_DAYS: Record<ConservationDuree, number> = {
  COURTE: 5,
  MOYENNE: 14,
  LONGUE: 180,
};

/** Calcule une date de péremption estimée à partir de la durée de conservation et de la date d'ajout. */
export function estimateExpiryDate(conservation: ConservationDuree, addedAt: Date): Date {
  const estimated = new Date(addedAt);
  estimated.setDate(estimated.getDate() + ESTIMATED_SHELF_LIFE_DAYS[conservation]);
  return estimated;
}
