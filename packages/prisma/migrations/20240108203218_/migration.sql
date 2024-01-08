/*
  Warnings:

  - A unique constraint covering the columns `[external_id]` on the table `messages` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ConversationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- AlterEnum
ALTER TYPE "ConversationChannel" ADD VALUE 'mail';

-- AlterTable
ALTER TABLE "conversations" ADD COLUMN     "mail_inbox_id" TEXT,
ADD COLUMN     "title" TEXT;

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "external_id" TEXT,
ADD COLUMN     "html" TEXT;

-- CreateTable
CREATE TABLE "mail_inboxes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "alias" TEXT NOT NULL,
    "from_name" TEXT,
    "signature" TEXT,
    "hide_branding" BOOLEAN DEFAULT true,
    "custom_email" TEXT,
    "organization_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mail_inboxes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "organization_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_assignees" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_participants" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ContactToConversation" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "mail_inboxes_alias_key" ON "mail_inboxes"("alias");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_email_organization_id_key" ON "contacts"("email", "organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "_assignees_AB_unique" ON "_assignees"("A", "B");

-- CreateIndex
CREATE INDEX "_assignees_B_index" ON "_assignees"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_participants_AB_unique" ON "_participants"("A", "B");

-- CreateIndex
CREATE INDEX "_participants_B_index" ON "_participants"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ContactToConversation_AB_unique" ON "_ContactToConversation"("A", "B");

-- CreateIndex
CREATE INDEX "_ContactToConversation_B_index" ON "_ContactToConversation"("B");

-- CreateIndex
CREATE UNIQUE INDEX "messages_external_id_key" ON "messages"("external_id");

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_mail_inbox_id_fkey" FOREIGN KEY ("mail_inbox_id") REFERENCES "mail_inboxes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_inboxes" ADD CONSTRAINT "mail_inboxes_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_assignees" ADD CONSTRAINT "_assignees_A_fkey" FOREIGN KEY ("A") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_assignees" ADD CONSTRAINT "_assignees_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_participants" ADD CONSTRAINT "_participants_A_fkey" FOREIGN KEY ("A") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_participants" ADD CONSTRAINT "_participants_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContactToConversation" ADD CONSTRAINT "_ContactToConversation_A_fkey" FOREIGN KEY ("A") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContactToConversation" ADD CONSTRAINT "_ContactToConversation_B_fkey" FOREIGN KEY ("B") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
