'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCurrentHousehold } from '@/lib/household';
import { parseRecipeFormData } from '@/lib/recipes/mapping';
import { validateRecipeInput, type RecipeFieldErrors, type RecipeFormValues } from '@/lib/recipes/validation';
import { prisma } from '@/lib/prisma';

export type RecipeActionState = { errors: RecipeFieldErrors; values: RecipeFormValues } | undefined;

async function loadValidIngredientIds(householdId: string) {
  const ingredients = await prisma.ingredient.findMany({
    where: { householdId },
    select: { id: true },
  });
  return new Set(ingredients.map((ingredient) => ingredient.id));
}

export async function createRecipeAction(
  _prevState: RecipeActionState,
  formData: FormData,
): Promise<RecipeActionState> {
  const household = await getCurrentHousehold();
  const validIngredientIds = await loadValidIngredientIds(household.id);
  const values = parseRecipeFormData(formData);
  const result = validateRecipeInput(values, validIngredientIds);
  if (!result.ok) {
    return { errors: result.errors, values };
  }

  await prisma.recipe.create({
    data: {
      householdId: household.id,
      name: result.data.name,
      sourceUrl: result.data.sourceUrl,
      instructions: result.data.instructions,
      prepMinutes: result.data.prepMinutes,
      seasons: result.data.seasons,
      tags: result.data.tags,
      ingredients: {
        create: result.data.ingredients.map((ingredient) => ({
          ingredientId: ingredient.ingredientId,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
        })),
      },
    },
  });

  revalidatePath('/recettes');
  redirect('/recettes');
}

export async function updateRecipeAction(
  id: string,
  _prevState: RecipeActionState,
  formData: FormData,
): Promise<RecipeActionState> {
  const household = await getCurrentHousehold();
  const validIngredientIds = await loadValidIngredientIds(household.id);
  const values = parseRecipeFormData(formData);
  const result = validateRecipeInput(values, validIngredientIds);
  if (!result.ok) {
    return { errors: result.errors, values };
  }

  await prisma.$transaction(async (tx) => {
    const updated = await tx.recipe.updateMany({
      where: { id, householdId: household.id },
      data: {
        name: result.data.name,
        sourceUrl: result.data.sourceUrl,
        instructions: result.data.instructions,
        prepMinutes: result.data.prepMinutes,
        seasons: result.data.seasons,
        tags: result.data.tags,
      },
    });

    if (updated.count === 0) {
      return;
    }

    await tx.recipeIngredient.deleteMany({ where: { recipeId: id } });
    await tx.recipeIngredient.createMany({
      data: result.data.ingredients.map((ingredient) => ({
        recipeId: id,
        ingredientId: ingredient.ingredientId,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
      })),
    });
  });

  revalidatePath('/recettes');
  redirect('/recettes');
}

export async function deleteRecipeAction(id: string) {
  const household = await getCurrentHousehold();
  await prisma.recipe.deleteMany({ where: { id, householdId: household.id } });
  revalidatePath('/recettes');
  redirect('/recettes');
}
