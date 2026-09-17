import { expect, test } from '@playwright/test';
import { ensureTestUserId } from './support/auth';

test.describe('Authentification', () => {
  test.skip(
    !process.env.SUPABASE_SECRET_KEY,
    'nécessite SUPABASE_SECRET_KEY (identifiants admin Supabase) pour créer des utilisateurs de test',
  );

  test('un nouveau compte atterrit sur /onboarding après inscription', async ({ page }) => {
    const email = `e2e-signup-${Date.now()}@remy.test`;
    await page.goto('/signup');
    await page.getByLabel('Adresse email').fill(email);
    await page.getByLabel('Code à 6 chiffres').fill('246810');
    await page.getByLabel('Confirme le code').fill('246810');
    await page.getByRole('button', { name: 'Créer mon compte' }).click();
    await expect(page).toHaveURL(/\/onboarding$/);
  });

  test('un mauvais code affiche une erreur sans connecter', async ({ page }) => {
    const email = 'e2e-login-wrong-pin@remy.test';
    await ensureTestUserId(email, '111111');

    await page.goto('/login');
    await page.getByLabel('Adresse email').fill(email);
    await page.getByLabel('Code à 6 chiffres').fill('000000');
    await page.getByRole('button', { name: 'Se connecter' }).click();

    await expect(page.getByText('Email ou code incorrect.')).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });
});
