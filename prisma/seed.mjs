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
    { name: "Oignon", category: "FRAIS", defaultUnit: "unité", conservation: "LONGUE", defaultSource: "MARCHE" },
    { name: "Poivron", category: "FRAIS", defaultUnit: "unité", conservation: "COURTE", defaultSource: "MARCHE" },
    { name: "Ail", category: "EPICERIE", defaultUnit: "unité", conservation: "LONGUE", defaultSource: "MARCHE" },
    { name: "Huile d'olive", category: "EPICERIE", defaultUnit: "L", conservation: "LONGUE", defaultSource: "CARREFOUR" },
    { name: "Beurre", category: "FRAIS", defaultUnit: "g", conservation: "COURTE", defaultSource: "CARREFOUR" },
    { name: "Pâtes", category: "EPICERIE", defaultUnit: "g", conservation: "LONGUE", defaultSource: "CARREFOUR" },
    { name: "Poulet", category: "FRAIS", defaultUnit: "g", conservation: "COURTE", defaultSource: "CARREFOUR" },
    { name: "Mozzarella", category: "FRAIS", defaultUnit: "unité", conservation: "COURTE", defaultSource: "CARREFOUR" },
    { name: "Sel", category: "EPICERIE", defaultUnit: "g", conservation: "LONGUE", defaultSource: "CARREFOUR" },
    { name: "Poivre", category: "EPICERIE", defaultUnit: "g", conservation: "LONGUE", defaultSource: "CARREFOUR" },
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

    await prisma.recipe.create({
      data: {
        householdId: household.id,
        name: "Omelette nature",
        instructions:
          "Battre les oeufs avec le sel et le poivre. Faire fondre le beurre dans une poêle chaude. " +
          "Verser les oeufs et cuire 3 à 4 minutes en ramenant les bords vers le centre.",
        prepMinutes: 10,
        seasons: ["TOUTE_ANNEE"],
        tags: ["rapide", "végétarien"],
        ingredients: {
          create: [
            { ingredientId: ingredients["Oeufs"].id, quantity: 4, unit: "unité" },
            { ingredientId: ingredients["Beurre"].id, quantity: 15, unit: "g" },
            { ingredientId: ingredients["Sel"].id, quantity: 2, unit: "g" },
            { ingredientId: ingredients["Poivre"].id, quantity: 1, unit: "g" },
          ],
        },
      },
    });

    await prisma.recipe.create({
      data: {
        householdId: household.id,
        name: "Poulet aux oignons et poivrons",
        instructions:
          "Couper le poulet en morceaux et le faire dorer dans l'huile d'olive. Ajouter l'oignon, " +
          "le poivron et l'ail émincés. Saler, poivrer, couvrir et laisser mijoter 20 minutes à feu doux.",
        prepMinutes: 35,
        seasons: ["TOUTE_ANNEE"],
        tags: ["plat complet"],
        ingredients: {
          create: [
            { ingredientId: ingredients["Poulet"].id, quantity: 500, unit: "g" },
            { ingredientId: ingredients["Oignon"].id, quantity: 2, unit: "unité" },
            { ingredientId: ingredients["Poivron"].id, quantity: 2, unit: "unité" },
            { ingredientId: ingredients["Ail"].id, quantity: 2, unit: "unité" },
            { ingredientId: ingredients["Huile d'olive"].id, quantity: 0.03, unit: "L" },
            { ingredientId: ingredients["Sel"].id, quantity: 3, unit: "g" },
            { ingredientId: ingredients["Poivre"].id, quantity: 2, unit: "g" },
          ],
        },
      },
    });

    await prisma.recipe.create({
      data: {
        householdId: household.id,
        name: "Salade de pâtes tomate mozzarella",
        instructions:
          "Cuire les pâtes al dente puis les refroidir sous l'eau froide. Couper les tomates et la " +
          "mozzarella en dés. Mélanger le tout avec l'huile d'olive, saler et poivrer.",
        prepMinutes: 20,
        seasons: ["ETE"],
        tags: ["végétarien", "rapide", "froid"],
        ingredients: {
          create: [
            { ingredientId: ingredients["Pâtes"].id, quantity: 250, unit: "g" },
            { ingredientId: ingredients["Tomates"].id, quantity: 3, unit: "unité" },
            { ingredientId: ingredients["Mozzarella"].id, quantity: 2, unit: "unité" },
            { ingredientId: ingredients["Huile d'olive"].id, quantity: 0.02, unit: "L" },
            { ingredientId: ingredients["Sel"].id, quantity: 2, unit: "g" },
          ],
        },
      },
    });
    console.log("5 recettes créées");
  }

  const stockCount = await prisma.stock.count({ where: { householdId: household.id } });
  if (stockCount === 0) {
    await prisma.stock.createMany({
      data: [
        { householdId: household.id, ingredientId: ingredients["Riz"].id, quantity: 500, unit: "g", location: "PLACARD" },
        { householdId: household.id, ingredientId: ingredients["Oeufs"].id, quantity: 6, unit: "unité", location: "FRIGO" },
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
