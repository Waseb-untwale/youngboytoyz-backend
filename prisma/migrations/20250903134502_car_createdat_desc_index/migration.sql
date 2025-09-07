-- DropIndex
DROP INDEX "public"."Car_createdAt_id_desc_idx";

-- CreateIndex
CREATE INDEX "Car_createdAt_idx" ON "public"."Car"("createdAt");
