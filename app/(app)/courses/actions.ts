'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCurrentHousehold } from '@/lib/household';
import { parseShoppingItemFormData } from '@/lib/shopping/mapping';
import { computeResidualQuantities } from '@/lib/shopping/quantity';
import { validateShoppingItemInput, type ShoppingItemFieldErrors, type ShoppingItemFormValues } from '@/lib/shopping/validation';
import { prisma } from '@/lib/prisma';

export type ShoppingItemActionState =
  | { errors: ShoppingItemFieldErrors; values: ShoppingItemFormValues }
  | undefined;

async function loadHouseholdIngredientSources(householdId: string) {
  const ingredients = await prisma.ingredient.findMany({
    where: { householdId },
    select: { id: true, defaultSource: true },
  });
  return new Map(ingredients.map((ingredient) => [ingredient.id, ingredient.defaultSource]));
}

export async function addShoppingItemAction(
  _prevState: ShoppingItemActionState,
  formData: FormData,
): Promise<ShoppingItemActionState> {
  const household = await getCurrentHousehold();
  const sourceById = await loadHouseholdIngredientSources(household.id);
  const values = parseShoppingItemFormData(formData);
  const result = validateShoppingItemInput(values, new Set(sourceById.keys()));
  if (!result.ok) {
    return { errors: result.errors, values };
  }

  const source = sourceById.get(result.data.ingredientId);
  if (!source) {
    return { errors: { ingredientId: 'Cet ingrédient est introuvable.' }, values };
  }

  await prisma.shoppingListItem.create({
    data: {
      householdId: household.id,
      ingredientId: result.data.ingredientId,
      quantity: result.data.quantity,
      unit: result.data.unit,
      source,
      checked: false,
    },
  });

  revalidatePath('/courses');
  redirect('/courses');
}

/**
 * Génère les items manquants à partir des recettes sélectionnées : additionne
 * les RecipeIngredient nécessaires, soustrait le stock actuel, ne crée un item
 * que pour la quantité résiduelle strictement positive.
 */
export async function generateShoppingListAction(formData: FormData) {
  const household = await getCurrentHousehold();
  const recipeIds = formData.getAll('recipeIds').map(String).filter(Boolean);
  if (recipeIds.length === 0) {
    return;
  }

  const [recipeIngredients, stockEntries] = await Promise.all([
    prisma.recipeIngredient.findMany({
      where: { recipeId: { in: recipeIds }, recipe: { householdId: household.id } },
      select: { ingredientId: true, quantity: true, unit: true },
    }),
    prisma.stock.findMany({
      where: { householdId: household.id },
      select: { ingredientId: true, quantity: true, unit: true },
    }),
  ]);

  const residuals = computeResidualQuantities(recipeIngredients, stockEntries);
  if (residuals.length === 0) {
    return;
  }

  const sourceById = await loadHouseholdIngredientSources(household.id);

  const itemsToCreate = residuals.flatMap((residual) => {
    const source = sourceById.get(residual.ingredientId);
    if (!source) {
      return [];
    }
    return [
      {
        householdId: household.id,
        ingredientId: residual.ingredientId,
        quantity: residual.quantity,
        unit: residual.unit,
        source,
        checked: false,
      },
    ];
  });

  if (itemsToCreate.length === 0) {
    return;
  }

  await prisma.shoppingListItem.createMany({ data: itemsToCreate });

  revalidatePath('/courses');
}

export async function toggleShoppingItemAction(id: string) {
  const household = await getCurrentHousehold();
  const item = await prisma.shoppingListItem.findFirst({ where: { id, householdId: household.id } });
  if (!item) {
    return;
  }

  await prisma.shoppingListItem.update({ where: { id: item.id }, data: { checked: !item.checked } });
  revalidatePath('/courses');
}

export async function clearCheckedItemsAction() {
  const household = await getCurrentHousehold();
  await prisma.shoppingListItem.deleteMany({ where: { householdId: household.id, checked: true } });
  revalidatePath('/courses');
}
