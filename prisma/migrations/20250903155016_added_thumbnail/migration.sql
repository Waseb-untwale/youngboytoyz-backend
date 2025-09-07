-- DropIndex
DROP INDEX "public"."Car_createdAt_id_desc_idx";

-- AlterTable
ALTER TABLE "public"."Car" ADD COLUMN     "thumbnail" TEXT;

CREATE INDEX "Car_createdAt_id_desc_idx"
ON "Car"("createdAt" DESC, "id" DESC);
