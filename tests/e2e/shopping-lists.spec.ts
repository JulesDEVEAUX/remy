import { expect, test } from '@playwright/test';
import { ensureTestUserId, signInAsTestUser } from './support/auth';

test.describe('Plusieurs listes de courses en parallèle', () => {
  test.skip(
    !process.env.SUPABASE_SECRET_KEY,
    'nécessite SUPABASE_SECRET_KEY (identifiants admin Supabase) pour authentifier le navigateur de test',
  );

  test('créer une deuxième liste isole ses articles de la liste par défaut', async ({ page }) => {
    // Email stable et réutilisé à chaque run : évite d'accumuler un household
    // orphelin par exécution nocturne sur le projet Supabase réel.
    const email = 'e2e-shopping-lists@remy.test';
    await ensureTestUserId(email);
    await signInAsTestUser(page, email);

    const runId = Date.now();
    const ingredientName = `Riz test ${runId}`;
    const secondListName = `Liste secondaire ${runId}`;

    await page.goto('/ingredients/nouveau');
    await page.getByLabel('Nom').fill(ingredientName);
    await page.getByLabel('Catégorie').selectOption('EPICERIE');
    await page.getByLabel('Unité par défaut').selectOption('kg');
    await page.getByLabel('Durée de conservation').selectOption('LONGUE');
    await page.getByLabel("Source d'achat").selectOption('CARREFOUR');
    await page.getByRole('button', { name: 'Ajouter' }).click();
    await expect(page).toHaveURL(/\/ingredients$/);

    // La première visite crée implicitement la liste par défaut "Courses".
    // Scopé à <main> : la barre de nav du bas porte aussi un lien "Courses".
    await page.goto('/courses');
    await expect(page.getByRole('main').getByRole('link', { name: 'Courses', exact: true })).toBeVisible();

    await page.getByLabel('Nouvelle liste').fill(secondListName);
    await page.getByRole('button', { name: 'Créer' }).click();
    await expect(page).toHaveURL(/\/courses\?listId=/);
    await expect(page.getByRole('link', { name: secondListName, exact: true })).toBeVisible();

    // Ajout manuel : atterrit dans la liste actuellement affichée (la nouvelle).
    await page.getByRole('combobox', { name: 'Ingrédient' }).selectOption({ label: ingredientName });
    await page.getByLabel('Quantité').fill('2');
    await page.getByLabel('Unité', { exact: true }).fill('kg');
    await page.getByRole('button', { name: 'Ajouter', exact: true }).click();

    const itemRow = page.getByRole('button', { name: new RegExp(ingredientName) });
    await expect(itemRow).toBeVisible();
    await expect(itemRow).toContainText('2 kg');

    // Bascule vers la liste par défaut : l'article ajouté à l'autre liste n'y apparaît pas.
    await page.getByRole('main').getByRole('link', { name: 'Courses', exact: true }).click();
    await expect(page).toHaveURL(/\/courses\?listId=/);
    await expect(page.getByRole('button', { name: new RegExp(ingredientName) })).not.toBeVisible();

    // Retour sur la deuxième liste : l'article y est toujours.
    await page.getByRole('link', { name: secondListName, exact: true }).click();
    await expect(page.getByRole('button', { name: new RegExp(ingredientName) })).toBeVisible();
  });
});