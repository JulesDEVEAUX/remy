import { expect, test } from '@playwright/test';
import { ensureTestUserId, signInAsTestUser } from './support/auth';

test.describe('Besoins récurrents du foyer', () => {
  test.skip(
    !process.env.SUPABASE_SECRET_KEY,
    'nécessite SUPABASE_SECRET_KEY (identifiants admin Supabase) pour authentifier le navigateur de test',
  );

  test('déclarer un besoin récurrent puis générer la liste de courses en tient compte', async ({ page }) => {
    // Email stable et réutilisé à chaque run : évite d'accumuler un household
    // orphelin par exécution nocturne sur le projet Supabase réel.
    const email = 'e2e-household-needs@remy.test';
    await ensureTestUserId(email);
    await signInAsTestUser(page, email);

    const runId = Date.now();
    const ingredientName = `Huile test ${runId}`;

    await page.goto('/ingredients/nouveau');
    await page.getByLabel('Nom').fill(ingredientName);
    await page.getByLabel('Catégorie').selectOption('EPICERIE');
    await page.getByLabel('Unité par défaut').fill('L');
    await page.getByLabel('Durée de conservation').selectOption('LONGUE');
    await page.getByLabel("Source d'achat").selectOption('MARCHE');
    await page.getByRole('button', { name: 'Ajouter' }).click();
    await expect(page).toHaveURL(/\/ingredients$/);

    await page.goto('/parametres');
    // 30,4375 j/mois (moyenne) : donne un équivalent hebdo rond de 7 L, simple à vérifier.
    await page.getByLabel('Produit').selectOption({ label: ingredientName });
    await page.getByLabel('Quantité / mois').fill('30.4375');
    await page.getByLabel('Unité', { exact: true }).fill('L');
    await page.getByRole('button', { name: 'Ajouter' }).click();

    const needRow = page.getByText(ingredientName, { exact: true }).locator('..');
    await expect(needRow).toContainText('30.4375 L / mois');

    await page.goto('/courses');
    await expect(page.getByText('Inclut aussi tes besoins récurrents')).toBeVisible();
    await page.getByRole('button', { name: 'Générer la liste' }).click();

    const generatedRow = page.getByRole('button', { name: new RegExp(ingredientName) });
    await expect(generatedRow).toBeVisible();
    await expect(generatedRow).toContainText('7 L');
  });
});