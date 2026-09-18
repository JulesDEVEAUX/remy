import { expect, test } from '@playwright/test';
import { signInAsTestUser } from './support/auth';

test.describe('Commentaires et historique de réalisation', () => {
  test.skip(
    !process.env.SUPABASE_SECRET_KEY,
    'nécessite SUPABASE_SECRET_KEY (identifiants admin Supabase) pour authentifier le navigateur de test',
  );

  test('ajouter un commentaire puis marquer une recette comme réalisée met à jour le détail et la liste', async ({
    page,
  }) => {
    // Email stable et réutilisé à chaque run : évite d'accumuler un household
    // orphelin par exécution nocturne sur le projet Supabase réel.
    await signInAsTestUser(page, 'e2e-recipe-history@remy.test');

    const runId = Date.now();
    const ingredientName = `Riz test ${runId}`;
    const recipeName = `Risotto test ${runId}`;
    const commentText = `Un délice, à refaire ${runId}`;

    await page.goto('/ingredients/nouveau');
    await page.getByLabel('Nom').fill(ingredientName);
    await page.getByLabel('Catégorie').selectOption('EPICERIE');
    await page.getByLabel('Unité par défaut').selectOption('g');
    await page.getByLabel('Durée de conservation').selectOption('LONGUE');
    await page.getByLabel("Source d'achat").selectOption('CARREFOUR');
    await page.getByRole('button', { name: 'Ajouter' }).click();
    await expect(page).toHaveURL(/\/ingredients$/);

    await page.goto('/recettes/nouveau');
    await page.getByLabel('Nom').fill(recipeName);
    await page.getByLabel('Instructions').fill('Faire revenir le riz puis mouiller petit à petit.');
    await page.getByRole('combobox', { name: 'Ingrédient' }).selectOption({ label: ingredientName });
    await page.getByLabel('Qté').fill('200');
    await page.getByLabel('Unité').fill('g');
    await page.getByRole('button', { name: 'Ajouter', exact: true }).click();
    await expect(page).toHaveURL(/\/recettes$/);

    // Ligne de la liste scopée par le nom (unique à ce run) : plusieurs recettes
    // d'anciens runs peuvent coexister dans le même foyer de test.
    const listRow = page.locator('a', { hasText: recipeName });

    // Jamais réalisée avant toute action : visible depuis la liste.
    await expect(listRow).toContainText('jamais réalisée');

    await listRow.click();
    await expect(page).toHaveURL(/\/recettes\/.+/);
    await expect(page.getByText('jamais réalisée')).toBeVisible();

    await page.getByLabel('Ajouter un commentaire').fill(commentText);
    await page.getByRole('button', { name: 'Publier' }).click();
    await expect(page.getByText(commentText)).toBeVisible();

    await page.getByRole('button', { name: "Marquer comme réalisée aujourd'hui" }).click();
    await expect(page.getByText("réalisée aujourd'hui")).toBeVisible();

    await page.goto('/recettes');
    await expect(listRow).toContainText("réalisée aujourd'hui");

    // Nettoyage : évite d'accumuler des recettes de test dans le foyer à chaque run.
    await listRow.click();
    await expect(page).toHaveURL(/\/recettes\/.+/);
    await page.getByRole('button', { name: 'Supprimer' }).click();
    await expect(page).toHaveURL(/\/recettes$/);
  });
});
