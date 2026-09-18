import type { Prisma } from '@prisma/client';

/**
 * Catalogue d'ingrédients utilisable par un foyer pour composer une recette,
 * du stock, un article de courses ou un besoin récurrent : ses propres
 * ingrédients (privés ou non) plus tous les ingrédients publics des autres
 * foyers — évite de ressaisir « Farine », « Lait »… pour chaque foyer
 * (cf. issue #31). Seul le foyer propriétaire peut éditer/supprimer un
 * ingrédient, public ou non : la page /ingredients reste filtrée par
 * householdId seul, sans passer par ce helper.
 *
 * Un foyer réel n'accède jamais aux ingrédients publics d'un foyer de test
 * (cf. issue #66) : sans ça, tout ingrédient créé par un test e2e (public par
 * défaut) atteindrait le catalogue de chaque foyer réel. Un foyer de test,
 * lui, continue de voir les ingrédients publics des autres foyers de test —
 * c'est ce que vérifie tests/e2e/ingredient-recipe-sharing.spec.ts.
 */
export function ingredientCatalogWhere(
  householdId: string,
  isTestHousehold: boolean,
): Prisma.IngredientWhereInput {
  const publicCondition: Prisma.IngredientWhereInput = isTestHousehold
    ? { isPrivate: false }
    : { isPrivate: false, household: { isTestHousehold: false } };
  return { OR: [{ householdId }, publicCondition] };
}
