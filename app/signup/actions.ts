'use server';

import { redirect } from 'next/navigation';
import { validateSignupInput, type SignupFieldErrors } from '@/lib/auth/validation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export type SignupActionState = { errors: SignupFieldErrors; email: string } | undefined;

export async function signupAction(_prevState: SignupActionState, formData: FormData): Promise<SignupActionState> {
  const email = String(formData.get('email') ?? '');
  const pin = String(formData.get('pin') ?? '');
  const pinConfirm = String(formData.get('pinConfirm') ?? '');

  const result = validateSignupInput({ email, pin, pinConfirm });
  if (!result.ok) {
    return { errors: result.errors, email };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({ email: result.data.email, password: result.data.pin });
  if (error) {
    return { errors: { email: 'Cet email est déjà utilisé, ou invalide.' }, email };
  }

  redirect('/onboarding');
}
