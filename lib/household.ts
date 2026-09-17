import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * Résout le foyer de l'utilisateur connecté, en le créant au premier accès
 * (usage solo actuellement : un utilisateur = un foyer). Redirige vers /login
 * si personne n'est connecté — c'est le seul point de garde d'accès pour les
 * écrans qui manipulent des données scopées au foyer.
 */
export async function getCurrentHousehold() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return prisma.household.upsert({
    where: { ownerUserId: user.id },
    update: {},
    create: { ownerUserId: user.id, name: 'Mon foyer' },
  });
}
