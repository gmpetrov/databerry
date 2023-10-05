-- AlterTable
ALTER TABLE "agents" ADD COLUMN     "nb_queries" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "usages" ADD COLUMN     "nb_data_processing_bytes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "nb_tokens" INTEGER NOT NULL DEFAULT 0;
