/*
  Warnings:

  - You are about to drop the `external_integrations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "external_integrations" DROP CONSTRAINT "external_integrations_agent_id_fkey";

-- DropForeignKey
ALTER TABLE "external_integrations" DROP CONSTRAINT "external_integrations_api_key_id_fkey";

-- DropTable
DROP TABLE "external_integrations";
