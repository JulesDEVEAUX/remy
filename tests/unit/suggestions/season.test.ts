import { Saison } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { getCurrentSeason } from '@/lib/suggestions/season';

describe('getCurrentSeason', () => {
  it.each([
    [new Date(2026, 11, 15), Saison.HIVER],
    [new Date(2026, 0, 1), Saison.HIVER],
    [new Date(2026, 1, 28), Saison.HIVER],
    [new Date(2026, 2, 1), Saison.PRINTEMPS],
    [new Date(2026, 4, 31), Saison.PRINTEMPS],
    [new Date(2026, 5, 1), Saison.ETE],
    [new Date(2026, 7, 31), Saison.ETE],
    [new Date(2026, 8, 1), Saison.AUTOMNE],
    [new Date(2026, 10, 30), Saison.AUTOMNE],
  ])('classe %s comme %s', (date, expected) => {
    expect(getCurrentSeason(date)).toBe(expected);
  });
});
