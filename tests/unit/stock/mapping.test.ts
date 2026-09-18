import { ConservationDuree, IngredientCategory, SourceAchat, StockLocation, type Ingredient, type Stock } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { groupStockByLocation, parseStockFormData, toDateInputValue, toStockViewModel } from '@/lib/stock/mapping';

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
    emoji: '🥕',
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
    location: StockLocation.FRIGO,
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
    formData.set('location', 'FRIGO');
    formData.set('expiresAt', '2026-01-10');

    expect(parseStockFormData(formData)).toEqual({
      ingredientId: 'ing_1',
      quantity: '500',
      unit: 'g',
      location: 'FRIGO',
      expiresAt: '2026-01-10',
    });
  });

  it('defaults missing fields to empty strings instead of throwing', () => {
    expect(parseStockFormData(new FormData())).toEqual({
      ingredientId: '',
      quantity: '',
      unit: '',
      location: '',
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

  it('labels the storage location in French', () => {
    const viewModel = toStockViewModel(
      { ...makeStock({ location: StockLocation.SALLE_DE_BAIN }), ingredient: makeIngredient() },
      now,
    );
    expect(viewModel.locationLabel).toBe('Salle de bain');
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

describe('groupStockByLocation', () => {
  const now = new Date(2026, 0, 5);

  function viewModelAt(id: string, location: StockLocation) {
    return toStockViewModel({ ...makeStock({ id, location }), ingredient: makeIngredient() }, now);
  }

  it('orders groups from fridge to catch-all regardless of input order', () => {
    const groups = groupStockByLocation([
      viewModelAt('a', StockLocation.AUTRE),
      viewModelAt('b', StockLocation.PLACARD),
      viewModelAt('c', StockLocation.FRIGO),
    ]);

    expect(groups.map((group) => group.location)).toEqual([
      StockLocation.FRIGO,
      StockLocation.PLACARD,
      StockLocation.AUTRE,
    ]);
  });

  it('omits empty locations entirely', () => {
    const groups = groupStockByLocation([viewModelAt('a', StockLocation.FRIGO)]);
    expect(groups).toHaveLength(1);
    expect(groups[0].location).toBe(StockLocation.FRIGO);
  });

  it('keeps the input order of items within a group', () => {
    const groups = groupStockByLocation([
      viewModelAt('first', StockLocation.FRIGO),
      viewModelAt('second', StockLocation.FRIGO),
    ]);
    expect(groups[0].items.map((item) => item.id)).toEqual(['first', 'second']);
  });

  it('returns an empty array for no items', () => {
    expect(groupStockByLocation([])).toEqual([]);
  });
});
