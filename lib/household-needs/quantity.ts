// Durée moyenne d'un mois en jours (365,25 / 12), pour convertir une
// consommation mensuelle déclarée en besoin hebdomadaire lors de la
// génération de la liste de courses.
const DAYS_PER_MONTH = 365.25 / 12;
const DAYS_PER_WEEK = 7;

/** Convertit une quantité mensuelle en équivalent hebdomadaire (au prorata des jours). */
export function monthlyToWeeklyQuantity(monthlyQuantity: number): number {
  return (monthlyQuantity * DAYS_PER_WEEK) / DAYS_PER_MONTH;
}