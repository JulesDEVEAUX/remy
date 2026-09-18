import { expect, test } from '@playwright/test';
import { signInAsTestUser } from './support/auth';

test.describe('CRUD ingrédients', () => {
  test.skip(
    !process.env.SUPABASE_SECRET_KEY,
    'nécessite SUPABASE_SECRET_KEY (identifiants admin Supabase) pour authentifier le navigateur de test',
  );

  test('créer, lister, éditer puis supprimer un ingrédient', async ({ page }) => {
    // Email stable et réutilisé à chaque run : évite d'accumuler un household
    // orphelin par exécution nocturne sur le projet Supabase réel.
    await signInAsTestUser(page, 'e2e-ingredients@remy.test');

    const name = `Farine test ${Date.now()}`;
    const updatedName = `${name} modifiee`;

    await page.goto('/ingredients/nouveau');
    await page.getByLabel('Nom').fill(name);
    await page.getByLabel('Catégorie').selectOption('EPICERIE');
    await page.getByLabel('Unité par défaut').selectOption('g');
    await page.getByLabel('Durée de conservation').selectOption('LONGUE');
    await page.getByLabel("Source d'achat").selectOption('CARREFOUR');
    await page.getByRole('button', { name: 'Ajouter' }).click();

    await expect(page).toHaveURL(/\/ingredients$/);
    await expect(page.getByText(name, { exact: true })).toBeVisible();

    await page.getByText(name, { exact: true }).click();
    await expect(page).toHaveURL(/\/ingredients\/.+/);
    await page.getByLabel('Nom').fill(updatedName);
    await page.getByRole('button', { name: 'Enregistrer' }).click();

    await expect(page).toHaveURL(/\/ingredients$/);
    await expect(page.getByText(updatedName, { exact: true })).toBeVisible();

    await page.getByText(updatedName, { exact: true }).click();
    await expect(page).toHaveURL(/\/ingredients\/.+/);
    await page.getByRole('button', { name: 'Supprimer' }).click();

    await expect(page).toHaveURL(/\/ingredients$/);
    await expect(page.getByText(updatedName, { exact: true })).not.toBeVisible();
  });
});
