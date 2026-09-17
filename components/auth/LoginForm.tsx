'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { Button, PinField, TextField, Wordmark } from '@/components/ui';
import type { LoginActionState } from '@/app/login/actions';

export function LoginForm({
  action,
}: {
  action: (state: LoginActionState, formData: FormData) => Promise<LoginActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <main className="flex min-h-screen flex-col justify-center gap-8 bg-cream p-8 dark:bg-ink">
      <Wordmark size={32} />
      <h1 className="-mt-4 font-display text-[30px] leading-tight text-ink dark:text-cream">Connecte-toi</h1>
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
          autoComplete="current-password"
          error={state?.errors.pin}
        />
        <Button type="submit" block disabled={pending}>
          {pending ? 'Connexion' : 'Se connecter'}
        </Button>
      </form>
      <p className="text-center font-sans text-[13px] text-clay-700 dark:text-clay-400">
        Pas encore de compte ?{' '}
        <Link href="/signup" className="font-semibold text-terracotta-700">
          Créer un compte
        </Link>
      </p>
    </main>
  );
}
