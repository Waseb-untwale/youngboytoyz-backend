/*
  Warnings:

  - You are about to drop the column `currentAttendees` on the `events` table. All the data in the column will be lost.
  - You are about to drop the `AgendaItem` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[registrationCode]` on the table `EventRegistration` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `orderId` to the `EventRegistration` table without a default value. This is not possible if the table is not empty.
  - The required column `registrationCode` was added to the `EventRegistration` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `ticketTypeId` to the `EventRegistration` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."ApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "public"."AgendaItem" DROP CONSTRAINT "AgendaItem_eventId_fkey";

-- DropIndex
DROP INDEX "public"."EventRegistration_userId_eventId_key";

-- AlterTable
ALTER TABLE "public"."Car" ADD COLUMN     "specs" TEXT[];

-- AlterTable
ALTER TABLE "public"."EventRegistration" ADD COLUMN     "checkedIn" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "orderId" INTEGER NOT NULL,
ADD COLUMN     "registrationCode" TEXT NOT NULL,
ADD COLUMN     "ticketTypeId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."TicketType" ADD COLUMN     "quantitySold" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "saleEndDate" TIMESTAMP(3),
ADD COLUMN     "saleStartDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."events" DROP COLUMN "currentAttendees",
ADD COLUMN     "facilities" TEXT[],
ADD COLUMN     "isFeatured" BOOLEAN DEFAULT false,
ADD COLUMN     "youshouldKnow" TEXT[];

-- DropTable
DROP TABLE "public"."AgendaItem";

-- CreateTable
CREATE TABLE "public"."Order" (
    "id" SERIAL NOT NULL,
    "status" "public"."OrderStatus" NOT NULL DEFAULT 'PENDING',
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "paymentGatewayId" TEXT,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OrderItem" (
    "id" SERIAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "priceAtPurchase" DOUBLE PRECISION NOT NULL,
    "orderId" INTEGER NOT NULL,
    "ticketTypeId" INTEGER NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EventApplication" (
    "id" SERIAL NOT NULL,
    "status" "public"."ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "userId" INTEGER NOT NULL,
    "eventId" INTEGER NOT NULL,
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" INTEGER,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrderItem_ticketTypeId_idx" ON "public"."OrderItem"("ticketTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "EventApplication_userId_eventId_key" ON "public"."EventApplication"("userId", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "EventRegistration_registrationCode_key" ON "public"."EventRegistration"("registrationCode");

-- CreateIndex
CREATE INDEX "EventRegistration_eventId_idx" ON "public"."EventRegistration"("eventId");

-- CreateIndex
CREATE INDEX "EventRegistration_userId_idx" ON "public"."EventRegistration"("userId");

-- CreateIndex
CREATE INDEX "EventRegistration_ticketTypeId_idx" ON "public"."EventRegistration"("ticketTypeId");

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "public"."TicketType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EventRegistration" ADD CONSTRAINT "EventRegistration_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EventRegistration" ADD CONSTRAINT "EventRegistration_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "public"."TicketType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EventApplication" ADD CONSTRAINT "EventApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EventApplication" ADD CONSTRAINT "EventApplication_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EventApplication" ADD CONSTRAINT "EventApplication_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "public"."User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
