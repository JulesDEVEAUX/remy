import { describe, expect, it } from 'vitest';
import { monthlyToWeeklyQuantity } from '@/lib/household-needs/quantity';

describe('monthlyToWeeklyQuantity', () => {
  it('converts a monthly quantity to its weekly prorata', () => {
    // 30,4375 j/mois (moyenne) : 4 L/mois ≈ 0,92 L/semaine.
    expect(monthlyToWeeklyQuantity(4)).toBeCloseTo(0.9202, 3);
  });

  it('returns zero for a zero monthly quantity', () => {
    expect(monthlyToWeeklyQuantity(0)).toBe(0);
  });

  it('scales linearly with the monthly quantity', () => {
    expect(monthlyToWeeklyQuantity(8)).toBeCloseTo(monthlyToWeeklyQuantity(4) * 2, 6);
  });
});