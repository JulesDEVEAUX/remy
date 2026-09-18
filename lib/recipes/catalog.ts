import type { Prisma } from '@prisma/client';

/**
 * Une recette publique (`isPrivate: false`) d'un autre foyer que `householdId`,
 * empruntable en lecture seule ou clonable (cf. issue #31).
 *
 * Un foyer réel n'accède jamais aux recettes publiques d'un foyer de test
 * (cf. issue #66) : sans ça, toute recette créée par un test e2e (publique par
 * défaut) atteindrait les foyers réels. Un foyer de test, lui, continue de
 * voir les recettes publiques des autres foyers de test — c'est ce que
 * vérifie tests/e2e/ingredient-recipe-sharing.spec.ts.
 */
export function otherHouseholdsPublicRecipesWhere(
  householdId: string,
  isTestHousehold: boolean,
): Prisma.RecipeWhereInput {
  return {
    householdId: { not: householdId },
    isPrivate: false,
    ...(isTestHousehold ? {} : { household: { isTestHousehold: false } }),
  };
}

/** Une recette est lisible par un foyer si elle lui appartient, ou si elle est publique (cf. ci-dessus). */
export function recipeReadWhere(
  id: string,
  householdId: string,
  isTestHousehold: boolean,
): Prisma.RecipeWhereInput {
  const publicCondition: Prisma.RecipeWhereInput = isTestHousehold
    ? { isPrivate: false }
    : { isPrivate: false, household: { isTestHousehold: false } };
  return { id, OR: [{ householdId }, publicCondition] };
}
