-- CreateTable
CREATE TABLE "Bike" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "listedBy" TEXT NOT NULL,
    "registrationYear" INTEGER NOT NULL,
    "kmsDriven" INTEGER NOT NULL,
    "ownerCount" INTEGER NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "vipNumber" BOOLEAN NOT NULL DEFAULT false,
    "sellingPrice" DOUBLE PRECISION NOT NULL,
    "cutOffPrice" DOUBLE PRECISION NOT NULL,
    "ybtPrice" DOUBLE PRECISION NOT NULL,
    "insurance" TEXT,
    "bikeUSP" TEXT,
    "fuelType" TEXT NOT NULL,
    "bikeImage1" TEXT NOT NULL,
    "bikeImage2" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bike_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bike_registrationNumber_key" ON "Bike"("registrationNumber");
