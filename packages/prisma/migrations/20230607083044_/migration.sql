/*
  Warnings:

  - You are about to drop the column `plugin_icon_url` on the `agents` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "agents" DROP COLUMN "plugin_icon_url",
ADD COLUMN     "icon_url" TEXT;
