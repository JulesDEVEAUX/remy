import { expect, test } from '@playwright/test';
import { ensureTestUserId, signInAsTestUser } from './support/auth';
import { resetHouseholdPeople } from './support/household';

test.describe('Onboarding foyer', () => {
  test.skip(
    !process.env.SUPABASE_SECRET_KEY,
    'nécessite SUPABASE_SECRET_KEY (identifiants admin Supabase) pour authentifier le navigateur de test',
  );

  test('un foyer sans mangeur est redirigé vers /onboarding puis atterrit sur / une fois complété', async ({
    page,
  }) => {
    // Email stable réutilisé à chaque run : on force le foyer à repartir sans
    // aucun Person avant de se connecter, pour que /login redirige vers
    // /onboarding de façon reproductible.
    const email = 'e2e-onboarding@remy.test';
    const userId = await ensureTestUserId(email);
    await resetHouseholdPeople(userId);

    await signInAsTestUser(page, email);
    await expect(page).toHaveURL(/\/onboarding$/);

    const runId = Date.now();
    await page.getByLabel('Nom du foyer').fill(`Foyer test ${runId}`);
    await page.getByLabel('Prénom').fill('Alex');
    await page.getByRole('button', { name: 'Ajouter un mangeur' }).click();
    await page.getByLabel('Prénom').nth(1).fill('Sam');
    await page.getByRole('button', { name: 'Continuer' }).click();

    await expect(page).toHaveURL(/\/$/);

    // Un foyer déjà onboardé ne doit plus repasser par l'écran.
    await page.goto('/onboarding');
    await expect(page).toHaveURL(/\/$/);
  });
});
