/*
  Warnings:

  - You are about to drop the column `listedBy` on the `Bike` table. All the data in the column will be lost.
  - You are about to drop the column `listedBy` on the `Car` table. All the data in the column will be lost.
  - Added the required column `dealerId` to the `Bike` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dealerId` to the `Car` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."OwnershipStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED');

-- AlterEnum
ALTER TYPE "public"."VehicleStatus" ADD VALUE 'RESERVED';

-- AlterTable
ALTER TABLE "public"."Bike" DROP COLUMN "listedBy",
ADD COLUMN     "dealerId" INTEGER NOT NULL,
ADD COLUMN     "status" "public"."VehicleStatus" NOT NULL DEFAULT 'AVAILABLE';

-- AlterTable
ALTER TABLE "public"."Car" DROP COLUMN "listedBy",
ADD COLUMN     "dealerId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "public"."Dealer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dealer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CarOwnership" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "carId" INTEGER NOT NULL,
    "status" "public"."OwnershipStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "CarOwnership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BikeOwnership" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "bikeId" INTEGER NOT NULL,
    "status" "public"."OwnershipStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "BikeOwnership_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Dealer_name_key" ON "public"."Dealer"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Dealer_email_key" ON "public"."Dealer"("email");

-- CreateIndex
CREATE INDEX "CarOwnership_userId_idx" ON "public"."CarOwnership"("userId");

-- CreateIndex
CREATE INDEX "CarOwnership_carId_idx" ON "public"."CarOwnership"("carId");

-- CreateIndex
CREATE INDEX "CarOwnership_status_idx" ON "public"."CarOwnership"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CarOwnership_userId_carId_key" ON "public"."CarOwnership"("userId", "carId");

-- CreateIndex
CREATE INDEX "BikeOwnership_userId_idx" ON "public"."BikeOwnership"("userId");

-- CreateIndex
CREATE INDEX "BikeOwnership_bikeId_idx" ON "public"."BikeOwnership"("bikeId");

-- CreateIndex
CREATE INDEX "BikeOwnership_status_idx" ON "public"."BikeOwnership"("status");

-- CreateIndex
CREATE UNIQUE INDEX "BikeOwnership_userId_bikeId_key" ON "public"."BikeOwnership"("userId", "bikeId");

-- CreateIndex
CREATE INDEX "Bike_title_idx" ON "public"."Bike"("title");

-- CreateIndex
CREATE INDEX "Bike_brand_idx" ON "public"."Bike"("brand");

-- CreateIndex
CREATE INDEX "Bike_status_idx" ON "public"."Bike"("status");

-- CreateIndex
CREATE INDEX "Bike_dealerId_idx" ON "public"."Bike"("dealerId");

-- CreateIndex
CREATE INDEX "Car_status_idx" ON "public"."Car"("status");

-- CreateIndex
CREATE INDEX "Car_dealerId_idx" ON "public"."Car"("dealerId");

-- AddForeignKey
ALTER TABLE "public"."Car" ADD CONSTRAINT "Car_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES "public"."Dealer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Bike" ADD CONSTRAINT "Bike_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES "public"."Dealer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CarOwnership" ADD CONSTRAINT "CarOwnership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CarOwnership" ADD CONSTRAINT "CarOwnership_carId_fkey" FOREIGN KEY ("carId") REFERENCES "public"."Car"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BikeOwnership" ADD CONSTRAINT "BikeOwnership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BikeOwnership" ADD CONSTRAINT "BikeOwnership_bikeId_fkey" FOREIGN KEY ("bikeId") REFERENCES "public"."Bike"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
