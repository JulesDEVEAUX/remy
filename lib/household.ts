import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/** Résout l'id de l'utilisateur Supabase Auth connecté ; redirige vers /login sinon. */
export async function getCurrentUserId(): Promise<string> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return user.id;
}

/**
 * Résout le foyer de l'utilisateur connecté : son propre foyer s'il en est
 * propriétaire, sinon le foyer qu'il a rejoint par invitation (cf.
 * HouseholdMember, issue #25), sinon création au premier accès (usage solo
 * historique : un utilisateur = un foyer, sauf pour les membres invités).
 * Redirige vers /login si personne n'est connecté — c'est le seul point de
 * garde d'accès pour les écrans qui manipulent des données scopées au foyer.
 */
export async function getCurrentHousehold() {
  const userId = await getCurrentUserId();

  // Lecture d'abord : cette fonction est appelée à chaque navigation sur chaque écran,
  // un upsert systématique forçait une écriture DB (upsert = INSERT ... ON CONFLICT)
  // à chaque requête au lieu d'une simple lecture indexée dans le cas courant.
  const owned = await prisma.household.findUnique({ where: { ownerUserId: userId } });
  if (owned) {
    return owned;
  }

  // N'atteint cette lecture que pour un utilisateur non propriétaire : coût
  // supplémentaire nul pour l'immense majorité des foyers (un seul membre).
  const membership = await prisma.householdMember.findUnique({
    where: { userId },
    include: { household: true },
  });
  if (membership) {
    return membership.household;
  }

  return prisma.household.upsert({
    where: { ownerUserId: userId },
    update: {},
    create: { ownerUserId: userId, name: 'Mon foyer' },
  });
}