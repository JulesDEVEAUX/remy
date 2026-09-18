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
    subcategory: null,
    defaultUnit: 'g',
    conservation: ConservationDuree.LONGUE,
    defaultSource: SourceAchat.CARREFOUR,
    isPrivate: false,
    emoji: '🌾',
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
    formData.set('subcategory', 'CREMERIE');
    formData.set('defaultUnit', 'L');
    formData.set('conservation', 'COURTE');
    formData.set('defaultSource', 'MARCHE');
    formData.set('isPrivate', 'on');
    formData.set('emoji', '🥛');

    expect(parseIngredientFormData(formData)).toEqual({
      name: 'Lait',
      category: 'FRAIS',
      subcategory: 'CREMERIE',
      defaultUnit: 'L',
      conservation: 'COURTE',
      defaultSource: 'MARCHE',
      isPrivate: true,
      emoji: '🥛',
    });
  });

  it('defaults missing fields to empty strings, and isPrivate to false, instead of throwing', () => {
    expect(parseIngredientFormData(new FormData())).toEqual({
      name: '',
      category: '',
      subcategory: '',
      defaultUnit: '',
      conservation: '',
      defaultSource: '',
      isPrivate: false,
      emoji: '',
    });
  });
});

describe('toIngredientViewModel', () => {
  it('maps identifiers and the default unit through unchanged', () => {
    const viewModel = toIngredientViewModel(makeIngredient({ id: 'ing_42', defaultUnit: 'kg' }));
    expect(viewModel.id).toBe('ing_42');
    expect(viewModel.defaultUnit).toBe('kg');
  });

  it('carries the emoji through unchanged', () => {
    const viewModel = toIngredientViewModel(makeIngredient({ emoji: '🥕' }));
    expect(viewModel.emoji).toBe('🥕');
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

  it('leaves subcategoryLabel null when no subcategory is set', () => {
    const viewModel = toIngredientViewModel(makeIngredient({ subcategory: null }));
    expect(viewModel.subcategoryLabel).toBeNull();
  });

  it('produces a French label for a known subcategory', () => {
    const viewModel = toIngredientViewModel(
      makeIngredient({ category: IngredientCategory.FRAIS, subcategory: 'CREMERIE' }),
    );
    expect(viewModel.subcategoryLabel).toBe('Crèmerie (lait, beurre, fromage, yaourts)');
  });
});
