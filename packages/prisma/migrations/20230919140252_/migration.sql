/*
  Warnings:

  - You are about to drop the column `invite_email` on the `memberships` table. All the data in the column will be lost.
  - You are about to drop the column `invite_name` on the `memberships` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[organization_id,invited_email]` on the table `memberships` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "memberships_organization_id_invite_email_key";

-- AlterTable
ALTER TABLE "memberships" DROP COLUMN "invite_email",
DROP COLUMN "invite_name",
ADD COLUMN     "invited_email" TEXT,
ADD COLUMN     "invited_name" TEXT,
ADD COLUMN     "invited_token" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "memberships_organization_id_invited_email_key" ON "memberships"("organization_id", "invited_email");
