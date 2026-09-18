'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { Button, PinField, TextField, Wordmark } from '@/components/ui';
import type { SignupActionState } from '@/app/signup/actions';

export function SignupForm({
  action,
}: {
  action: (state: SignupActionState, formData: FormData) => Promise<SignupActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <main className="flex min-h-screen flex-col justify-center gap-8 bg-cream p-8 dark:bg-ink">
      <Wordmark size={32} />
      <h1 className="-mt-4 font-display text-[30px] leading-tight text-ink dark:text-cream">Crée ton compte</h1>
      <form action={formAction} className="flex flex-col gap-4">
        <TextField
          label="Adresse email"
          type="email"
          name="email"
          required
          autoFocus
          defaultValue={state?.email}
          error={state?.errors.email}
          placeholder="toi@exemple.fr"
        />
        <PinField
          label="Code à 6 chiffres"
          name="pin"
          required
          autoComplete="new-password"
          error={state?.errors.pin}
        />
        <PinField
          label="Confirme le code"
          name="pinConfirm"
          required
          autoComplete="new-password"
          error={state?.errors.pinConfirm}
        />
        <TextField
          label="Code d'invitation (si tu rejoins un foyer)"
          name="inviteCode"
          maxLength={8}
          error={state?.errors.inviteCode}
          placeholder="Optionnel"
        />
        <Button type="submit" block disabled={pending}>
          {pending ? 'Création' : 'Créer mon compte'}
        </Button>
      </form>
      <p className="text-center font-sans text-[13px] text-clay-700 dark:text-clay-400">
        Déjà un compte ?{' '}
        <Link href="/login" className="font-semibold text-terracotta-700">
          Se connecter
        </Link>
      </p>
    </main>
  );
}
