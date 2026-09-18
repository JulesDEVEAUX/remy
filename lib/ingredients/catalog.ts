import type { Prisma } from '@prisma/client';

/**
 * Catalogue d'ingrédients utilisable par un foyer pour composer une recette,
 * du stock, un article de courses ou un besoin récurrent : ses propres
 * ingrédients (privés ou non) plus tous les ingrédients publics des autres
 * foyers — évite de ressaisir « Farine », « Lait »… pour chaque foyer
 * (cf. issue #31). Seul le foyer propriétaire peut éditer/supprimer un
 * ingrédient, public ou non : la page /ingredients reste filtrée par
 * householdId seul, sans passer par ce helper.
 */
export function ingredientCatalogWhere(householdId: string): Prisma.IngredientWhereInput {
  return { OR: [{ householdId }, { isPrivate: false }] };
}