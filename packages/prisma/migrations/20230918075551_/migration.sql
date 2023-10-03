/*
  Warnings:

  - A unique constraint covering the columns `[organization_id]` on the table `usages` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "usages_organization_id_key" ON "usages"("organization_id");
