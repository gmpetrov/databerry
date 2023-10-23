/*
  Warnings:

  - A unique constraint covering the columns `[conversation_id]` on the table `leads` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "ConversationStatus" ADD VALUE 'HUMAN_REQUESTED';

-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "conversation_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "leads_conversation_id_key" ON "leads"("conversation_id");

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
