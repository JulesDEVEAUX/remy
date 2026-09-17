import { Saison } from '@prisma/client';

/**
 * Saison météo (hémisphère nord) à partir du mois de la date donnée.
 * Non spécifiée au PRD : découpage calendaire standard retenu par défaut,
 * à ajuster si une définition plus fine (ex. dates exactes d'équinoxe) s'avère
 * nécessaire à l'usage — voir docs/CONTEXT.md, Risques et décisions ouvertes.
 */
export function getCurrentSeason(date: Date): Saison {
  const month = date.getMonth();
  if (month === 11 || month <= 1) return Saison.HIVER;
  if (month <= 4) return Saison.PRINTEMPS;
  if (month <= 7) return Saison.ETE;
  return Saison.AUTOMNE;
}
