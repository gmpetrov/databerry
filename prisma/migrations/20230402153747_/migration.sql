/*
  Warnings:

  - You are about to drop the column `plan` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `customers` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `customer_id` to the `subscriptions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "customers" DROP CONSTRAINT "customers_user_id_fkey";

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "customer_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "plan";

-- DropTable
DROP TABLE "customers";
