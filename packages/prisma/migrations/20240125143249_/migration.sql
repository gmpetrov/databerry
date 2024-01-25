/*
  Warnings:

  - A unique constraint covering the columns `[phone_number,organization_id]` on the table `contacts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[external_id,organization_id]` on the table `contacts` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "ConversationChannel" ADD VALUE 'whatsapp';

-- AlterEnum
ALTER TYPE "ServiceProviderType" ADD VALUE 'whatsapp';

-- AlterTable
ALTER TABLE "contacts" ADD COLUMN     "external_id" TEXT,
ADD COLUMN     "phone_number" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "contacts_phone_number_organization_id_key" ON "contacts"("phone_number", "organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_external_id_organization_id_key" ON "contacts"("external_id", "organization_id");
