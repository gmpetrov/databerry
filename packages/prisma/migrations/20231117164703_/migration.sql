/*
  Warnings:

  - A unique constraint covering the columns `[type,external_id]` on the table `service_providers` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ServiceProviderType" ADD VALUE 'website';
ALTER TYPE "ServiceProviderType" ADD VALUE 'crisp';
ALTER TYPE "ServiceProviderType" ADD VALUE 'slack';

-- AlterTable
ALTER TABLE "service_providers" ADD COLUMN     "external_id" TEXT;

-- CreateTable
CREATE TABLE "_AgentToServiceProvider" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AgentToServiceProvider_AB_unique" ON "_AgentToServiceProvider"("A", "B");

-- CreateIndex
CREATE INDEX "_AgentToServiceProvider_B_index" ON "_AgentToServiceProvider"("B");

-- CreateIndex
CREATE UNIQUE INDEX "service_providers_type_external_id_key" ON "service_providers"("type", "external_id");

-- AddForeignKey
ALTER TABLE "_AgentToServiceProvider" ADD CONSTRAINT "_AgentToServiceProvider_A_fkey" FOREIGN KEY ("A") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgentToServiceProvider" ADD CONSTRAINT "_AgentToServiceProvider_B_fkey" FOREIGN KEY ("B") REFERENCES "service_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
