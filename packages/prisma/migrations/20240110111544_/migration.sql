/*
  Warnings:

  - A unique constraint covering the columns `[custom_email_verification_token_id]` on the table `mail_inboxes` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "mail_inboxes" ADD COLUMN     "custom_email_verification_token_id" TEXT,
ADD COLUMN     "is_custom_email_verified" BOOLEAN DEFAULT false;

-- CreateTable
CREATE TABLE "verification_codes" (
    "code" TEXT NOT NULL,
    "maiL_inbox_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_codes_pkey" PRIMARY KEY ("code")
);

-- CreateIndex
CREATE UNIQUE INDEX "mail_inboxes_custom_email_verification_token_id_key" ON "mail_inboxes"("custom_email_verification_token_id");

-- AddForeignKey
ALTER TABLE "mail_inboxes" ADD CONSTRAINT "mail_inboxes_custom_email_verification_token_id_fkey" FOREIGN KEY ("custom_email_verification_token_id") REFERENCES "verification_codes"("code") ON DELETE SET NULL ON UPDATE CASCADE;
