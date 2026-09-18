import { expect, test } from '@playwright/test';
import { ensureTestUserId, signInAsTestUser } from './support/auth';
import { ensureHouseholdHasPerson, getInviteCode } from './support/household';

test.describe('Visibilité des ingrédients et recettes privés au sein d’un même foyer (issue #69)', () => {
  test.skip(
    !process.env.SUPABASE_SECRET_KEY,
    'nécessite SUPABASE_SECRET_KEY (identifiants admin Supabase) pour authentifier le navigateur de test',
  );

  test('un ingrédient ou une recette marqués privés restent visibles par tous les comptes du foyer', async ({
    page,
  }) => {
    // Email hôte stable et réutilisé à chaque run ; email invité neuf à chaque run, une
    // vraie inscription ne pouvant pas réutiliser un email déjà enregistré (cf.
    // household-invite.spec.ts).
    const hostEmail = 'e2e-private-visibility-host@remy.test';
    const hostUserId = await ensureTestUserId(hostEmail);
    await ensureHouseholdHasPerson(hostUserId);

    await signInAsTestUser(page, hostEmail);
    await page.goto('/parametres');
    const inviteCode = await getInviteCode(page);

    const runId = Date.now();
    const guestEmail = `e2e-private-visibility-guest-${runId}@remy.test`;

    await page.goto('/signup');
    await page.getByLabel('Adresse email').fill(guestEmail);
    await page.getByLabel('Code à 6 chiffres').fill('135790');
    await page.getByLabel('Confirme le code').fill('135790');
    await page.getByLabel("Code d'invitation (si tu rejoins un foyer)").fill(inviteCode);
    await page.getByRole('button', { name: 'Créer mon compte' }).click();
    await expect(page).toHaveURL(/\/$/);

    // L'invité crée un ingrédient et une recette privés.
    const guestIngredient = `Poivre invité privé ${runId}`;
    const guestRecipe = `Poulet au poivre invité ${runId}`;

    await page.goto('/ingredients/nouveau');
    await page.getByLabel('Nom').fill(guestIngredient);
    await page.getByLabel('Catégorie').selectOption('EPICERIE');
    await page.getByLabel('Unité par défaut').selectOption('g');
    await page.getByLabel('Durée de conservation').selectOption('LONGUE');
    await page.getByLabel("Source d'achat").selectOption('MARCHE');
    await page.getByLabel('Ingrédient privé').check();
    await page.getByRole('button', { name: 'Ajouter' }).click();
    await expect(page).toHaveURL(/\/ingredients$/);

    await page.goto('/recettes/nouveau');
    await page.getByLabel('Nom').fill(guestRecipe);
    await page.getByLabel('Instructions').fill('Saisir le poulet, ajouter le poivre.');
    await page.getByRole('combobox', { name: 'Ingrédient' }).selectOption({ label: guestIngredient });
    await page.getByLabel('Qté').fill('2');
    await page.getByLabel('Unité').fill('g');
    await page.getByLabel('Recette privée').check();
    await page.getByRole('button', { name: 'Ajouter', exact: true }).click();
    await expect(page).toHaveURL(/\/recettes$/);

    // L'hôte, autre compte du même foyer, doit voir ces deux éléments privés comme les siens
    // propres — dans sa liste (pas dans la section « partagée par d'autres foyers »), avec
    // les droits d'édition complets.
    await signInAsTestUser(page, hostEmail);

    await page.goto('/ingredients');
    const hostIngredientRow = page.getByText(guestIngredient, { exact: true }).locator('..');
    await expect(hostIngredientRow.getByText('Privé', { exact: true })).toBeVisible();

    await page.goto('/recettes');
    await expect(page.getByText("Recettes partagées par d'autres foyers")).not.toBeVisible();
    await page.getByRole('link', { name: new RegExp(guestRecipe) }).click();
    await expect(page).toHaveURL(/\/recettes\//);
    await expect(page.getByRole('button', { name: 'Enregistrer', exact: true })).toBeVisible();
    await expect(page.getByLabel('Recette privée')).toBeChecked();

    // Symétriquement : un ingrédient et une recette privés créés par l'hôte doivent être
    // visibles par l'invité.
    const hostIngredient = `Safran hôte privé ${runId}`;
    const hostRecipe = `Risotto au safran hôte ${runId}`;

    await page.goto('/ingredients/nouveau');
    await page.getByLabel('Nom').fill(hostIngredient);
    await page.getByLabel('Catégorie').selectOption('EPICERIE');
    await page.getByLabel('Unité par défaut').selectOption('g');
    await page.getByLabel('Durée de conservation').selectOption('LONGUE');
    await page.getByLabel("Source d'achat").selectOption('MARCHE');
    await page.getByLabel('Ingrédient privé').check();
    await page.getByRole('button', { name: 'Ajouter' }).click();
    await expect(page).toHaveURL(/\/ingredients$/);

    await page.goto('/recettes/nouveau');
    await page.getByLabel('Nom').fill(hostRecipe);
    await page.getByLabel('Instructions').fill('Cuire le riz, ajouter le safran.');
    await page.getByRole('combobox', { name: 'Ingrédient' }).selectOption({ label: hostIngredient });
    await page.getByLabel('Qté').fill('1');
    await page.getByLabel('Unité').fill('g');
    await page.getByLabel('Recette privée').check();
    await page.getByRole('button', { name: 'Ajouter', exact: true }).click();
    await expect(page).toHaveURL(/\/recettes$/);

    await signInAsTestUser(page, guestEmail);

    await page.goto('/stock/nouveau');
    await expect(
      page.getByRole('combobox', { name: 'Ingrédient' }).getByRole('option', { name: hostIngredient }),
    ).toHaveCount(1);

    await page.goto('/recettes');
    await expect(page.getByText("Recettes partagées par d'autres foyers")).not.toBeVisible();
    await page.getByRole('link', { name: new RegExp(hostRecipe) }).click();
    await expect(page).toHaveURL(/\/recettes\//);
    await expect(page.getByRole('button', { name: 'Enregistrer', exact: true })).toBeVisible();
  });
});
