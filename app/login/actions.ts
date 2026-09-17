'use server';

import { redirect } from 'next/navigation';
import { validateLoginInput, type LoginFieldErrors } from '@/lib/auth/validation';
import { getCurrentHousehold } from '@/lib/household';
import { prisma } from '@/lib/prisma';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export type LoginActionState = { errors: LoginFieldErrors; email: string } | undefined;

export async function loginAction(_prevState: LoginActionState, formData: FormData): Promise<LoginActionState> {
  const email = String(formData.get('email') ?? '');
  const pin = String(formData.get('pin') ?? '');

  const result = validateLoginInput({ email, pin });
  if (!result.ok) {
    return { errors: result.errors, email };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email: result.data.email, password: result.data.pin });
  if (error) {
    return { errors: { pin: 'Email ou code incorrect.' }, email };
  }

  const household = await getCurrentHousehold();
  const personCount = await prisma.person.count({ where: { householdId: household.id } });
  redirect(personCount === 0 ? '/onboarding' : '/');
}
