-- AlterTable
ALTER TABLE "CargoShipment" ADD COLUMN     "destinationAdded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "originDeducted" BOOLEAN NOT NULL DEFAULT false;
