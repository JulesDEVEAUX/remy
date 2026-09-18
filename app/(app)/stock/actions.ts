'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCurrentHousehold } from '@/lib/household';
import { ingredientCatalogWhere } from '@/lib/ingredients/catalog';
import { estimateExpiryDate } from '@/lib/stock/expiry';
import { parseStockFormData } from '@/lib/stock/mapping';
import { validateStockInput, type StockFieldErrors, type StockFormValues } from '@/lib/stock/validation';
import { prisma } from '@/lib/prisma';

export type StockActionState = { errors: StockFieldErrors; values: StockFormValues } | undefined;

async function loadHouseholdIngredientConservations(householdId: string) {
  const ingredients = await prisma.ingredient.findMany({
    where: ingredientCatalogWhere(householdId),
    select: { id: true, conservation: true },
  });
  return new Map(ingredients.map((ingredient) => [ingredient.id, ingredient.conservation]));
}

export async function createStockAction(
  _prevState: StockActionState,
  formData: FormData,
): Promise<StockActionState> {
  const household = await getCurrentHousehold();
  const conservationById = await loadHouseholdIngredientConservations(household.id);
  const values = parseStockFormData(formData);
  const result = validateStockInput(values, new Set(conservationById.keys()));
  if (!result.ok) {
    return { errors: result.errors, values };
  }

  const conservation = conservationById.get(result.data.ingredientId);
  if (!conservation) {
    return { errors: { ingredientId: 'Cet ingrédient est introuvable.' }, values };
  }

  const expiresAt = result.data.expiresAt ?? estimateExpiryDate(conservation, new Date());

  await prisma.stock.create({
    data: {
      householdId: household.id,
      ingredientId: result.data.ingredientId,
      quantity: result.data.quantity,
      unit: result.data.unit,
      expiresAt,
    },
  });

  revalidatePath('/stock');
  redirect('/stock');
}

export async function updateStockAction(
  id: string,
  _prevState: StockActionState,
  formData: FormData,
): Promise<StockActionState> {
  const household = await getCurrentHousehold();
  const conservationById = await loadHouseholdIngredientConservations(household.id);
  const values = parseStockFormData(formData);
  const result = validateStockInput(values, new Set(conservationById.keys()));
  if (!result.ok) {
    return { errors: result.errors, values };
  }

  const existing = await prisma.stock.findFirst({ where: { id, householdId: household.id } });
  if (!existing) {
    redirect('/stock');
  }

  const conservation = conservationById.get(result.data.ingredientId);
  if (!conservation) {
    return { errors: { ingredientId: 'Cet ingrédient est introuvable.' }, values };
  }

  const expiresAt = result.data.expiresAt ?? estimateExpiryDate(conservation, existing.createdAt);

  await prisma.stock.updateMany({
    where: { id, householdId: household.id },
    data: { quantity: result.data.quantity, unit: result.data.unit, expiresAt },
  });

  revalidatePath('/stock');
  redirect('/stock');
}

export async function deleteStockAction(id: string) {
  const household = await getCurrentHousehold();
  await prisma.stock.deleteMany({ where: { id, householdId: household.id } });
  revalidatePath('/stock');
  redirect('/stock');
}
