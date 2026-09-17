import { createClient } from '@supabase/supabase-js';
import type { Page } from '@playwright/test';

const TEST_PASSWORD = '135790';

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !secretKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SECRET_KEY sont requis pour les tests e2e.');
  }
  return createClient(supabaseUrl, secretKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

/** Crée l'utilisateur de test s'il n'existe pas déjà (idempotent) et renvoie son id. */
export async function ensureTestUserId(email: string, password = TEST_PASSWORD) {
  const admin = getAdminClient();
  const { data: created } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (created.user) {
    return created.user.id;
  }
  const { data } = await admin.auth.admin.listUsers();
  return data.users.find((user) => user.email === email)?.id;
}

/** Connecte le navigateur de test en rejouant le vrai parcours /login (email + code à 6 chiffres). */
export async function signInAsTestUser(page: Page, email: string, password = TEST_PASSWORD) {
  const admin = getAdminClient();
  await admin.auth.admin.createUser({ email, password, email_confirm: true });

  await page.goto('/login');
  await page.getByLabel('Adresse email').fill(email);
  await page.getByLabel('Code à 6 chiffres').fill(password);
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'));
}
