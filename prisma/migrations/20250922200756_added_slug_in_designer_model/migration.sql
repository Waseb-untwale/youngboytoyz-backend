/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Designer` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Designer" ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Designer_slug_key" ON "public"."Designer"("slug");
