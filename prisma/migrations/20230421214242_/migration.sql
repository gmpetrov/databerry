/*
  Warnings:

  - You are about to drop the column `user_api_key_id` on the `external_integrations` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "external_integrations" DROP CONSTRAINT "external_integrations_api_key_id_fkey";

-- DropForeignKey
ALTER TABLE "external_integrations" DROP CONSTRAINT "external_integrations_user_api_key_id_fkey";

-- AlterTable
ALTER TABLE "external_integrations" DROP COLUMN "user_api_key_id",
ADD COLUMN     "agent_id" TEXT;

-- AddForeignKey
ALTER TABLE "external_integrations" ADD CONSTRAINT "external_integrations_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "external_integrations" ADD CONSTRAINT "external_integrations_api_key_id_fkey" FOREIGN KEY ("api_key_id") REFERENCES "datastore_api_keys"("id") ON DELETE SET NULL ON UPDATE CASCADE;
