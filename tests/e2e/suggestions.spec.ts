import { expect, test } from '@playwright/test';
import { signInAsTestUser } from './support/auth';

test.describe('Suggestions de recettes', () => {
  test.skip(
    !process.env.SUPABASE_SECRET_KEY,
    'nécessite SUPABASE_SECRET_KEY (identifiants admin Supabase) pour authentifier le navigateur de test',
  );

  test('une recette entièrement couverte par le stock apparaît en tête des suggestions', async ({ page }) => {
    // Email stable et réutilisé à chaque run : évite d'accumuler un household
    // orphelin par exécution nocturne sur le projet Supabase réel.
    await signInAsTestUser(page, 'e2e-suggestions@remy.test');

    const runId = Date.now();
    const coveredIngredientName = `Pâtes test ${runId}`;
    const missingIngredientName = `Safran test ${runId}`;
    const coveredRecipeName = `Pâtes au beurre test ${runId}`;
    const uncoveredRecipeName = `Risotto au safran test ${runId}`;

    await page.goto('/ingredients/nouveau');
    await page.getByLabel('Nom').fill(coveredIngredientName);
    await page.getByLabel('Catégorie').selectOption('EPICERIE');
    await page.getByLabel('Unité par défaut').fill('g');
    await page.getByLabel('Durée de conservation').selectOption('LONGUE');
    await page.getByLabel("Source d'achat").selectOption('CARREFOUR');
    await page.getByRole('button', { name: 'Ajouter' }).click();
    await expect(page).toHaveURL(/\/ingredients$/);

    await page.goto('/ingredients/nouveau');
    await page.getByLabel('Nom').fill(missingIngredientName);
    await page.getByLabel('Catégorie').selectOption('EPICERIE');
    await page.getByLabel('Unité par défaut').fill('g');
    await page.getByLabel('Durée de conservation').selectOption('LONGUE');
    await page.getByLabel("Source d'achat").selectOption('CARREFOUR');
    await page.getByRole('button', { name: 'Ajouter' }).click();
    await expect(page).toHaveURL(/\/ingredients$/);

    // Recette entièrement couverte par le stock ajouté plus bas.
    await page.goto('/recettes/nouveau');
    await page.getByLabel('Nom').fill(coveredRecipeName);
    await page.getByLabel('Instructions').fill('Cuire les pâtes puis ajouter le beurre.');
    const coveredIngredientSelect = page.getByLabel('Ingrédient');
    await coveredIngredientSelect.selectOption({ label: coveredIngredientName });
    await page.getByLabel('Qté').fill('200');
    await page.getByLabel('Unité').fill('g');
    await page.getByRole('button', { name: 'Ajouter', exact: true }).click();
    await expect(page).toHaveURL(/\/recettes$/);

    // Recette dont l'ingrédient n'est jamais mis en stock.
    await page.goto('/recettes/nouveau');
    await page.getByLabel('Nom').fill(uncoveredRecipeName);
    await page.getByLabel('Instructions').fill('Faire revenir le riz puis ajouter le safran.');
    const uncoveredIngredientSelect = page.getByLabel('Ingrédient');
    await uncoveredIngredientSelect.selectOption({ label: missingIngredientName });
    await page.getByLabel('Qté').fill('1');
    await page.getByLabel('Unité').fill('g');
    await page.getByRole('button', { name: 'Ajouter', exact: true }).click();
    await expect(page).toHaveURL(/\/recettes$/);

    await page.goto('/stock/nouveau');
    await page.getByLabel('Ingrédient').selectOption({ label: coveredIngredientName });
    await page.getByLabel('Quantité').fill('500');
    await page.getByLabel('Unité').fill('g');
    await page.getByRole('button', { name: 'Ajouter' }).click();
    await expect(page).toHaveURL(/\/stock$/);

    await page.goto('/suggestions');

    await expect(page.getByText(coveredRecipeName, { exact: true })).toBeVisible();
    await expect(page.getByText(uncoveredRecipeName, { exact: true })).toBeVisible();
    const listText = await page.locator('main').innerText();
    expect(listText.indexOf(coveredRecipeName)).toBeLessThan(listText.indexOf(uncoveredRecipeName));
  });
});
