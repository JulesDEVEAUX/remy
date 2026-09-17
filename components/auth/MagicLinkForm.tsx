'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { Button, TextField, Wordmark } from '@/components/ui';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

const COPY = {
  login: {
    title: 'Connecte-toi',
    submitIdle: 'Recevoir le lien de connexion',
    submitPending: 'Envoi en cours',
    crossLinkLabel: 'Pas encore de compte ?',
    crossLinkHref: '/signup',
    crossLinkAction: 'Créer un compte',
  },
  signup: {
    title: 'Crée ton compte',
    submitIdle: 'Recevoir le lien de création',
    submitPending: 'Envoi en cours',
    crossLinkLabel: 'Déjà un compte ?',
    crossLinkHref: '/login',
    crossLinkAction: 'Se connecter',
  },
} as const;

/**
 * Connexion par lien magique, sans mot de passe : signInWithOtp crée le
 * compte s'il n'existe pas déjà, donc login et signup partagent exactement
 * la même logique — seule la copie et le lien croisé changent selon `mode`.
 */
export function MagicLinkForm({ mode }: { mode: 'login' | 'signup' }) {
  const copy = COPY[mode];
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('sending');
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/confirm` },
    });
    setStatus(error ? 'error' : 'sent');
  }

  return (
    <main className="flex min-h-screen flex-col justify-center gap-8 bg-cream p-8">
      <Wordmark size={32} />
      {status === 'sent' ? (
        <p className="font-sans text-[15px] text-ink">
          Un lien vient de partir vers {email}. Ouvre-le pour continuer.
        </p>
      ) : (
        <>
          <h1 className="-mt-4 font-display text-[30px] leading-tight text-ink">{copy.title}</h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <TextField
              label="Adresse email"
              type="email"
              name="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="toi@exemple.fr"
            />
            {status === 'error' && (
              <p className="px-2 font-sans text-[13px] font-medium text-terracotta-700">
                Le lien n&apos;a pas pu être envoyé. Réessaie.
              </p>
            )}
            <Button type="submit" block disabled={status === 'sending'}>
              {status === 'sending' ? copy.submitPending : copy.submitIdle}
            </Button>
          </form>
        </>
      )}
      <p className="text-center font-sans text-[13px] text-clay-700">
        {copy.crossLinkLabel}{' '}
        <Link href={copy.crossLinkHref} className="font-semibold text-terracotta-700">
          {copy.crossLinkAction}
        </Link>
      </p>
    </main>
  );
}
