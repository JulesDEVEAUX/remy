const MS_PER_DAY = 24 * 60 * 60 * 1000;

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** Libellé relatif ton majordome pour Recipe.lastMadeAt, comparé au jour calendaire de `now`. */
export function formatLastMade(lastMadeAt: Date | null, now: Date = new Date()): string {
  if (!lastMadeAt) {
    return 'jamais réalisée';
  }

  const daysAgo = Math.round((startOfDay(now) - startOfDay(lastMadeAt)) / MS_PER_DAY);

  if (daysAgo <= 0) {
    return "réalisée aujourd'hui";
  }
  if (daysAgo === 1) {
    return 'réalisée hier';
  }
  return `réalisée il y a ${daysAgo} jours`;
}

/** Patch Prisma pour marquer une recette réalisée à l'instant `now`. */
export function markAsMadeToday(now: Date = new Date()): { lastMadeAt: Date } {
  return { lastMadeAt: now };
}
