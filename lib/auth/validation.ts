const PIN_PATTERN = /^\d{6}$/;

export function validatePinFormat(rawPin: string): { ok: true; data: string } | { ok: false; error: string } {
  if (!PIN_PATTERN.test(rawPin)) {
    return { ok: false, error: 'Le code doit contenir exactement 6 chiffres.' };
  }
  return { ok: true, data: rawPin };
}

export type LoginFormValues = { email: string; pin: string };
export type LoginFieldErrors = Partial<Record<keyof LoginFormValues, string>>;
export type LoginValidationResult =
  | { ok: true; data: { email: string; pin: string } }
  | { ok: false; errors: LoginFieldErrors };

export function validateLoginInput(values: LoginFormValues): LoginValidationResult {
  const errors: LoginFieldErrors = {};

  const email = values.email.trim();
  if (!email) {
    errors.email = "L'email est obligatoire.";
  }

  const pinResult = validatePinFormat(values.pin);
  if (!pinResult.ok) {
    errors.pin = pinResult.error;
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, data: { email, pin: values.pin } };
}

export type SignupFormValues = { email: string; pin: string; pinConfirm: string };
export type SignupFieldErrors = Partial<Record<keyof SignupFormValues, string>>;
export type SignupValidationResult =
  | { ok: true; data: { email: string; pin: string } }
  | { ok: false; errors: SignupFieldErrors };

export function validateSignupInput(values: SignupFormValues): SignupValidationResult {
  const errors: SignupFieldErrors = {};

  const email = values.email.trim();
  if (!email) {
    errors.email = "L'email est obligatoire.";
  }

  const pinResult = validatePinFormat(values.pin);
  if (!pinResult.ok) {
    errors.pin = pinResult.error;
  }

  if (values.pin !== values.pinConfirm) {
    errors.pinConfirm = 'Les deux codes ne correspondent pas.';
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, data: { email, pin: values.pin } };
}
