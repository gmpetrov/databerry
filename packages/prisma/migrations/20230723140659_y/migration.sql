-- AlterTable
ALTER TABLE "messages" ALTER COLUMN "sources" SET DEFAULT ARRAY[]::TEXT[];
