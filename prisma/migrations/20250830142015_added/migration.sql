/*
  Warnings:

  - The `fuelType` column on the `Car` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `driveType` column on the `Car` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `transmission` column on the `Car` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `updatedAt` to the `Bike` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Car` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."VehicleStatus" AS ENUM ('AVAILABLE', 'SOLD', 'PENDING');

-- CreateEnum
CREATE TYPE "public"."FuelType" AS ENUM ('PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID', 'CNG');

-- CreateEnum
CREATE TYPE "public"."TransmissionType" AS ENUM ('MANUAL', 'AUTOMATIC');

-- CreateEnum
CREATE TYPE "public"."DriveType" AS ENUM ('FWD', 'RWD', 'AWD', 'FOUR_WD');

-- AlterTable
ALTER TABLE "public"."Bike" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Car" ADD COLUMN     "city" TEXT,
ADD COLUMN     "mileage" DOUBLE PRECISION,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "status" "public"."VehicleStatus" NOT NULL DEFAULT 'AVAILABLE',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "fuelType",
ADD COLUMN     "fuelType" "public"."FuelType" NOT NULL DEFAULT 'PETROL',
DROP COLUMN "driveType",
ADD COLUMN     "driveType" "public"."DriveType",
DROP COLUMN "transmission",
ADD COLUMN     "transmission" "public"."TransmissionType" NOT NULL DEFAULT 'MANUAL';

-- CreateTable
CREATE TABLE "public"."events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "maxAttendees" INTEGER,
    "currentAttendees" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "imageUrls" TEXT[],
    "primaryImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "events_slug_key" ON "public"."events"("slug");
