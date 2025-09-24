/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Workshop` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."Stage" AS ENUM ('STAGE1', 'STAGE2', 'STAGE3');

-- AlterTable
ALTER TABLE "public"."Car" ADD COLUMN     "tuningStage" "public"."Stage";

-- AlterTable
ALTER TABLE "public"."Workshop" ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Workshop_slug_key" ON "public"."Workshop"("slug");
