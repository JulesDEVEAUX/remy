import { describe, expect, it } from 'vitest';
import { computeResidualQuantities } from '@/lib/shopping/quantity';

describe('computeResidualQuantities', () => {
  it('creates an item for a need with no stock at all', () => {
    const result = computeResidualQuantities([{ ingredientId: 'ing_1', unit: 'g', quantity: 500 }], []);
    expect(result).toEqual([{ ingredientId: 'ing_1', unit: 'g', quantity: 500 }]);
  });

  it('subtracts stock and keeps only the residual quantity', () => {
    const result = computeResidualQuantities(
      [{ ingredientId: 'ing_1', unit: 'g', quantity: 500 }],
      [{ ingredientId: 'ing_1', unit: 'g', quantity: 200 }],
    );
    expect(result).toEqual([{ ingredientId: 'ing_1', unit: 'g', quantity: 300 }]);
  });

  it('creates no item when stock already covers everything needed', () => {
    const result = computeResidualQuantities(
      [{ ingredientId: 'ing_1', unit: 'g', quantity: 500 }],
      [{ ingredientId: 'ing_1', unit: 'g', quantity: 500 }],
    );
    expect(result).toEqual([]);
  });

  it('creates no item when stock exceeds what is needed', () => {
    const result = computeResidualQuantities(
      [{ ingredientId: 'ing_1', unit: 'g', quantity: 500 }],
      [{ ingredientId: 'ing_1', unit: 'g', quantity: 800 }],
    );
    expect(result).toEqual([]);
  });

  it('sums the need for the same ingredient and unit across several recipes', () => {
    const result = computeResidualQuantities(
      [
        { ingredientId: 'ing_1', unit: 'g', quantity: 200 },
        { ingredientId: 'ing_1', unit: 'g', quantity: 150 },
      ],
      [],
    );
    expect(result).toEqual([{ ingredientId: 'ing_1', unit: 'g', quantity: 350 }]);
  });

  it('sums stock across several stock entries for the same ingredient and unit', () => {
    const result = computeResidualQuantities(
      [{ ingredientId: 'ing_1', unit: 'g', quantity: 500 }],
      [
        { ingredientId: 'ing_1', unit: 'g', quantity: 100 },
        { ingredientId: 'ing_1', unit: 'g', quantity: 150 },
      ],
    );
    expect(result).toEqual([{ ingredientId: 'ing_1', unit: 'g', quantity: 250 }]);
  });

  it('treats a different unit for the same ingredient as a separate line (no unit conversion)', () => {
    const result = computeResidualQuantities(
      [{ ingredientId: 'ing_1', unit: 'kg', quantity: 1 }],
      [{ ingredientId: 'ing_1', unit: 'g', quantity: 500 }],
    );
    expect(result).toEqual([{ ingredientId: 'ing_1', unit: 'kg', quantity: 1 }]);
  });

  it('handles several ingredients independently', () => {
    const result = computeResidualQuantities(
      [
        { ingredientId: 'ing_1', unit: 'g', quantity: 500 },
        { ingredientId: 'ing_2', unit: 'pièce', quantity: 3 },
      ],
      [{ ingredientId: 'ing_1', unit: 'g', quantity: 500 }],
    );
    expect(result).toEqual([{ ingredientId: 'ing_2', unit: 'pièce', quantity: 3 }]);
  });

  it('returns an empty list when nothing is needed', () => {
    const result = computeResidualQuantities([], [{ ingredientId: 'ing_1', unit: 'g', quantity: 500 }]);
    expect(result).toEqual([]);
  });
});
