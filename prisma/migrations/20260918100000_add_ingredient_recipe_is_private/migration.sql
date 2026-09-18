-- AlterTable
ALTER TABLE "Ingredient" ADD COLUMN "isPrivate" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN "isPrivate" BOOLEAN NOT NULL DEFAULT false;
