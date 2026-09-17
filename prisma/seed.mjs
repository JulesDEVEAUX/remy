// Jeu de données d'exemple pour le dev local. Idempotent : peut être relancé sans dupliquer
// les recettes/stock/courses déjà présents. Rattache les données au premier foyer trouvé
// (ou en crée un si la base est vide) car Household.ownerUserId suit un utilisateur Supabase
// réel qu'on ne peut pas connaître depuis ce script.
import dotenv from "dotenv";
import { expand } from "dotenv-expand";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

expand(dotenv.config({ quiet: true }));

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  let household = await prisma.household.findFirst();
  if (!household) {
    household = await prisma.household.create({
      data: {
        ownerUserId: process.env.SEED_OWNER_USER_ID ?? "seed-owner",
        name: "Mon foyer",
      },
    });
    console.log(`Foyer créé : ${household.name} (${household.id})`);
  } else {
    console.log(`Foyer existant utilisé : ${household.name} (${household.id})`);
  }

  const ingredientDefs = [
    { name: "Oeufs", category: "FRAIS", defaultUnit: "unité", conservation: "COURTE", defaultSource: "CARREFOUR" },
    { name: "Lait", category: "FRAIS", defaultUnit: "L", conservation: "COURTE", defaultSource: "CARREFOUR" },
    { name: "Farine", category: "EPICERIE", defaultUnit: "g", conservation: "LONGUE", defaultSource: "CARREFOUR" },
    { name: "Tomates", category: "FRAIS", defaultUnit: "unité", conservation: "COURTE", defaultSource: "MARCHE" },
    { name: "Riz", category: "EPICERIE", defaultUnit: "g", conservation: "LONGUE", defaultSource: "CARREFOUR" },
  ];

  const ingredients = {};
  for (const def of ingredientDefs) {
    const ingredient = await prisma.ingredient.upsert({
      where: { householdId_name: { householdId: household.id, name: def.name } },
      update: {},
      create: { ...def, householdId: household.id },
    });
    ingredients[def.name] = ingredient;
  }
  console.log(`${ingredientDefs.length} ingrédients prêts`);

  let person = await prisma.person.findFirst({ where: { householdId: household.id } });
  if (!person) {
    person = await prisma.person.create({
      data: { householdId: household.id, name: "Alex", allergies: [], restrictions: [] },
    });
    console.log(`Personne créée : ${person.name}`);
  }

  const recipeCount = await prisma.recipe.count({ where: { householdId: household.id } });
  if (recipeCount === 0) {
    await prisma.recipe.create({
      data: {
        householdId: household.id,
        name: "Crêpes",
        instructions: "Mélanger la farine, les oeufs et le lait. Laisser reposer 30 min. Cuire à la poêle.",
        prepMinutes: 40,
        seasons: ["TOUTE_ANNEE"],
        tags: ["sucré", "rapide"],
        ingredients: {
          create: [
            { ingredientId: ingredients["Farine"].id, quantity: 250, unit: "g" },
            { ingredientId: ingredients["Oeufs"].id, quantity: 3, unit: "unité" },
            { ingredientId: ingredients["Lait"].id, quantity: 0.5, unit: "L" },
          ],
        },
      },
    });

    await prisma.recipe.create({
      data: {
        householdId: household.id,
        name: "Riz aux tomates",
        instructions: "Cuire le riz. Faire revenir les tomates coupées. Mélanger et assaisonner.",
        prepMinutes: 25,
        seasons: ["ETE"],
        tags: ["végétarien"],
        ingredients: {
          create: [
            { ingredientId: ingredients["Riz"].id, quantity: 200, unit: "g" },
            { ingredientId: ingredients["Tomates"].id, quantity: 3, unit: "unité" },
          ],
        },
      },
    });
    console.log("2 recettes créées");
  }

  const stockCount = await prisma.stock.count({ where: { householdId: household.id } });
  if (stockCount === 0) {
    await prisma.stock.createMany({
      data: [
        { householdId: household.id, ingredientId: ingredients["Riz"].id, quantity: 500, unit: "g" },
        { householdId: household.id, ingredientId: ingredients["Oeufs"].id, quantity: 6, unit: "unité" },
      ],
    });
    console.log("2 lignes de stock créées");
  }

  const shoppingCount = await prisma.shoppingListItem.count({ where: { householdId: household.id } });
  if (shoppingCount === 0) {
    await prisma.shoppingListItem.createMany({
      data: [
        { householdId: household.id, ingredientId: ingredients["Lait"].id, quantity: 1, unit: "L", source: "CARREFOUR" },
        { householdId: household.id, ingredientId: ingredients["Tomates"].id, quantity: 4, unit: "unité", source: "MARCHE" },
      ],
    });
    console.log("2 lignes de liste de courses créées");
  }

  console.log("Seed terminé.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
