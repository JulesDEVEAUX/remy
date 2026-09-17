import { prisma } from '@/lib/prisma';

/**
 * Remet à zéro les mangeurs d'un foyer de test entre deux runs, pour que le
 * test onboarding (qui dépend d'un foyer sans aucun Person) reste rejouable
 * sur l'email stable réutilisé à chaque exécution.
 */
export async function resetHouseholdPeople(ownerUserId: string | undefined) {
  if (!ownerUserId) {
    return;
  }
  const household = await prisma.household.findUnique({ where: { ownerUserId } });
  if (!household) {
    return;
  }
  await prisma.person.deleteMany({ where: { householdId: household.id } });
}

/**
 * Garantit qu'un foyer de test a au moins un Person, pour que la connexion
 * ne redirige pas vers /onboarding sur des specs qui testent autre chose.
 */
export async function ensureHouseholdHasPerson(ownerUserId: string | undefined) {
  if (!ownerUserId) {
    return;
  }
  const household = await prisma.household.upsert({
    where: { ownerUserId },
    update: {},
    create: { ownerUserId, name: 'Mon foyer' },
  });
  const personCount = await prisma.person.count({ where: { householdId: household.id } });
  if (personCount === 0) {
    await prisma.person.create({ data: { householdId: household.id, name: 'Test' } });
  }
}
