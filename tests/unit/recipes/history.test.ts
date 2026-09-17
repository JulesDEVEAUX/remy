import { describe, expect, it } from 'vitest';
import { formatLastMade, markAsMadeToday } from '@/lib/recipes/history';

describe('formatLastMade', () => {
  // Construits en heure locale (comme `startOfDay`) pour rester indépendants du fuseau horaire de test.
  const now = new Date(2026, 8, 17, 18, 0);

  it('returns "jamais réalisée" when the recipe was never made', () => {
    expect(formatLastMade(null, now)).toBe('jamais réalisée');
  });

  it('returns "aujourd\'hui" the same calendar day, regardless of time of day', () => {
    expect(formatLastMade(new Date(2026, 8, 17, 6, 0), now)).toBe("réalisée aujourd'hui");
  });

  it('returns "hier" the previous calendar day', () => {
    expect(formatLastMade(new Date(2026, 8, 16, 23, 0), now)).toBe('réalisée hier');
  });

  it('returns a day count for anything older', () => {
    expect(formatLastMade(new Date(2026, 8, 5, 18, 0), now)).toBe('réalisée il y a 12 jours');
  });
});

describe('markAsMadeToday', () => {
  it('builds a Prisma patch pinning lastMadeAt to the given date', () => {
    const now = new Date('2026-09-17T09:30:00Z');
    expect(markAsMadeToday(now)).toEqual({ lastMadeAt: now });
  });

  it('defaults to the current date when none is provided', () => {
    const before = Date.now();
    const { lastMadeAt } = markAsMadeToday();
    const after = Date.now();
    expect(lastMadeAt.getTime()).toBeGreaterThanOrEqual(before);
    expect(lastMadeAt.getTime()).toBeLessThanOrEqual(after);
  });
});
