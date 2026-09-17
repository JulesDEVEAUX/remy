import { describe, expect, it } from 'vitest';
import { validateOnboardingInput, type OnboardingFormValues } from '@/lib/people/validation';

const validValues: OnboardingFormValues = {
  householdName: 'Mon foyer',
  personNames: ['Alex', 'Sam'],
};

describe('validateOnboardingInput', () => {
  it('accepts fully valid values and normalizes trimmed fields', () => {
    const result = validateOnboardingInput({
      householdName: '  Mon foyer  ',
      personNames: [' Alex ', ' Sam '],
    });

    expect(result).toEqual({
      ok: true,
      data: { householdName: 'Mon foyer', personNames: ['Alex', 'Sam'] },
    });
  });

  it('drops blank rows instead of rejecting them', () => {
    const result = validateOnboardingInput({ ...validValues, personNames: ['Alex', '   ', ''] });
    expect(result).toEqual({
      ok: true,
      data: { householdName: 'Mon foyer', personNames: ['Alex'] },
    });
  });

  it('rejects an empty household name', () => {
    const result = validateOnboardingInput({ ...validValues, householdName: '   ' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.householdName).toBeDefined();
    }
  });

  it('rejects a household name longer than 60 characters', () => {
    const result = validateOnboardingInput({ ...validValues, householdName: 'a'.repeat(61) });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.householdName).toBeDefined();
    }
  });

  it('rejects when no person name remains after trimming', () => {
    const result = validateOnboardingInput({ ...validValues, personNames: ['   ', ''] });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.personNames).toBeDefined();
    }
  });

  it('rejects a person name longer than 40 characters', () => {
    const result = validateOnboardingInput({ ...validValues, personNames: ['a'.repeat(41)] });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.personNames).toBeDefined();
    }
  });

  it('rejects more than 12 mangeurs', () => {
    const result = validateOnboardingInput({
      ...validValues,
      personNames: Array.from({ length: 13 }, (_, i) => `Personne ${i}`),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.personNames).toBeDefined();
    }
  });

  it('reports every invalid field at once', () => {
    const result = validateOnboardingInput({ householdName: '', personNames: [] });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.errors).sort()).toEqual(['householdName', 'personNames'].sort());
    }
  });
});
