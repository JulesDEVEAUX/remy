import { expect, test } from '@playwright/test';
import { signInAsTestUser } from './support/auth';

test.describe('Gestion du stock', () => {
  test.skip(
    !process.env.SUPABASE_SECRET_KEY,
    'nécessite SUPABASE_SECRET_KEY (identifiants admin Supabase) pour authentifier le navigateur de test',
  );

  test('ajouter, voir dans la liste triée, ajuster la quantité puis retirer un item', async ({ page }) => {
    // Email stable et réutilisé à chaque run : évite d'accumuler un household
    // orphelin par exécution nocturne sur le projet Supabase réel.
    await signInAsTestUser(page, 'e2e-stock@remy.test');

    const runId = Date.now();
    const soonName = `Yaourts test ${runId}`;
    const laterName = `Riz test ${runId}`;

    await page.goto('/ingredients/nouveau');
    await page.getByLabel('Nom').fill(soonName);
    await page.getByLabel('Catégorie').selectOption('FRAIS');
    await page.getByLabel('Unité par défaut').fill('pot');
    await page.getByLabel('Durée de conservation').selectOption('COURTE');
    await page.getByLabel("Source d'achat").selectOption('MARCHE');
    await page.getByRole('button', { name: 'Ajouter' }).click();
    await expect(page).toHaveURL(/\/ingredients$/);

    await page.goto('/ingredients/nouveau');
    await page.getByLabel('Nom').fill(laterName);
    await page.getByLabel('Catégorie').selectOption('EPICERIE');
    await page.getByLabel('Unité par défaut').fill('kg');
    await page.getByLabel('Durée de conservation').selectOption('LONGUE');
    await page.getByLabel("Source d'achat").selectOption('CARREFOUR');
    await page.getByRole('button', { name: 'Ajouter' }).click();
    await expect(page).toHaveURL(/\/ingredients$/);

    // Stocke d'abord le produit à conservation longue, puis celui à conservation
    // courte sans date de péremption saisie : si le tri par urgence fonctionne, le
    // second (estimation plus proche) doit malgré tout apparaître avant dans la liste.
    await page.goto('/stock/nouveau');
    await page.getByRole('combobox', { name: 'Ingrédient' }).selectOption({ label: laterName });
    await page.getByLabel('Quantité').fill('2');
    await page.getByLabel('Unité').fill('kg');
    await page.getByRole('button', { name: 'Ajouter' }).click();
    await expect(page).toHaveURL(/\/stock$/);

    await page.goto('/stock/nouveau');
    await page.getByRole('combobox', { name: 'Ingrédient' }).selectOption({ label: soonName });
    await page.getByLabel('Quantité').fill('4');
    await page.getByLabel('Unité').fill('pot');
    await page.getByRole('button', { name: 'Ajouter' }).click();
    await expect(page).toHaveURL(/\/stock$/);

    await expect(page.getByText(soonName, { exact: true })).toBeVisible();
    await expect(page.getByText(laterName, { exact: true })).toBeVisible();
    const listText = await page.locator('main').innerText();
    expect(listText.indexOf(soonName)).toBeLessThan(listText.indexOf(laterName));

    await page.getByText(soonName, { exact: true }).click();
    await expect(page).toHaveURL(/\/stock\/.+/);
    await page.getByLabel('Quantité').fill('6');
    await page.getByRole('button', { name: 'Enregistrer' }).click();

    await expect(page).toHaveURL(/\/stock$/);
    await expect(page.getByText('6 pot', { exact: true })).toBeVisible();

    await page.getByText(soonName, { exact: true }).click();
    await expect(page).toHaveURL(/\/stock\/.+/);
    await page.getByRole('button', { name: 'Retirer' }).click();

    await expect(page).toHaveURL(/\/stock$/);
    await expect(page.getByText(soonName, { exact: true })).not.toBeVisible();
  });
});
