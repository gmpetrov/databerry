/*
  Warnings:

  - A unique constraint covering the columns `[message_id]` on the table `form_submissions` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "form_submissions" ADD COLUMN     "message_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "form_submissions_message_id_key" ON "form_submissions"("message_id");

-- AddForeignKey
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
