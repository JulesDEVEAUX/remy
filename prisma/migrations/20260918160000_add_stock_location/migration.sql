-- CreateEnum
CREATE TYPE "StockLocation" AS ENUM ('FRIGO', 'CONGELATEUR', 'PLACARD', 'SALLE_DE_BAIN', 'AUTRE');

-- AlterTable
ALTER TABLE "Stock" ADD COLUMN "location" "StockLocation" NOT NULL DEFAULT 'AUTRE';