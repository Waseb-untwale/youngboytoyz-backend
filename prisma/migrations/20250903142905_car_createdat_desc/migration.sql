-- DropIndex
DROP INDEX "public"."Car_createdAt_idx";

-- CreateIndex
CREATE INDEX "Car_createdAt_id_desc_idx"
ON "Car"("createdAt" DESC, "id" DESC);