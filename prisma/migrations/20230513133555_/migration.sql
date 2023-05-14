/*
  Warnings:

  - You are about to drop the column `plugin_icon_url` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "data_stores" ADD COLUMN     "plugin_icon_url" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "plugin_icon_url";
