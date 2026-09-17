import { ConservationDuree, IngredientCategory, SourceAchat, type Ingredient } from '@prisma/client';
import { icons } from 'lucide-react';
import { describe, expect, it } from 'vitest';
import { parseIngredientFormData, toIngredientViewModel } from '@/lib/ingredients/mapping';

function makeIngredient(overrides: Partial<Ingredient> = {}): Ingredient {
  return {
    id: 'ing_1',
    householdId: 'household_1',
    name: 'Farine T55',
    category: IngredientCategory.EPICERIE,
    defaultUnit: 'g',
    conservation: ConservationDuree.LONGUE,
    defaultSource: SourceAchat.CARREFOUR,
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

describe('parseIngredientFormData', () => {
  it('extracts every field from a FormData', () => {
    const formData = new FormData();
    formData.set('name', 'Lait');
    formData.set('category', 'FRAIS');
    formData.set('defaultUnit', 'L');
    formData.set('conservation', 'COURTE');
    formData.set('defaultSource', 'MARCHE');

    expect(parseIngredientFormData(formData)).toEqual({
      name: 'Lait',
      category: 'FRAIS',
      defaultUnit: 'L',
      conservation: 'COURTE',
      defaultSource: 'MARCHE',
    });
  });

  it('defaults missing fields to empty strings instead of throwing', () => {
    expect(parseIngredientFormData(new FormData())).toEqual({
      name: '',
      category: '',
      defaultUnit: '',
      conservation: '',
      defaultSource: '',
    });
  });
});

describe('toIngredientViewModel', () => {
  it('maps identifiers and the default unit through unchanged', () => {
    const viewModel = toIngredientViewModel(makeIngredient({ id: 'ing_42', defaultUnit: 'kg' }));
    expect(viewModel.id).toBe('ing_42');
    expect(viewModel.defaultUnit).toBe('kg');
  });

  it('produces a French label and a valid icon name for every category', () => {
    for (const category of Object.values(IngredientCategory)) {
      const viewModel = toIngredientViewModel(makeIngredient({ category }));
      expect(viewModel.categoryLabel.length).toBeGreaterThan(0);
      expect(icons[viewModel.categoryIcon]).toBeDefined();
    }
  });

  it('produces a French label for every conservation duration', () => {
    for (const conservation of Object.values(ConservationDuree)) {
      const viewModel = toIngredientViewModel(makeIngredient({ conservation }));
      expect(viewModel.conservationLabel.length).toBeGreaterThan(0);
    }
  });

  it('produces a French label for every purchase source', () => {
    for (const defaultSource of Object.values(SourceAchat)) {
      const viewModel = toIngredientViewModel(makeIngredient({ defaultSource }));
      expect(viewModel.sourceLabel.length).toBeGreaterThan(0);
    }
  });
});
