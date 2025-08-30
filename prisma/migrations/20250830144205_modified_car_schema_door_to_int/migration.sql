/*
  Warnings:

  - The `doors` column on the `Car` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `seatingCapacity` column on the `Car` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."Car" DROP COLUMN "doors",
ADD COLUMN     "doors" INTEGER,
DROP COLUMN "seatingCapacity",
ADD COLUMN     "seatingCapacity" INTEGER;
