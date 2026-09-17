/** Minuit local pour une date donnée — les créneaux MealPlan sont comparés jour à jour, sans heure. */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Les 7 dates consécutives d'une semaine, à partir de la date de début choisie par l'utilisateur. */
export function getWeekDates(startDate: Date): Date[] {
  const start = startOfDay(startDate);
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

export function addDays(date: Date, days: number): Date {
  const result = startOfDay(date);
  result.setDate(result.getDate() + days);
  return result;
}

/** Format `YYYY-MM-DD` stable pour le query param `?start=` — indépendant du fuseau d'affichage. */
export function formatDateParam(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Parse un `?start=YYYY-MM-DD` ; renvoie `null` si absent ou invalide. */
export function parseDateParam(raw: string | undefined): Date | null {
  if (!raw) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (!match) return null;
  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

/** Lundi de la semaine courante (ou de `date`) — point de départ par défaut du planning. */
export function getCurrentWeekStart(date: Date = new Date()): Date {
  const today = startOfDay(date);
  const isoWeekday = today.getDay() === 0 ? 7 : today.getDay(); // 1 (lundi) .. 7 (dimanche)
  return addDays(today, -(isoWeekday - 1));
}
