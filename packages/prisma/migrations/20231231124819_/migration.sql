/*
  Warnings:

  - A unique constraint covering the columns `[channel_external_id]` on the table `conversations` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "conversations" ADD COLUMN     "channel_credentials_id" TEXT,
ADD COLUMN     "channel_external_id" TEXT,
ADD COLUMN     "is_ai_enabled" BOOLEAN DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "conversations_channel_external_id_key" ON "conversations"("channel_external_id");

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_channel_credentials_id_fkey" FOREIGN KEY ("channel_credentials_id") REFERENCES "service_providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
