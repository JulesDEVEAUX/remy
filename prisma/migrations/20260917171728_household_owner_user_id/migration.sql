-- AlterTable
ALTER TABLE "Household" ADD COLUMN "ownerUserId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Household_ownerUserId_key" ON "Household"("ownerUserId");
