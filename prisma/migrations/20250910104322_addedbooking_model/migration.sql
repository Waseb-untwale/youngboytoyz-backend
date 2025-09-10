-- CreateTable
CREATE TABLE "public"."BookingLead" (
    "id" SERIAL NOT NULL,
    "carId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingLead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BookingLead_carId_idx" ON "public"."BookingLead"("carId");

-- CreateIndex
CREATE INDEX "BookingLead_email_idx" ON "public"."BookingLead"("email");

-- AddForeignKey
ALTER TABLE "public"."BookingLead" ADD CONSTRAINT "BookingLead_carId_fkey" FOREIGN KEY ("carId") REFERENCES "public"."Car"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
