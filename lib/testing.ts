/** Domaine réservé aux comptes e2e (cf. tests/e2e/support/auth.ts) — jamais un email réel. */
const TEST_EMAIL_DOMAIN = '@remy.test';

/** Un compte de test e2e, à distinguer d'un utilisateur réel (cf. issue #66). */
export function isTestEmail(email: string | null | undefined): boolean {
  return email?.toLowerCase().endsWith(TEST_EMAIL_DOMAIN) ?? false;
}