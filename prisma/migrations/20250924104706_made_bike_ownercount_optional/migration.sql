-- AlterTable
ALTER TABLE "public"."Bike" ALTER COLUMN "ownerCount" DROP NOT NULL,
ALTER COLUMN "sellingPrice" DROP NOT NULL,
ALTER COLUMN "cutOffPrice" DROP NOT NULL;
