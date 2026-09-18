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
    // La sous-catégorie (issue #67) dépend de la catégorie choisie juste avant :
    // le menu déroulant n'apparaît qu'une fois une catégorie sélectionnée.
    await page.getByLabel('Sous-catégorie').selectOption('PATES_RIZ_CEREALES');
    await page.getByLabel('Unité par défaut').selectOption('g');
    await page.getByLabel('Durée de conservation').selectOption('LONGUE');
    await page.getByLabel("Source d'achat").selectOption('CARREFOUR');
    await page.getByRole('button', { name: 'Ajouter' }).click();

    await expect(page).toHaveURL(/\/ingredients$/);
    await expect(page.getByText(name, { exact: true })).toBeVisible();
    await expect(page.getByText('Pâtes, riz et céréales')).toBeVisible();

    await page.getByText(name, { exact: true }).click();
    await expect(page).toHaveURL(/\/ingredients\/.+/);
    // La sous-catégorie choisie à la création reste sélectionnée à l'édition.
    await expect(page.getByLabel('Sous-catégorie')).toHaveValue('PATES_RIZ_CEREALES');
    // Changer de catégorie recalcule la liste de sous-catégories proposées et vide le choix précédent.
    await page.getByLabel('Catégorie').selectOption('FRAIS');
    await expect(page.getByLabel('Sous-catégorie')).toHaveValue('');
    await page.getByLabel('Sous-catégorie').selectOption('FRUITS_LEGUMES');
    await page.getByLabel('Nom').fill(updatedName);
    await page.getByRole('button', { name: 'Enregistrer' }).click();

    await expect(page).toHaveURL(/\/ingredients$/);
    await expect(page.getByText(updatedName, { exact: true })).toBeVisible();
    await expect(page.getByText('Fruits et légumes')).toBeVisible();

    await page.getByText(updatedName, { exact: true }).click();
    await expect(page).toHaveURL(/\/ingredients\/.+/);
    await page.getByRole('button', { name: 'Supprimer' }).click();

    await expect(page).toHaveURL(/\/ingredients$/);
    await expect(page.getByText(updatedName, { exact: true })).not.toBeVisible();
  });
});
