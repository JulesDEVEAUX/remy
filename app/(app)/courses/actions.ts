'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCurrentHousehold } from '@/lib/household';
import { startOfDay } from '@/lib/planning/dates';
import { parseShoppingItemFormData, selectPlannedRecipeOccurrences } from '@/lib/shopping/mapping';
import { computeResidualQuantities } from '@/lib/shopping/quantity';
import {
  validateShoppingItemInput,
  validateShoppingListName,
  type ShoppingItemFieldErrors,
  type ShoppingItemFormValues,
} from '@/lib/shopping/validation';
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

/** Vérifie que la liste ciblée appartient bien au foyer, pour éviter toute écriture croisée. */
async function assertShoppingListInHousehold(householdId: string, shoppingListId: string) {
  const list = await prisma.shoppingList.findFirst({ where: { id: shoppingListId, householdId } });
  if (!list) {
    throw new Error('Liste de courses introuvable pour ce foyer.');
  }
  return list;
}

export async function addShoppingItemAction(
  _prevState: ShoppingItemActionState,
  formData: FormData,
): Promise<ShoppingItemActionState> {
  const household = await getCurrentHousehold();
  const shoppingListId = String(formData.get('shoppingListId') ?? '');
  await assertShoppingListInHousehold(household.id, shoppingListId);

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
      shoppingListId,
      ingredientId: result.data.ingredientId,
      quantity: result.data.quantity,
      unit: result.data.unit,
      source,
      checked: false,
    },
  });

  revalidatePath('/courses');
  redirect(`/courses?listId=${shoppingListId}`);
}

/**
 * Génère les items manquants, dans la liste de courses choisie, à partir de
 * tous les repas planifiés à venir (aujourd'hui inclus) : additionne les
 * RecipeIngredient nécessaires pour chaque occurrence de repas (un batch
 * cooking ne compte qu'une fois même s'il couvre plusieurs créneaux, cf.
 * selectPlannedRecipeOccurrences), soustrait le stock actuel, ne crée un item
 * que pour la quantité résiduelle strictement positive.
 */
export async function generateShoppingListAction(shoppingListId: string) {
  const household = await getCurrentHousehold();
  await assertShoppingListInHousehold(household.id, shoppingListId);

  const upcomingMealPlans = await prisma.mealPlan.findMany({
    where: { householdId: household.id, date: { gte: startOfDay(new Date()) }, recipeId: { not: null } },
    select: { recipeId: true, isBatch: true },
  });
  const recipeOccurrences = selectPlannedRecipeOccurrences(upcomingMealPlans);
  if (recipeOccurrences.length === 0) {
    return;
  }

  const [recipeIngredients, stockEntries] = await Promise.all([
    prisma.recipeIngredient.findMany({
      where: { recipeId: { in: recipeOccurrences }, recipe: { householdId: household.id } },
      select: { recipeId: true, ingredientId: true, quantity: true, unit: true },
    }),
    prisma.stock.findMany({
      where: { householdId: household.id },
      select: { ingredientId: true, quantity: true, unit: true },
    }),
  ]);

  const ingredientsByRecipe = new Map<string, typeof recipeIngredients>();
  for (const ingredient of recipeIngredients) {
    const list = ingredientsByRecipe.get(ingredient.recipeId) ?? [];
    list.push(ingredient);
    ingredientsByRecipe.set(ingredient.recipeId, list);
  }
  const needed = recipeOccurrences.flatMap((recipeId) => ingredientsByRecipe.get(recipeId) ?? []);

  const residuals = computeResidualQuantities(needed, stockEntries);
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
        shoppingListId,
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

export async function clearCheckedItemsAction(shoppingListId: string) {
  const household = await getCurrentHousehold();
  await prisma.shoppingListItem.deleteMany({ where: { householdId: household.id, shoppingListId, checked: true } });
  revalidatePath('/courses');
}

export type CreateShoppingListState = { error: string; value: string } | undefined;

export async function createShoppingListAction(
  _prevState: CreateShoppingListState,
  formData: FormData,
): Promise<CreateShoppingListState> {
  const household = await getCurrentHousehold();
  const existingLists = await prisma.shoppingList.findMany({
    where: { householdId: household.id },
    select: { name: true },
  });
  const value = String(formData.get('listName') ?? '');
  const result = validateShoppingListName(value, new Set(existingLists.map((list) => list.name)));
  if (!result.ok) {
    return { error: result.error, value };
  }

  const created = await prisma.shoppingList.create({ data: { householdId: household.id, name: result.data } });
  revalidatePath('/courses');
  redirect(`/courses?listId=${created.id}`);
}

export async function deleteShoppingListAction(id: string) {
  const household = await getCurrentHousehold();
  const remainingLists = await prisma.shoppingList.findMany({
    where: { householdId: household.id },
    select: { id: true },
    orderBy: { createdAt: 'asc' },
  });
  // Toujours garder au moins une liste : sans ça la page /courses n'aurait plus
  // de liste à afficher ni à proposer pour un futur ajout.
  if (remainingLists.length <= 1) {
    return;
  }

  await prisma.shoppingList.deleteMany({ where: { id, householdId: household.id } });
  revalidatePath('/courses');

  const fallback = remainingLists.find((list) => list.id !== id) ?? remainingLists[0];
  redirect(`/courses?listId=${fallback.id}`);
}
