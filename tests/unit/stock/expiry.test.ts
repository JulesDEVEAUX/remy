import { ConservationDuree } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { estimateExpiryDate } from '@/lib/stock/expiry';

describe('estimateExpiryDate', () => {
  it('adds 5 days for a short conservation duration', () => {
    const result = estimateExpiryDate(ConservationDuree.COURTE, new Date(2026, 0, 1));
    expect(result).toEqual(new Date(2026, 0, 6));
  });

  it('adds 14 days for a medium conservation duration', () => {
    const result = estimateExpiryDate(ConservationDuree.MOYENNE, new Date(2026, 0, 1));
    expect(result).toEqual(new Date(2026, 0, 15));
  });

  it('adds 180 days for a long conservation duration', () => {
    const addedAt = new Date(2026, 0, 1);
    const expected = new Date(2026, 0, 1);
    expected.setDate(expected.getDate() + 180);

    const result = estimateExpiryDate(ConservationDuree.LONGUE, addedAt);
    expect(result).toEqual(expected);
  });

  it('rolls over month and year boundaries correctly', () => {
    const result = estimateExpiryDate(ConservationDuree.COURTE, new Date(2026, 11, 30));
    expect(result).toEqual(new Date(2027, 0, 4));
  });

  it('does not mutate the input date', () => {
    const addedAt = new Date(2026, 0, 1);
    estimateExpiryDate(ConservationDuree.COURTE, addedAt);
    expect(addedAt).toEqual(new Date(2026, 0, 1));
  });
});
