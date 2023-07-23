-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "sources" TEXT[] DEFAULT ARRAY[]::TEXT[];
