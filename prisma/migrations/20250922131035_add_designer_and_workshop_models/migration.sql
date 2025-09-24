/*
  Warnings:

  - The `fuelType` column on the `Bike` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `collectionType` to the `Car` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creatorId` to the `events` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."CollectionType" AS ENUM ('YBT', 'DESIGNER', 'WORKSHOP', 'TORQUE_TUNER');

-- DropForeignKey
ALTER TABLE "public"."AgendaItem" DROP CONSTRAINT "AgendaItem_eventId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Bike" DROP CONSTRAINT "Bike_dealerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BikeOwnership" DROP CONSTRAINT "BikeOwnership_bikeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BikeOwnership" DROP CONSTRAINT "BikeOwnership_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BookingLead" DROP CONSTRAINT "BookingLead_carId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Car" DROP CONSTRAINT "Car_dealerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CarOwnership" DROP CONSTRAINT "CarOwnership_carId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CarOwnership" DROP CONSTRAINT "CarOwnership_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Bike" DROP COLUMN "fuelType",
ADD COLUMN     "fuelType" "public"."FuelType" NOT NULL DEFAULT 'PETROL';

-- AlterTable
ALTER TABLE "public"."Car" ADD COLUMN     "collectionType" "public"."CollectionType" NOT NULL,
ADD COLUMN     "designerId" INTEGER,
ADD COLUMN     "workshopId" INTEGER;

-- AlterTable
ALTER TABLE "public"."events" ADD COLUMN     "creatorId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "public"."Designer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "stats" JSONB NOT NULL,

    CONSTRAINT "Designer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Workshop" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "stats" JSONB NOT NULL,

    CONSTRAINT "Workshop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EventRegistration" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "eventId" INTEGER NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Designer_name_key" ON "public"."Designer"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Workshop_name_key" ON "public"."Workshop"("name");

-- CreateIndex
CREATE UNIQUE INDEX "EventRegistration_userId_eventId_key" ON "public"."EventRegistration"("userId", "eventId");

-- CreateIndex
CREATE INDEX "Car_designerId_idx" ON "public"."Car"("designerId");

-- CreateIndex
CREATE INDEX "Car_workshopId_idx" ON "public"."Car"("workshopId");

-- AddForeignKey
ALTER TABLE "public"."Car" ADD CONSTRAINT "Car_designerId_fkey" FOREIGN KEY ("designerId") REFERENCES "public"."Designer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Car" ADD CONSTRAINT "Car_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "public"."Workshop"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Car" ADD CONSTRAINT "Car_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES "public"."Dealer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Bike" ADD CONSTRAINT "Bike_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES "public"."Dealer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CarOwnership" ADD CONSTRAINT "CarOwnership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CarOwnership" ADD CONSTRAINT "CarOwnership_carId_fkey" FOREIGN KEY ("carId") REFERENCES "public"."Car"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BikeOwnership" ADD CONSTRAINT "BikeOwnership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BikeOwnership" ADD CONSTRAINT "BikeOwnership_bikeId_fkey" FOREIGN KEY ("bikeId") REFERENCES "public"."Bike"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BookingLead" ADD CONSTRAINT "BookingLead_carId_fkey" FOREIGN KEY ("carId") REFERENCES "public"."Car"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."events" ADD CONSTRAINT "events_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AgendaItem" ADD CONSTRAINT "AgendaItem_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EventRegistration" ADD CONSTRAINT "EventRegistration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EventRegistration" ADD CONSTRAINT "EventRegistration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
