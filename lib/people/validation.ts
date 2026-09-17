const HOUSEHOLD_NAME_MAX_LENGTH = 60;
const PERSON_NAME_MAX_LENGTH = 40;
const PERSON_NAMES_MAX_COUNT = 12;

export type OnboardingFormValues = {
  householdName: string;
  personNames: string[];
};

export type OnboardingInput = {
  householdName: string;
  personNames: string[];
};

export type OnboardingFieldErrors = Partial<Record<keyof OnboardingFormValues, string>>;

export type OnboardingValidationResult =
  | { ok: true; data: OnboardingInput }
  | { ok: false; errors: OnboardingFieldErrors };

/**
 * Valide le formulaire d'onboarding avant écriture Prisma : nom du foyer et
 * au moins un mangeur. Les lignes de nom vides sont ignorées plutôt que
 * rejetées — c'est l'ajout/retrait de ligne côté formulaire qui gère ça.
 */
export function validateOnboardingInput(values: OnboardingFormValues): OnboardingValidationResult {
  const errors: OnboardingFieldErrors = {};

  const householdName = values.householdName.trim();
  if (!householdName) {
    errors.householdName = 'Le nom du foyer est obligatoire.';
  } else if (householdName.length > HOUSEHOLD_NAME_MAX_LENGTH) {
    errors.householdName = `Le nom dépasse ${HOUSEHOLD_NAME_MAX_LENGTH} caractères.`;
  }

  const personNames: string[] = [];
  let hasTooLongName = false;
  for (const rawName of values.personNames) {
    const name = rawName.trim();
    if (!name) {
      continue;
    }
    if (name.length > PERSON_NAME_MAX_LENGTH) {
      hasTooLongName = true;
      continue;
    }
    personNames.push(name);
  }

  if (hasTooLongName) {
    errors.personNames = `Un nom dépasse ${PERSON_NAME_MAX_LENGTH} caractères.`;
  } else if (personNames.length === 0) {
    errors.personNames = 'Ajoute au moins un mangeur.';
  } else if (personNames.length > PERSON_NAMES_MAX_COUNT) {
    errors.personNames = `Limite ${PERSON_NAMES_MAX_COUNT} mangeurs.`;
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, data: { householdName, personNames } };
}
