import { ConservationDuree } from '@prisma/client';
import { expect, test } from '@playwright/test';
import { estimateExpiryDate } from '@/lib/stock/expiry';
import { toDateInputValue } from '@/lib/stock/mapping';
import { signInAsTestUser } from './support/auth';

test.describe('Champs pré-remplis à partir du produit sélectionné', () => {
  test.skip(
    !process.env.SUPABASE_SECRET_KEY,
    'nécessite SUPABASE_SECRET_KEY (identifiants admin Supabase) pour authentifier le navigateur de test',
  );

  test('choisir un ingrédient suggère son unité par défaut, partout où on peut le sélectionner', async ({ page }) => {
    // Email stable et réutilisé à chaque run : évite d'accumuler un household
    // orphelin par exécution nocturne sur le projet Supabase réel.
    await signInAsTestUser(page, 'e2e-prefilled@remy.test');

    const runId = Date.now();
    const ingredientName = `Lentilles test ${runId}`;
    const recipeName = `Soupe test ${runId}`;

    await page.goto('/ingredients/nouveau');
    await page.getByLabel('Nom').fill(ingredientName);
    await page.getByLabel('Catégorie').selectOption('EPICERIE');
    await page.getByLabel('Unité par défaut').selectOption('g');
    await page.getByLabel('Durée de conservation').selectOption('MOYENNE');
    await page.getByLabel("Source d'achat").selectOption('MARCHE');
    await page.getByRole('button', { name: 'Ajouter' }).click();
    await expect(page).toHaveURL(/\/ingredients$/);

    // Stock : l'unité et une date de péremption estimée (durée moyenne = 14 j) se
    // pré-remplissent au choix de l'ingrédient, sans que l'utilisateur les saisisse.
    await page.goto('/stock/nouveau');
    await page.getByRole('combobox', { name: 'Ingrédient' }).selectOption({ label: ingredientName });
    await expect(page.getByLabel('Unité')).toHaveValue('g');
    const expectedExpiry = toDateInputValue(estimateExpiryDate(ConservationDuree.MOYENNE, new Date()));
    await expect(page.getByLabel('Date de péremption')).toHaveValue(expectedExpiry);
    await page.getByLabel('Quantité').fill('300');
    await page.getByLabel('Emplacement').selectOption('PLACARD');
    await page.getByRole('button', { name: 'Ajouter' }).click();
    await expect(page).toHaveURL(/\/stock$/);

    // Recette : même suggestion sur la ligne d'ingrédient du formulaire.
    await page.goto('/recettes/nouveau');
    await page.getByLabel('Nom').fill(recipeName);
    await page.getByLabel('Instructions').fill('Mijoter les lentilles.');
    await page.getByRole('combobox', { name: 'Ingrédient' }).selectOption({ label: ingredientName });
    await expect(page.getByLabel('Unité')).toHaveValue('g');
    await page.getByLabel('Qté').fill('150');
    await page.getByRole('button', { name: 'Ajouter', exact: true }).click();
    await expect(page).toHaveURL(/\/recettes$/);

    // Courses : même suggestion sur l'ajout manuel d'un article.
    await page.goto('/courses');
    await page.getByRole('combobox', { name: 'Ingrédient' }).selectOption({ label: ingredientName });
    await expect(page.getByLabel('Unité')).toHaveValue('g');
    await page.getByLabel('Quantité').fill('500');
    await page.getByRole('button', { name: 'Ajouter' }).click();
    await expect(page.getByRole('button', { name: new RegExp(ingredientName) })).toContainText('500 g');
  });
});