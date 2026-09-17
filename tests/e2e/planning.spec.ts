import { expect, test } from '@playwright/test';
import { signInAsTestUser } from './support/auth';

function toDateParam(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

test.describe('Planning hebdo', () => {
  test.skip(
    !process.env.SUPABASE_SECRET_KEY,
    'nécessite SUPABASE_SECRET_KEY (identifiants admin Supabase) pour authentifier le navigateur de test',
  );

  test('configurer une semaine, assigner une recette, marquer un batch sur 2 créneaux puis vérifier le résumé', async ({
    page,
  }) => {
    // Email stable et réutilisé à chaque run : évite d'accumuler un household
    // orphelin par exécution nocturne sur le projet Supabase réel.
    await signInAsTestUser(page, 'e2e-planning@remy.test');

    const runId = Date.now();
    const ingredientName = `Semoule test ${runId}`;
    const simpleRecipeName = `Tajine test ${runId}`;
    const batchRecipeName = `Chili test ${runId}`;

    await page.goto('/ingredients/nouveau');
    await page.getByLabel('Nom').fill(ingredientName);
    await page.getByLabel('Catégorie').selectOption('EPICERIE');
    await page.getByLabel('Unité par défaut').fill('g');
    await page.getByLabel('Durée de conservation').selectOption('LONGUE');
    await page.getByLabel("Source d'achat").selectOption('CARREFOUR');
    await page.getByRole('button', { name: 'Ajouter' }).click();
    await expect(page).toHaveURL(/\/ingredients$/);

    for (const recipeName of [simpleRecipeName, batchRecipeName]) {
      await page.goto('/recettes/nouveau');
      await page.getByLabel('Nom').fill(recipeName);
      await page.getByLabel('Instructions').fill('Préparer puis servir.');
      await page.getByLabel('Ingrédient').selectOption({ label: ingredientName });
      await page.getByLabel('Qté').fill('200');
      await page.getByLabel('Unité').fill('g');
      await page.getByRole('button', { name: 'Ajouter', exact: true }).click();
      await expect(page).toHaveURL(/\/recettes$/);
    }

    // Date de début à une semaine du jour du run : change chaque jour, donc pas
    // de collision entre deux runs nocturnes successifs sur le même household.
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 7);
    const startDateParam = toDateParam(startDate);

    // `reconfigurer=1` force l'affichage du formulaire de config même si cette
    // date porte déjà des créneaux d'un run précédent (rejoué le même jour).
    await page.goto(`/planning?start=${startDateParam}&reconfigurer=1`);
    await page.getByLabel('Date de début').fill(startDateParam);
    await page.getByLabel('1', { exact: true }).check();
    await page.getByRole('button', { name: /Générer la semaine|Mettre à jour la semaine/ }).click();

    await expect(page).toHaveURL(new RegExp(`/planning\\?start=${startDateParam}`));

    // Premier créneau (lundi) : une recette assignée simplement, sans batch.
    await page.getByText('Lundi', { exact: true }).click();
    const mondayRow = page.getByText('Aucune recette', { exact: true }).first();
    await mondayRow.click();
    await page.getByText(simpleRecipeName, { exact: true }).click();
    await page.getByRole('button', { name: 'Assigner' }).click();
    await expect(page).toHaveURL(new RegExp(`/planning\\?start=${startDateParam}`));

    // Deuxième créneau (mardi) : la même recette batch, réutilisée sur un
    // troisième créneau (mercredi) sélectionné dans la liste des autres créneaux.
    await page.getByText('Mardi', { exact: true }).click();
    await page.getByText('Aucune recette', { exact: true }).first().click();
    await page.getByText(batchRecipeName, { exact: true }).click();
    await page.getByLabel('Batch cooking').check();
    await page.locator('input[name="additionalSlotIds[]"]').first().check();
    await page.getByRole('button', { name: 'Assigner' }).click();
    await expect(page).toHaveURL(new RegExp(`/planning\\?start=${startDateParam}`));

    // Résumé : la recette simple une fois, la recette batch deux fois avec le
    // tag Batch, et un indicateur « À assigner » sur les créneaux restés vides.
    await page.goto(`/planning?start=${startDateParam}&view=resume`);
    await expect(page.getByText(simpleRecipeName, { exact: true })).toHaveCount(1);
    await expect(page.getByText(batchRecipeName, { exact: true })).toHaveCount(2);
    await expect(page.getByText('Batch', { exact: true })).toHaveCount(2);
    await expect(page.getByText('À assigner', { exact: true })).toHaveCount(4);
  });
});
