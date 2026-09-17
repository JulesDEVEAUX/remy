'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCurrentHousehold } from '@/lib/household';
import { safeRedirectTarget } from '@/lib/navigation';
import { markAsMadeToday } from '@/lib/recipes/history';
import { parseRecipeFormData } from '@/lib/recipes/mapping';
import {
  validateRecipeComment,
  validateRecipeInput,
  validatePersonalNote,
  type RecipeFieldErrors,
  type RecipeFormValues,
} from '@/lib/recipes/validation';
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

  const redirectTo = safeRedirectTarget(formData.get('redirectTo')?.toString(), '/recettes');
  revalidatePath('/recettes');
  redirect(redirectTo);
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

export type CommentActionState = { error?: string; success?: boolean } | undefined;

export async function addRecipeCommentAction(
  recipeId: string,
  _prevState: CommentActionState,
  formData: FormData,
): Promise<CommentActionState> {
  const household = await getCurrentHousehold();
  const recipe = await prisma.recipe.findFirst({ where: { id: recipeId, householdId: household.id }, select: { id: true } });
  if (!recipe) {
    redirect('/recettes');
  }

  const result = validateRecipeComment(String(formData.get('body') ?? ''));
  if (!result.ok) {
    return { error: result.error };
  }

  await prisma.recipeComment.create({ data: { recipeId, body: result.body } });
  revalidatePath(`/recettes/${recipeId}`);
  return { success: true };
}

export type PersonalNoteActionState = { error?: string } | undefined;

export async function updatePersonalNoteAction(
  recipeId: string,
  _prevState: PersonalNoteActionState,
  formData: FormData,
): Promise<PersonalNoteActionState> {
  const household = await getCurrentHousehold();
  const result = validatePersonalNote(String(formData.get('personalNote') ?? ''));
  if (!result.ok) {
    return { error: result.error };
  }

  await prisma.recipe.updateMany({
    where: { id: recipeId, householdId: household.id },
    data: { personalNote: result.note },
  });
  revalidatePath(`/recettes/${recipeId}`);
  return undefined;
}

export async function markRecipeMadeAction(recipeId: string) {
  const household = await getCurrentHousehold();
  await prisma.recipe.updateMany({
    where: { id: recipeId, householdId: household.id },
    data: markAsMadeToday(),
  });
  revalidatePath(`/recettes/${recipeId}`);
  revalidatePath('/recettes');
}
