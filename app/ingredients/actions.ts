'use server';

import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCurrentHousehold } from '@/lib/household';
import { parseIngredientFormData } from '@/lib/ingredients/mapping';
import { validateIngredientInput, type IngredientFormValues } from '@/lib/ingredients/validation';
import { prisma } from '@/lib/prisma';

export type IngredientActionState =
  | { errors: Partial<Record<keyof IngredientFormValues, string>>; values: IngredientFormValues }
  | undefined;

function isDuplicateNameError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}

export async function createIngredientAction(
  _prevState: IngredientActionState,
  formData: FormData,
): Promise<IngredientActionState> {
  const household = await getCurrentHousehold();
  const values = parseIngredientFormData(formData);
  const result = validateIngredientInput(values);
  if (!result.ok) {
    return { errors: result.errors, values };
  }

  try {
    await prisma.ingredient.create({ data: { ...result.data, householdId: household.id } });
  } catch (error) {
    if (isDuplicateNameError(error)) {
      return { errors: { name: 'Un ingrédient porte déjà ce nom.' }, values };
    }
    throw error;
  }

  revalidatePath('/ingredients');
  redirect('/ingredients');
}

export async function updateIngredientAction(
  id: string,
  _prevState: IngredientActionState,
  formData: FormData,
): Promise<IngredientActionState> {
  const household = await getCurrentHousehold();
  const values = parseIngredientFormData(formData);
  const result = validateIngredientInput(values);
  if (!result.ok) {
    return { errors: result.errors, values };
  }

  try {
    await prisma.ingredient.updateMany({
      where: { id, householdId: household.id },
      data: result.data,
    });
  } catch (error) {
    if (isDuplicateNameError(error)) {
      return { errors: { name: 'Un ingrédient porte déjà ce nom.' }, values };
    }
    throw error;
  }

  revalidatePath('/ingredients');
  redirect('/ingredients');
}

export async function deleteIngredientAction(id: string) {
  const household = await getCurrentHousehold();
  await prisma.ingredient.deleteMany({ where: { id, householdId: household.id } });
  revalidatePath('/ingredients');
  redirect('/ingredients');
}
