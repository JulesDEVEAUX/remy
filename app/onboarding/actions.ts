'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCurrentHousehold } from '@/lib/household';
import { parseOnboardingFormData } from '@/lib/people/mapping';
import { validateOnboardingInput, type OnboardingFormValues } from '@/lib/people/validation';
import { prisma } from '@/lib/prisma';

export type OnboardingActionState =
  | { errors: Partial<Record<keyof OnboardingFormValues, string>>; values: OnboardingFormValues }
  | undefined;

export async function completeOnboardingAction(
  _prevState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const household = await getCurrentHousehold();
  const values = parseOnboardingFormData(formData);
  const result = validateOnboardingInput(values);
  if (!result.ok) {
    return { errors: result.errors, values };
  }

  await prisma.$transaction([
    prisma.household.update({ where: { id: household.id }, data: { name: result.data.householdName } }),
    prisma.person.createMany({
      data: result.data.personNames.map((name) => ({ householdId: household.id, name })),
    }),
  ]);

  revalidatePath('/');
  redirect('/');
}
