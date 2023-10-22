/*
  Warnings:

  - You are about to drop the column `product` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "product",
ADD COLUMN     "via_product" TEXT DEFAULT 'chaindesk';
