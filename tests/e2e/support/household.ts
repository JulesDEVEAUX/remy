import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
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
    create: { ownerUserId, name: 'Mon foyer', isTestHousehold: true },
  });
  const personCount = await prisma.person.count({ where: { householdId: household.id } });
  if (personCount === 0) {
    await prisma.person.create({ data: { householdId: household.id, name: 'Test' } });
  }
}

/**
 * Récupère le code d'invitation affiché dans Paramètres, en le (re)générant si besoin.
 * Sur un foyer déjà invité par un run précédent, un code est déjà affiché avant même le
 * clic : "toBeVisible" seul ne suffit pas à attendre la régénération (l'élément est déjà
 * visible, il ne fait que changer de texte) — on attend explicitement que le texte diffère
 * de la valeur précédente plutôt que sa simple présence.
 */
export async function getInviteCode(page: Page) {
  const codeLocator = page.getByText(/^[A-Z0-9]{8}$/);
  const previousCode = (await codeLocator.count()) > 0 ? await codeLocator.innerText() : null;
  await page.getByRole('button', { name: /code d'invitation|Régénérer/ }).click();
  await expect(codeLocator).toBeVisible();
  if (previousCode) {
    await expect(codeLocator).not.toHaveText(previousCode);
  }
  return codeLocator.innerText();
}
