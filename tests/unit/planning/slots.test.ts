import { TypeRepas } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { detectMealsPerDay, generateWeekSlots, MEAL_TYPES_BY_COUNT } from '@/lib/planning/slots';
import { formatDateParam } from '@/lib/planning/dates';

const START = new Date(2026, 8, 21); // lundi 21 septembre 2026

describe('generateWeekSlots', () => {
  it('génère 7 dates consécutives à partir de la date de début', () => {
    const slots = generateWeekSlots(START, 1);
    const dates = Array.from(new Set(slots.map((slot) => formatDateParam(slot.date))));

    expect(dates).toEqual([
      '2026-09-21',
      '2026-09-22',
      '2026-09-23',
      '2026-09-24',
      '2026-09-25',
      '2026-09-26',
      '2026-09-27',
    ]);
  });

  it('un repas/jour ne génère que le dîner, un créneau par jour', () => {
    const slots = generateWeekSlots(START, 1);

    expect(slots).toHaveLength(7);
    expect(slots.every((slot) => slot.mealType === TypeRepas.DINER)).toBe(true);
  });

  it('deux repas/jour génèrent déjeuner + dîner, dans cet ordre, chaque jour', () => {
    const slots = generateWeekSlots(START, 2);
    const firstDaySlots = slots.filter((slot) => formatDateParam(slot.date) === '2026-09-21');

    expect(slots).toHaveLength(14);
    expect(firstDaySlots.map((slot) => slot.mealType)).toEqual([TypeRepas.DEJEUNER, TypeRepas.DINER]);
  });

  it('trois repas/jour ajoutent le petit-déjeuner en tête', () => {
    const slots = generateWeekSlots(START, 3);
    const firstDaySlots = slots.filter((slot) => formatDateParam(slot.date) === '2026-09-21');

    expect(slots).toHaveLength(21);
    expect(firstDaySlots.map((slot) => slot.mealType)).toEqual([
      TypeRepas.PETIT_DEJEUNER,
      TypeRepas.DEJEUNER,
      TypeRepas.DINER,
    ]);
  });

  it('quatre repas/jour ajoutent la collation en dernier', () => {
    const slots = generateWeekSlots(START, 4);
    const firstDaySlots = slots.filter((slot) => formatDateParam(slot.date) === '2026-09-21');

    expect(slots).toHaveLength(28);
    expect(firstDaySlots.map((slot) => slot.mealType)).toEqual([
      TypeRepas.PETIT_DEJEUNER,
      TypeRepas.DEJEUNER,
      TypeRepas.DINER,
      TypeRepas.COLLATION,
    ]);
  });

  it('rejette un nombre de repas/jour hors du mapping défini', () => {
    expect(() => generateWeekSlots(START, 0)).toThrow();
    expect(() => generateWeekSlots(START, 5)).toThrow();
  });

  it('couvre exactement les nombres de repas/jour de 1 à 4', () => {
    expect(Object.keys(MEAL_TYPES_BY_COUNT).map(Number).sort()).toEqual([1, 2, 3, 4]);
  });
});

describe('detectMealsPerDay', () => {
  it('retrouve le nombre de repas/jour à partir des types de repas déjà générés', () => {
    expect(detectMealsPerDay([TypeRepas.DEJEUNER, TypeRepas.DINER])).toBe(2);
    expect(detectMealsPerDay([TypeRepas.DINER])).toBe(1);
    expect(
      detectMealsPerDay([TypeRepas.PETIT_DEJEUNER, TypeRepas.DEJEUNER, TypeRepas.DINER, TypeRepas.COLLATION]),
    ).toBe(4);
  });

  it("renvoie null pour un ensemble qui ne correspond à aucune configuration connue", () => {
    expect(detectMealsPerDay([])).toBeNull();
    expect(detectMealsPerDay([TypeRepas.COLLATION])).toBeNull();
  });
});
