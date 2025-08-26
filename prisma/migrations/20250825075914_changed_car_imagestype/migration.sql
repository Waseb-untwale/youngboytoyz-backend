/*
  Warnings:

  - You are about to drop the column `carImage1` on the `Car` table. All the data in the column will be lost.
  - You are about to drop the column `carImage2` on the `Car` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Car" DROP COLUMN "carImage1",
DROP COLUMN "carImage2";
