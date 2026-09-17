import { expect, test } from '@playwright/test';
import { signInAsTestUser } from './support/auth';

test.describe('CRUD recettes', () => {
  test.skip(
    !process.env.SUPABASE_SECRET_KEY,
    'nécessite SUPABASE_SECRET_KEY (identifiants admin Supabase) pour authentifier le navigateur de test',
  );

  test('créer, lister, éditer puis supprimer une recette avec ses ingrédients', async ({ page }) => {
    // Email stable et réutilisé à chaque run : évite d'accumuler un household
    // orphelin par exécution nocturne sur le projet Supabase réel.
    await signInAsTestUser(page, 'e2e-recipes@remy.test');

    const runId = Date.now();
    const ingredientNames = [`Lentilles test ${runId}`, `Oignon test ${runId}`, `Cumin test ${runId}`];

    for (const ingredientName of ingredientNames) {
      await page.goto('/ingredients/nouveau');
      await page.getByLabel('Nom').fill(ingredientName);
      await page.getByLabel('Catégorie').selectOption('EPICERIE');
      await page.getByLabel('Unité par défaut').fill('g');
      await page.getByLabel('Durée de conservation').selectOption('LONGUE');
      await page.getByLabel("Source d'achat").selectOption('CARREFOUR');
      await page.getByRole('button', { name: 'Ajouter' }).click();
      await expect(page).toHaveURL(/\/ingredients$/);
    }

    const recipeName = `Curry test ${runId}`;
    const updatedRecipeName = `${recipeName} modifiee`;

    await page.goto('/recettes/nouveau');
    await page.getByLabel('Nom').fill(recipeName);
    await page.getByLabel('Lien source').fill('https://example.com/curry');
    await page.getByLabel('Temps de préparation (min)').fill('30');
    await page.getByLabel('Instructions').fill('Faire revenir les oignons puis mijoter avec les lentilles.');
    await page.getByLabel('Hiver').check();
    await page.getByLabel('Tags (séparés par une virgule)').fill('rapide, végétarien');

    await page.getByRole('button', { name: 'Ajouter un ingrédient' }).click();
    await page.getByRole('button', { name: 'Ajouter un ingrédient' }).click();

    const ingredientSelects = page.getByLabel('Ingrédient');
    const quantityInputs = page.getByLabel('Qté');
    const unitInputs = page.getByLabel('Unité');

    for (let i = 0; i < ingredientNames.length; i += 1) {
      await ingredientSelects.nth(i).selectOption({ label: ingredientNames[i] });
      await quantityInputs.nth(i).fill(String(100 + i * 10));
      await unitInputs.nth(i).fill('g');
    }

    await page.getByRole('button', { name: 'Ajouter', exact: true }).click();

    await expect(page).toHaveURL(/\/recettes$/);
    await expect(page.getByText(recipeName, { exact: true })).toBeVisible();

    await page.getByText(recipeName, { exact: true }).click();
    await expect(page).toHaveURL(/\/recettes\/.+/);
    await page.getByLabel('Nom').fill(updatedRecipeName);
    await page.getByRole('button', { name: 'Enregistrer' }).click();

    await expect(page).toHaveURL(/\/recettes$/);
    await expect(page.getByText(updatedRecipeName, { exact: true })).toBeVisible();

    await page.getByText(updatedRecipeName, { exact: true }).click();
    await expect(page).toHaveURL(/\/recettes\/.+/);
    await page.getByRole('button', { name: 'Supprimer' }).click();

    await expect(page).toHaveURL(/\/recettes$/);
    await expect(page.getByText(updatedRecipeName, { exact: true })).not.toBeVisible();
  });
});
