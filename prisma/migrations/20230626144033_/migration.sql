/*
  Warnings:

  - You are about to drop the column `access_token_expiration_date` on the `service_providers` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "service_providers_user_id_key";

-- AlterTable
ALTER TABLE "service_providers" DROP COLUMN "access_token_expiration_date";
