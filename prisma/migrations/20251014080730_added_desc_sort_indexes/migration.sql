-- CreateIndex
CREATE INDEX "events_startDate_id_idx" ON "public"."events"("startDate" DESC, "id" DESC);

-- CreateIndex
CREATE INDEX "events_status_startDate_id_idx" ON "public"."events"("status", "startDate" DESC, "id" DESC);

-- CreateIndex
CREATE INDEX "events_title_id_idx" ON "public"."events"("title", "id");
