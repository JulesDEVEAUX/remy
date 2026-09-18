'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import { generateInviteCode } from '@/lib/household/invite';
import { getCurrentHousehold, getCurrentUserId } from '@/lib/household';
import { validateHouseholdName, validatePersonName } from '@/lib/people/validation';
import { prisma } from '@/lib/prisma';
import { THEME_COOKIE, type Theme } from '@/lib/theme';

function isDuplicateInviteCodeError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}

const INVITE_CODE_MAX_ATTEMPTS = 5;

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

/**
 * Génère (ou régénère) le code d'invitation du foyer — partagé manuellement,
 * pas par email (cf. limites du mailer Supabase). Réessaie en cas de très
 * rare collision plutôt que de faire échouer la génération.
 */
export async function generateInviteCodeAction() {
  const household = await getCurrentHousehold();

  for (let attempt = 0; attempt < INVITE_CODE_MAX_ATTEMPTS; attempt++) {
    try {
      await prisma.household.update({
        where: { id: household.id },
        data: { inviteCode: generateInviteCode() },
      });
      break;
    } catch (error) {
      if (isDuplicateInviteCodeError(error) && attempt < INVITE_CODE_MAX_ATTEMPTS - 1) {
        continue;
      }
      throw error;
    }
  }

  revalidatePath('/parametres');
}

/**
 * Désigne (ou retire) un mangeur comme étant l'utilisateur connecté
 * ("c'est moi", cf. issue #25). Un seul mangeur par utilisateur : si un autre
 * mangeur du foyer était déjà lié à ce compte, le lien précédent est retiré
 * dans la même transaction.
 */
export async function togglePersonIsMeAction(personId: string) {
  const household = await getCurrentHousehold();
  const userId = await getCurrentUserId();

  const person = await prisma.person.findFirst({ where: { id: personId, householdId: household.id } });
  if (!person) {
    return;
  }

  if (person.linkedUserId === userId) {
    await prisma.person.update({ where: { id: personId }, data: { linkedUserId: null } });
  } else {
    await prisma.$transaction([
      prisma.person.updateMany({
        where: { householdId: household.id, linkedUserId: userId },
        data: { linkedUserId: null },
      }),
      prisma.person.update({ where: { id: personId }, data: { linkedUserId: userId } }),
    ]);
  }

  revalidatePath('/parametres');
}

export async function setThemeAction(theme: Theme) {
  const store = await cookies();
  store.set(THEME_COOKIE, theme, { maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' });
  revalidatePath('/', 'layout');
}
