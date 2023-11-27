/*
  Warnings:

  - The values [audio] on the enum `DatasourceType` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "LLMTaskOutputType" AS ENUM ('youtube_summary');

-- AlterEnum
BEGIN;
CREATE TYPE "DatasourceType_new" AS ENUM ('web_page', 'web_site', 'text', 'file', 'google_drive_file', 'google_drive_folder', 'notion', 'notion_page', 'qa', 'youtube_video', 'youtube_bulk');
ALTER TABLE "data_sources" ALTER COLUMN "type" TYPE "DatasourceType_new" USING ("type"::text::"DatasourceType_new");
ALTER TYPE "DatasourceType" RENAME TO "DatasourceType_old";
ALTER TYPE "DatasourceType_new" RENAME TO "DatasourceType";
DROP TYPE "DatasourceType_old";
COMMIT;

-- AlterEnum
ALTER TYPE "ServiceProviderType" ADD VALUE 'zendesk';

-- AlterEnum
ALTER TYPE "ToolType" ADD VALUE 'http';

-- AlterTable
ALTER TABLE "tools" ADD COLUMN     "config" JSONB,
ADD COLUMN     "service_provider_id" TEXT;

-- CreateTable
CREATE TABLE "llm_task_outputs" (
    "id" TEXT NOT NULL,
    "type" "LLMTaskOutputType" NOT NULL,
    "external_id" TEXT,
    "output" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "llm_task_outputs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "llm_task_outputs_type_external_id_key" ON "llm_task_outputs"("type", "external_id");

-- AddForeignKey
ALTER TABLE "tools" ADD CONSTRAINT "tools_service_provider_id_fkey" FOREIGN KEY ("service_provider_id") REFERENCES "service_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
