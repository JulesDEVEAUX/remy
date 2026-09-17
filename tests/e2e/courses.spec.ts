import { expect, test } from '@playwright/test';
import { signInAsTestUser } from './support/auth';

test.describe('Liste de courses', () => {
  test.skip(
    !process.env.SUPABASE_SECRET_KEY,
    'nécessite SUPABASE_SECRET_KEY (identifiants admin Supabase) pour authentifier le navigateur de test',
  );

  test('générer depuis une recette, cocher un item puis vider les cochés', async ({ page }) => {
    // Email stable et réutilisé à chaque run : évite d'accumuler un household
    // orphelin par exécution nocturne sur le projet Supabase réel.
    await signInAsTestUser(page, 'e2e-courses@remy.test');

    const runId = Date.now();
    const carrefourIngredient = `Poulet test ${runId}`;
    const horsCarrefourIngredient = `Farine test ${runId}`;
    const recipeName = `Recette courses test ${runId}`;

    await page.goto('/ingredients/nouveau');
    await page.getByLabel('Nom').fill(carrefourIngredient);
    await page.getByLabel('Catégorie').selectOption('FRAIS');
    await page.getByLabel('Unité par défaut').fill('g');
    await page.getByLabel('Durée de conservation').selectOption('COURTE');
    await page.getByLabel("Source d'achat").selectOption('CARREFOUR');
    await page.getByRole('button', { name: 'Ajouter' }).click();
    await expect(page).toHaveURL(/\/ingredients$/);

    await page.goto('/ingredients/nouveau');
    await page.getByLabel('Nom').fill(horsCarrefourIngredient);
    await page.getByLabel('Catégorie').selectOption('EPICERIE');
    await page.getByLabel('Unité par défaut').fill('g');
    await page.getByLabel('Durée de conservation').selectOption('LONGUE');
    await page.getByLabel("Source d'achat").selectOption('MARCHE');
    await page.getByRole('button', { name: 'Ajouter' }).click();
    await expect(page).toHaveURL(/\/ingredients$/);

    await page.goto('/recettes/nouveau');
    await page.getByLabel('Nom').fill(recipeName);
    await page.getByLabel('Instructions').fill('Cuire le poulet puis lier la sauce avec la farine.');
    await page.getByRole('button', { name: 'Ajouter un ingrédient' }).click();

    const ingredientSelects = page.getByRole('combobox', { name: 'Ingrédient' });
    const quantityInputs = page.getByLabel('Qté');
    const unitInputs = page.getByLabel('Unité');

    await ingredientSelects.nth(0).selectOption({ label: carrefourIngredient });
    await quantityInputs.nth(0).fill('300');
    await unitInputs.nth(0).fill('g');
    await ingredientSelects.nth(1).selectOption({ label: horsCarrefourIngredient });
    await quantityInputs.nth(1).fill('200');
    await unitInputs.nth(1).fill('g');

    await page.getByRole('button', { name: 'Ajouter', exact: true }).click();
    await expect(page).toHaveURL(/\/recettes$/);

    await page.goto('/courses');
    await page.getByLabel(recipeName).check();
    await page.getByRole('button', { name: 'Générer la liste' }).click();

    // Groupée par source d'achat (Carrefour / Hors Carrefour) puis par catégorie.
    await expect(page.getByText('Carrefour', { exact: true })).toBeVisible();
    await expect(page.getByText('Hors Carrefour', { exact: true })).toBeVisible();
    await expect(page.getByText('Frais', { exact: true })).toBeVisible();
    await expect(page.getByText('Épicerie', { exact: true })).toBeVisible();

    const carrefourRow = page.getByRole('button', { name: new RegExp(carrefourIngredient) });
    const horsCarrefourRow = page.getByRole('button', { name: new RegExp(horsCarrefourIngredient) });
    await expect(carrefourRow).toBeVisible();
    await expect(horsCarrefourRow).toBeVisible();
    await expect(carrefourRow).toContainText('300 g');
    await expect(horsCarrefourRow).toContainText('200 g');

    await carrefourRow.click();
    await expect(carrefourRow).toHaveAttribute('aria-pressed', 'true');

    await page.getByRole('button', { name: 'Vider les cochés' }).click();

    await expect(page.getByRole('button', { name: new RegExp(carrefourIngredient) })).not.toBeVisible();
    await expect(page.getByRole('button', { name: new RegExp(horsCarrefourIngredient) })).toBeVisible();
  });
});
