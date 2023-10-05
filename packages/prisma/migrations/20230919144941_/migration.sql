/*
  Warnings:

  - A unique constraint covering the columns `[organization_id,userId]` on the table `memberships` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "memberships_organization_id_userId_key" ON "memberships"("organization_id", "userId");
