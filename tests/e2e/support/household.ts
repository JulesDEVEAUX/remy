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
