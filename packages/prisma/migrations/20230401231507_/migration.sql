/*
  Warnings:

  - Added the required column `type` to the `external_integrations` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "IntegrationType" AS ENUM ('crisp');

-- AlterTable
ALTER TABLE "external_integrations" ADD COLUMN     "type" "IntegrationType" NOT NULL;
