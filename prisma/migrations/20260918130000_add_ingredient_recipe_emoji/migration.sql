-- AlterTable
ALTER TABLE "Ingredient" ADD COLUMN "emoji" TEXT NOT NULL DEFAULT '📦';

-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN "emoji" TEXT NOT NULL DEFAULT '📦';