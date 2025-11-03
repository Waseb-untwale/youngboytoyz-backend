/*
  Warnings:

  - A unique constraint covering the columns `[startDate,id]` on the table `events` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "events_startDate_id_key" ON "public"."events"("startDate", "id");
