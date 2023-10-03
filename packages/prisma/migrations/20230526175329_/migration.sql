/*
  Warnings:

  - You are about to drop the column `fingerprint` on the `conversations` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "conversations_fingerprint_idx";

-- AlterTable
ALTER TABLE "conversations" DROP COLUMN "fingerprint",
ADD COLUMN     "visitor_id" TEXT;

-- CreateIndex
CREATE INDEX "conversations_visitor_id_idx" ON "conversations" USING HASH ("visitor_id");
