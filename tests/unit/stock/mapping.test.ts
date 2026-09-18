import { ConservationDuree, IngredientCategory, SourceAchat, type Ingredient, type Stock } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { parseStockFormData, toDateInputValue, toStockViewModel } from '@/lib/stock/mapping';

function makeIngredient(overrides: Partial<Ingredient> = {}): Ingredient {
  return {
    id: 'ing_1',
    householdId: 'household_1',
    name: 'Carottes',
    category: IngredientCategory.FRAIS,
    defaultUnit: 'g',
    conservation: ConservationDuree.COURTE,
    defaultSource: SourceAchat.MARCHE,
    isPrivate: false,
    kcalPer100g: null,
    proteinPer100g: null,
    carbsPer100g: null,
    fatPer100g: null,
    fiberPer100g: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeStock(overrides: Partial<Stock> = {}): Stock {
  return {
    id: 'stock_1',
    householdId: 'household_1',
    ingredientId: 'ing_1',
    quantity: 500,
    unit: 'g',
    expiresAt: new Date(2026, 0, 10),
    createdAt: new Date(2026, 0, 1),
    updatedAt: new Date(2026, 0, 1),
    ...overrides,
  };
}

describe('parseStockFormData', () => {
  it('extracts every field from a FormData', () => {
    const formData = new FormData();
    formData.set('ingredientId', 'ing_1');
    formData.set('quantity', '500');
    formData.set('unit', 'g');
    formData.set('expiresAt', '2026-01-10');

    expect(parseStockFormData(formData)).toEqual({
      ingredientId: 'ing_1',
      quantity: '500',
      unit: 'g',
      expiresAt: '2026-01-10',
    });
  });

  it('defaults missing fields to empty strings instead of throwing', () => {
    expect(parseStockFormData(new FormData())).toEqual({
      ingredientId: '',
      quantity: '',
      unit: '',
      expiresAt: '',
    });
  });
});

describe('toDateInputValue', () => {
  it('formats a date as yyyy-mm-dd using local time, not UTC', () => {
    expect(toDateInputValue(new Date(2026, 0, 9))).toBe('2026-01-09');
  });
});

describe('toStockViewModel', () => {
  const now = new Date(2026, 0, 5);

  it('combines quantity and unit into a single label', () => {
    const viewModel = toStockViewModel(
      { ...makeStock({ quantity: 1.5, unit: 'L' }), ingredient: makeIngredient() },
      now,
    );
    expect(viewModel.quantityLabel).toBe('1.5 L');
  });

  it('assigns the alerte tone to short-conservation ingredients', () => {
    const viewModel = toStockViewModel(
      { ...makeStock(), ingredient: makeIngredient({ conservation: ConservationDuree.COURTE }) },
      now,
    );
    expect(viewModel.urgencyTone).toBe('alerte');
  });

  it('assigns the neutre tone to medium-conservation ingredients', () => {
    const viewModel = toStockViewModel(
      { ...makeStock(), ingredient: makeIngredient({ conservation: ConservationDuree.MOYENNE }) },
      now,
    );
    expect(viewModel.urgencyTone).toBe('neutre');
  });

  it('assigns the stock tone to long-conservation ingredients', () => {
    const viewModel = toStockViewModel(
      { ...makeStock(), ingredient: makeIngredient({ conservation: ConservationDuree.LONGUE }) },
      now,
    );
    expect(viewModel.urgencyTone).toBe('stock');
  });

  it('labels an already-expired entry', () => {
    const viewModel = toStockViewModel(
      { ...makeStock({ expiresAt: new Date(2026, 0, 2) }), ingredient: makeIngredient() },
      now,
    );
    expect(viewModel.expiryLabel).toBe('Périmé depuis 3 j');
  });

  it("labels an entry expiring today", () => {
    const viewModel = toStockViewModel(
      { ...makeStock({ expiresAt: new Date(2026, 0, 5) }), ingredient: makeIngredient() },
      now,
    );
    expect(viewModel.expiryLabel).toBe("Périme aujourd'hui");
  });

  it('labels an entry expiring tomorrow', () => {
    const viewModel = toStockViewModel(
      { ...makeStock({ expiresAt: new Date(2026, 0, 6) }), ingredient: makeIngredient() },
      now,
    );
    expect(viewModel.expiryLabel).toBe('Périme demain');
  });

  it('labels an entry expiring within a month by day count', () => {
    const viewModel = toStockViewModel(
      { ...makeStock({ expiresAt: new Date(2026, 0, 12) }), ingredient: makeIngredient() },
      now,
    );
    expect(viewModel.expiryLabel).toBe('Périme dans 7 j');
  });

  it('labels a far-future entry with a formatted date instead of a day count', () => {
    const viewModel = toStockViewModel(
      { ...makeStock({ expiresAt: new Date(2026, 5, 1) }), ingredient: makeIngredient() },
      now,
    );
    expect(viewModel.expiryLabel).toContain('juin');
  });
});
