'use client';

import { createBrowserClient } from '@supabase/ssr';

/** Client Supabase côté navigateur — utilisé pour déclencher l'envoi du lien magique. */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
