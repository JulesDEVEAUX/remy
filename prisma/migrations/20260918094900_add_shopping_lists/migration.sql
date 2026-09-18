-- CreateTable
CREATE TABLE "ShoppingList" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShoppingList_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShoppingList_householdId_name_key" ON "ShoppingList"("householdId", "name");

-- AddForeignKey
ALTER TABLE "ShoppingList" ADD CONSTRAINT "ShoppingList_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable: colonne nullable dans un premier temps, le temps du backfill ci-dessous.
ALTER TABLE "ShoppingListItem" ADD COLUMN "shoppingListId" TEXT;

-- Backfill : une liste par défaut "Courses" par foyer ayant déjà des items, puis
-- rattachement de tous les items existants à cette liste (une seule liste implicite
-- avant cette migration).
INSERT INTO "ShoppingList" ("id", "householdId", "name", "createdAt")
SELECT
    substr(md5(random()::text || clock_timestamp()::text || h."id"), 1, 25),
    h."id",
    'Courses',
    now()
FROM "Household" h
WHERE EXISTS (SELECT 1 FROM "ShoppingListItem" si WHERE si."householdId" = h."id");

UPDATE "ShoppingListItem" si
SET "shoppingListId" = sl."id"
FROM "ShoppingList" sl
WHERE sl."householdId" = si."householdId" AND sl."name" = 'Courses';

-- AlterTable: la colonne devient obligatoire maintenant que le backfill l'a remplie.
ALTER TABLE "ShoppingListItem" ALTER COLUMN "shoppingListId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "ShoppingListItem" ADD CONSTRAINT "ShoppingListItem_shoppingListId_fkey" FOREIGN KEY ("shoppingListId") REFERENCES "ShoppingList"("id") ON DELETE CASCADE ON UPDATE CASCADE;
