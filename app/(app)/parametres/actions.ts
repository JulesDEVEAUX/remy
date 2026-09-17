'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getCurrentHousehold } from '@/lib/household';
import { validateHouseholdName, validatePersonName } from '@/lib/people/validation';
import { prisma } from '@/lib/prisma';
import { THEME_COOKIE, type Theme } from '@/lib/theme';

export type UpdateHouseholdNameState = { error: string; value: string } | undefined;

export async function updateHouseholdNameAction(
  _prevState: UpdateHouseholdNameState,
  formData: FormData,
): Promise<UpdateHouseholdNameState> {
  const household = await getCurrentHousehold();
  const value = String(formData.get('householdName') ?? '');
  const result = validateHouseholdName(value);
  if (!result.ok) {
    return { error: result.error, value };
  }

  await prisma.household.update({ where: { id: household.id }, data: { name: result.data } });
  revalidatePath('/parametres');
}

export type CreatePersonState = { error: string; value: string } | undefined;

export async function createPersonAction(
  _prevState: CreatePersonState,
  formData: FormData,
): Promise<CreatePersonState> {
  const household = await getCurrentHousehold();
  const value = String(formData.get('personName') ?? '');
  const result = validatePersonName(value);
  if (!result.ok) {
    return { error: result.error, value };
  }

  await prisma.person.create({ data: { householdId: household.id, name: result.data } });
  revalidatePath('/parametres');
}

export async function deletePersonAction(id: string) {
  const household = await getCurrentHousehold();
  await prisma.person.deleteMany({ where: { id, householdId: household.id } });
  revalidatePath('/parametres');
}

export async function setThemeAction(theme: Theme) {
  const store = await cookies();
  store.set(THEME_COOKIE, theme, { maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' });
  revalidatePath('/', 'layout');
}
