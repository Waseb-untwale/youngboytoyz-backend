/*
  Warnings:

  - You are about to drop the column `bikeImage1` on the `Bike` table. All the data in the column will be lost.
  - You are about to drop the column `bikeImage2` on the `Bike` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Bike" DROP COLUMN "bikeImage1",
DROP COLUMN "bikeImage2",
ADD COLUMN     "badges" TEXT[],
ADD COLUMN     "bikeImages" TEXT[],
ADD COLUMN     "brand" TEXT,
ADD COLUMN     "description" TEXT;
