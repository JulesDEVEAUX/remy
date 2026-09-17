import { type EmailOtpType } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { type NextRequest } from 'next/server';
import { getCurrentHousehold } from '@/lib/household';
import { prisma } from '@/lib/prisma';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * Callback du lien magique : échange le token_hash contre une session, puis
 * redirige. Un foyer sans aucun `Person` (premier accès) part vers
 * /onboarding au lieu de la destination par défaut.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/ingredients';

  if (tokenHash && type) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      const household = await getCurrentHousehold();
      const personCount = await prisma.person.count({ where: { householdId: household.id } });
      redirect(personCount === 0 ? '/onboarding' : next);
    }
  }

  redirect('/login');
}
