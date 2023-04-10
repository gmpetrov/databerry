/*
  Warnings:

  - A unique constraint covering the columns `[integration_token]` on the table `external_integrations` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "external_integrations_integration_token_key" ON "external_integrations"("integration_token");
