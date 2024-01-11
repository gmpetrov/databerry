/*
  Warnings:

  - You are about to drop the column `hide_branding` on the `mail_inboxes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "mail_inboxes" DROP COLUMN "hide_branding",
ADD COLUMN     "show_branding" BOOLEAN DEFAULT true;
