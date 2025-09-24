-- AlterTable
ALTER TABLE "public"."Bike" ADD COLUMN     "collectionType" "public"."CollectionType" NOT NULL DEFAULT 'YBT',
ADD COLUMN     "engine" TEXT,
ADD COLUMN     "specs" TEXT[];
