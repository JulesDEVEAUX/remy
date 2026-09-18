import { expect, test } from '@playwright/test';
import { ensureTestUserId, signInAsTestUser } from './support/auth';
import { resetWeekMealPlans } from './support/planning';

function toDateParam(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Abréviation à 3 lettres du jour (ex. "Lun"), telle qu'affichée sur la pastille de
 * navigation de DaysView (`day.dayLabel.slice(0, 3)`). +7 jours depuis aujourd'hui
 * conserve le jour de semaine du jour du run (cf. commentaire sur startDate plus bas) :
 * la semaine générée ne commence donc PAS forcément un lundi, d'où ce calcul plutôt
 * qu'un libellé "Lundi"/"Mardi" en dur.
 */
function dayPillLabel(date: Date): string {
  const label = date.toLocaleDateString('fr-FR', { weekday: 'long' });
  return (label.charAt(0).toUpperCase() + label.slice(1)).slice(0, 3);
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
    const userId = await ensureTestUserId('e2e-planning@remy.test');
    await signInAsTestUser(page, 'e2e-planning@remy.test');

    const runId = Date.now();
    const ingredientName = `Semoule test ${runId}`;
    const simpleRecipeName = `Tajine test ${runId}`;
    const batchRecipeName = `Chili test ${runId}`;

    await page.goto('/ingredients/nouveau');
    await page.getByLabel('Nom').fill(ingredientName);
    await page.getByLabel('Catégorie').selectOption('EPICERIE');
    await page.getByLabel('Unité par défaut').selectOption('g');
    await page.getByLabel('Durée de conservation').selectOption('LONGUE');
    await page.getByLabel("Source d'achat").selectOption('CARREFOUR');
    await page.getByRole('button', { name: 'Ajouter' }).click();
    await expect(page).toHaveURL(/\/ingredients$/);

    for (const recipeName of [simpleRecipeName, batchRecipeName]) {
      await page.goto('/recettes/nouveau');
      await page.getByLabel('Nom').fill(recipeName);
      await page.getByLabel('Instructions').fill('Préparer puis servir.');
      await page.getByRole('combobox', { name: 'Ingrédient' }).selectOption({ label: ingredientName });
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

    // Repart d'une semaine vide : les compteurs du résumé plus bas (Tag "Batch",
    // "À assigner"...) comptent tous les créneaux de la page, pas seulement ceux de
    // ce run — sans ça, un retry ou un second run nocturne le même jour sur ce
    // household stable fait dériver ces compteurs (créneaux/assignations qui
    // s'accumulent au lieu d'être remplacés).
    await resetWeekMealPlans(userId, startDate);

    // `reconfigurer=1` force l'affichage du formulaire de config même si cette
    // date porte déjà des créneaux d'un run précédent (rejoué le même jour).
    await page.goto(`/planning?start=${startDateParam}&reconfigurer=1`);
    await page.getByLabel('Date de début').fill(startDateParam);
    // { force: true } : l'input radio est en peer sr-only (0x0 visuellement), c'est le
    // <label> englobant (le Tag stylé) qui reçoit le clic natif — Playwright refuse
    // d'y voir une cible actionnable alors que c'est le motif attendu.
    await page.getByLabel('1', { exact: true }).check({ force: true });
    await page.getByRole('button', { name: /Générer la semaine|Mettre à jour la semaine/ }).click();

    await expect(page).toHaveURL(new RegExp(`/planning\\?start=${startDateParam}`));

    const day1Pill = dayPillLabel(startDate);
    const day2Date = new Date(startDate);
    day2Date.setDate(day2Date.getDate() + 1);
    const day2Pill = dayPillLabel(day2Date);

    // Premier créneau (jour 1 de la semaine générée) : une recette assignée simplement,
    // sans batch. Navigue via la pastille de jour (pas le <h2> du panneau, potentiellement
    // hors écran dans le scroller à scroll-snap — Playwright n'arrive pas à cliquer un
    // élément qu'il doit lui-même faire défiler dans ce type de conteneur) : la pastille
    // déclenche le scroll programmatique de l'appli elle-même, plus fiable.
    await page.getByRole('button', { name: day1Pill, exact: true }).click();
    const mondayRow = page.getByText('Aucune recette', { exact: true }).first();
    await mondayRow.click();
    await page.getByText(simpleRecipeName, { exact: true }).click();
    await page.getByRole('button', { name: 'Assigner' }).click();
    await expect(page).toHaveURL(new RegExp(`/planning\\?start=${startDateParam}`));

    // Deuxième créneau (jour 2) : la même recette batch, réutilisée sur un troisième
    // créneau sélectionné dans la liste des autres créneaux.
    await page.getByRole('button', { name: day2Pill, exact: true }).click();
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
