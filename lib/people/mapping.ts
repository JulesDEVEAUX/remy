import type { OnboardingFormValues } from './validation';

/** Extrait les champs bruts du formulaire d'onboarding — aucune validation ici. */
export function parseOnboardingFormData(formData: FormData): OnboardingFormValues {
  return {
    householdName: String(formData.get('householdName') ?? ''),
    personNames: formData.getAll('personName[]').map(String),
  };
}
