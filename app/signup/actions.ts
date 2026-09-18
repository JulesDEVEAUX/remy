'use server';

import { redirect } from 'next/navigation';
import { validateSignupInput, type SignupFieldErrors } from '@/lib/auth/validation';
import { prisma } from '@/lib/prisma';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export type SignupActionState = { errors: SignupFieldErrors; email: string } | undefined;

export async function signupAction(_prevState: SignupActionState, formData: FormData): Promise<SignupActionState> {
  const email = String(formData.get('email') ?? '');
  const pin = String(formData.get('pin') ?? '');
  const pinConfirm = String(formData.get('pinConfirm') ?? '');
  const inviteCode = String(formData.get('inviteCode') ?? '');

  const result = validateSignupInput({ email, pin, pinConfirm, inviteCode });
  if (!result.ok) {
    return { errors: result.errors, email };
  }

  // Vérifié avant de créer le compte : inutile de créer un utilisateur Supabase
  // Auth si le code d'invitation renseigné ne correspond à aucun foyer.
  let invitedHouseholdId: string | null = null;
  if (result.data.inviteCode) {
    const invitedHousehold = await prisma.household.findUnique({
      where: { inviteCode: result.data.inviteCode },
      select: { id: true },
    });
    if (!invitedHousehold) {
      return { errors: { inviteCode: 'Ce code d’invitation est introuvable.' }, email };
    }
    invitedHouseholdId = invitedHousehold.id;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({ email: result.data.email, password: result.data.pin });
  if (error || !data.user) {
    return { errors: { email: 'Cet email est déjà utilisé, ou invalide.' }, email };
  }

  if (invitedHouseholdId) {
    // Rattache ce compte au foyer invité avant son tout premier accès à
    // l'app : getCurrentHousehold() le résout alors comme membre plutôt que
    // de lui créer son propre foyer (cf. lib/household.ts).
    await prisma.householdMember.create({ data: { householdId: invitedHouseholdId, userId: data.user.id } });
  }

  redirect('/onboarding');
}
