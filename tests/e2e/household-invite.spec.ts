import { expect, test } from '@playwright/test';
import { ensureTestUserId, signInAsTestUser } from './support/auth';
import { ensureHouseholdHasPerson, getInviteCode } from './support/household';

test.describe('Inviter un compte sur son foyer', () => {
  test.skip(
    !process.env.SUPABASE_SECRET_KEY,
    'nécessite SUPABASE_SECRET_KEY (identifiants admin Supabase) pour authentifier le navigateur de test',
  );

  test("s'inscrire avec un code d'invitation rejoint le foyer plutôt que d'en créer un nouveau", async ({ page }) => {
    // Email stable et réutilisé à chaque run côté foyer hôte ; email neuf à
    // chaque run côté compte invité, une vraie inscription ne pouvant pas
    // réutiliser un email déjà enregistré.
    const hostEmail = 'e2e-invite-host@remy.test';
    const hostUserId = await ensureTestUserId(hostEmail);
    await ensureHouseholdHasPerson(hostUserId);

    await signInAsTestUser(page, hostEmail);
    await page.goto('/parametres');

    const inviteCode = await getInviteCode(page);

    const runId = Date.now();
    const guestEmail = `e2e-invite-guest-${runId}@remy.test`;

    await page.goto('/signup');
    await page.getByLabel('Adresse email').fill(guestEmail);
    await page.getByLabel('Code à 6 chiffres').fill('135790');
    await page.getByLabel('Confirme le code').fill('135790');
    await page.getByLabel("Code d'invitation (si tu rejoins un foyer)").fill(inviteCode);
    await page.getByRole('button', { name: 'Créer mon compte' }).click();

    // Le foyer hôte a déjà au moins un mangeur : l'invité passe par /onboarding
    // sans s'y arrêter, preuve qu'il a rejoint un foyer déjà configuré plutôt
    // que d'atterrir sur la configuration d'un foyer vierge.
    await expect(page).toHaveURL(/\/$/);

    await page.goto('/parametres');
    await expect(page.getByLabel('Nom du foyer')).toHaveValue('Mon foyer');

    await page.getByLabel('Ajouter un mangeur').fill(`Invité test ${runId}`);
    await page.getByRole('button', { name: 'Ajouter', exact: true }).click();
    const guestRow = page.getByText(`Invité test ${runId}`, { exact: true }).locator('..');
    await guestRow.getByRole('checkbox').check();
    await expect(guestRow.getByRole('checkbox')).toBeChecked();
  });
});