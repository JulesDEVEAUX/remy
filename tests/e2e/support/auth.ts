import { createClient } from '@supabase/supabase-js';
import type { Page } from '@playwright/test';

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !secretKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SECRET_KEY sont requis pour les tests e2e.');
  }
  return createClient(supabaseUrl, secretKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

/** Crée l'utilisateur de test s'il n'existe pas déjà (idempotent) et renvoie son id. */
export async function ensureTestUserId(email: string) {
  const admin = getAdminClient();
  const { data: created } = await admin.auth.admin.createUser({ email, email_confirm: true });
  if (created.user) {
    return created.user.id;
  }
  const { data } = await admin.auth.admin.listUsers();
  return data.users.find((user) => user.email === email)?.id;
}

/**
 * Connecte le navigateur de test comme un utilisateur Supabase donné, en
 * rejouant le même parcours que le lien magique (via l'API admin, sans email
 * réel) : /auth/confirm pose le cookie de session comme en production.
 */
export async function signInAsTestUser(page: Page, email: string) {
  const admin = getAdminClient();
  await admin.auth.admin.createUser({ email, email_confirm: true });
  const { data, error } = await admin.auth.admin.generateLink({ type: 'magiclink', email });
  if (error) {
    throw error;
  }

  await page.goto(
    `/auth/confirm?token_hash=${data.properties.hashed_token}&type=${data.properties.verification_type}`,
  );
}
