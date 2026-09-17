'use client';

import { useState, type FormEvent } from 'react';
import { Button, TextField, Wordmark } from '@/components/ui';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function LoginPage() {
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
          Un lien de connexion vient de partir vers {email}. Ouvre-le pour continuer.
        </p>
      ) : (
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
            {status === 'sending' ? 'Envoi en cours' : 'Recevoir le lien de connexion'}
          </Button>
        </form>
      )}
    </main>
  );
}
