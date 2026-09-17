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

/** Valide un nom de foyer isolé — réutilisé par l'onboarding et les Paramètres. */
export function validateHouseholdName(rawName: string): { ok: true; data: string } | { ok: false; error: string } {
  const name = rawName.trim();
  if (!name) {
    return { ok: false, error: 'Le nom du foyer est obligatoire.' };
  }
  if (name.length > HOUSEHOLD_NAME_MAX_LENGTH) {
    return { ok: false, error: `Le nom dépasse ${HOUSEHOLD_NAME_MAX_LENGTH} caractères.` };
  }
  return { ok: true, data: name };
}

/** Valide un nom de mangeur isolé — réutilisé par l'onboarding et les Paramètres. */
export function validatePersonName(rawName: string): { ok: true; data: string } | { ok: false; error: string } {
  const name = rawName.trim();
  if (!name) {
    return { ok: false, error: 'Le prénom est obligatoire.' };
  }
  if (name.length > PERSON_NAME_MAX_LENGTH) {
    return { ok: false, error: `Le prénom dépasse ${PERSON_NAME_MAX_LENGTH} caractères.` };
  }
  return { ok: true, data: name };
}

/**
 * Valide le formulaire d'onboarding avant écriture Prisma : nom du foyer et
 * au moins un mangeur. Les lignes de nom vides sont ignorées plutôt que
 * rejetées — c'est l'ajout/retrait de ligne côté formulaire qui gère ça.
 */
export function validateOnboardingInput(values: OnboardingFormValues): OnboardingValidationResult {
  const errors: OnboardingFieldErrors = {};

  const householdNameResult = validateHouseholdName(values.householdName);
  if (!householdNameResult.ok) {
    errors.householdName = householdNameResult.error;
  }

  const personNames: string[] = [];
  let hasTooLongName = false;
  for (const rawName of values.personNames) {
    if (!rawName.trim()) {
      continue;
    }
    const result = validatePersonName(rawName);
    if (!result.ok) {
      hasTooLongName = true;
      continue;
    }
    personNames.push(result.data);
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

  return {
    ok: true,
    data: { householdName: householdNameResult.ok ? householdNameResult.data : values.householdName, personNames },
  };
}
