-- DropIndex
DROP INDEX "public"."Car_dealerId_idx";

-- CreateIndex
CREATE INDEX "Car_dealerId_createdAt_idx" ON "public"."Car"("dealerId", "createdAt");
