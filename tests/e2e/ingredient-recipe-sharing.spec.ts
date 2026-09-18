import { expect, test } from '@playwright/test';
import { ensureTestUserId, signInAsTestUser } from './support/auth';

test.describe('Catalogue partagé d’ingrédients et de recettes entre foyers', () => {
  test.skip(
    !process.env.SUPABASE_SECRET_KEY,
    'nécessite SUPABASE_SECRET_KEY (identifiants admin Supabase) pour authentifier le navigateur de test',
  );

  test('un ingrédient et une recette publics créés par un foyer sont réutilisables par un autre', async ({ page }) => {
    // Emails stables et réutilisés à chaque run, sur deux foyers distincts.
    const emailA = 'e2e-sharing-a@remy.test';
    const emailB = 'e2e-sharing-b@remy.test';
    await ensureTestUserId(emailA);
    await ensureTestUserId(emailB);

    const runId = Date.now();
    const ingredientName = `Miel test ${runId}`;
    const recipeName = `Tisane au miel test ${runId}`;

    // Foyer A : crée un ingrédient et une recette, tous deux publics par défaut.
    await signInAsTestUser(page, emailA);

    await page.goto('/ingredients/nouveau');
    await page.getByLabel('Nom').fill(ingredientName);
    await page.getByLabel('Catégorie').selectOption('EPICERIE');
    await page.getByLabel('Unité par défaut').selectOption('g');
    await page.getByLabel('Durée de conservation').selectOption('LONGUE');
    await page.getByLabel("Source d'achat").selectOption('MARCHE');
    await expect(page.getByLabel('Ingrédient privé')).not.toBeChecked();
    await page.getByRole('button', { name: 'Ajouter' }).click();
    await expect(page).toHaveURL(/\/ingredients$/);

    await page.goto('/recettes/nouveau');
    await page.getByLabel('Nom').fill(recipeName);
    await page.getByLabel('Instructions').fill('Faire infuser le miel dans une eau chaude.');
    await page.getByRole('combobox', { name: 'Ingrédient' }).selectOption({ label: ingredientName });
    await page.getByLabel('Qté').fill('20');
    await page.getByLabel('Unité').fill('g');
    await expect(page.getByLabel('Recette privée')).not.toBeChecked();
    await page.getByRole('button', { name: 'Ajouter', exact: true }).click();
    await expect(page).toHaveURL(/\/recettes$/);

    // Foyer B : ne possède ni l'ingrédient ni la recette, doit pourtant les voir.
    await signInAsTestUser(page, emailB);

    await page.goto('/stock/nouveau');
    await expect(
      page.getByRole('combobox', { name: 'Ingrédient' }).getByRole('option', { name: ingredientName }),
    ).toHaveCount(1);

    await page.goto('/recettes');
    await expect(page.getByText("Recettes partagées par d'autres foyers")).toBeVisible();
    await page.getByRole('link', { name: new RegExp(recipeName) }).click();

    await expect(page).toHaveURL(/\/recettes\//);
    await expect(page.getByText('Public', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Enregistrer', exact: true })).not.toBeVisible();
    await page.getByRole('button', { name: 'Ajouter à mon foyer' }).click();

    // La recette clonée appartient maintenant au foyer B : édition complète disponible.
    await expect(page.getByRole('button', { name: 'Enregistrer', exact: true })).toBeVisible();

    await page.goto('/recettes');
    await expect(page.getByRole('link', { name: new RegExp(recipeName) })).toHaveCount(2);
  });

  test("un ingrédient et une recette publics créés par un foyer de test ne sont pas visibles par un foyer réel", async ({
    page,
  }) => {
    // Foyer A : un compte e2e classique (@remy.test), donc un foyer de test (cf. issue #66).
    const emailA = 'e2e-sharing-a@remy.test';
    await ensureTestUserId(emailA);

    // Foyer « réel » : email hors du domaine réservé aux tests e2e, pour que
    // getCurrentHousehold() le crée avec isTestHousehold=false, comme un vrai utilisateur.
    const emailReal = 'e2e-real-household@example.com';
    await ensureTestUserId(emailReal);

    const runId = Date.now();
    const ingredientName = `Safran test ${runId}`;
    const recipeName = `Riz au safran test ${runId}`;

    await signInAsTestUser(page, emailA);

    await page.goto('/ingredients/nouveau');
    await page.getByLabel('Nom').fill(ingredientName);
    await page.getByLabel('Catégorie').selectOption('EPICERIE');
    await page.getByLabel('Unité par défaut').selectOption('g');
    await page.getByLabel('Durée de conservation').selectOption('LONGUE');
    await page.getByLabel("Source d'achat").selectOption('MARCHE');
    await page.getByRole('button', { name: 'Ajouter' }).click();
    await expect(page).toHaveURL(/\/ingredients$/);

    await page.goto('/recettes/nouveau');
    await page.getByLabel('Nom').fill(recipeName);
    await page.getByLabel('Instructions').fill('Cuire le riz avec le safran.');
    await page.getByRole('combobox', { name: 'Ingrédient' }).selectOption({ label: ingredientName });
    await page.getByLabel('Qté').fill('1');
    await page.getByLabel('Unité').fill('g');
    await page.getByRole('button', { name: 'Ajouter', exact: true }).click();
    await expect(page).toHaveURL(/\/recettes$/);

    // Foyer réel : ne doit voir ni l'ingrédient ni la recette du foyer de test.
    await signInAsTestUser(page, emailReal);

    await page.goto('/stock/nouveau');
    await expect(
      page.getByRole('combobox', { name: 'Ingrédient' }).getByRole('option', { name: ingredientName }),
    ).toHaveCount(0);

    await page.goto('/recettes');
    await expect(page.getByRole('link', { name: new RegExp(recipeName) })).toHaveCount(0);
  });
});