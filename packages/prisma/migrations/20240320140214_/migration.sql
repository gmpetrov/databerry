-- CreateEnum
CREATE TYPE "FormType" AS ENUM ('conversational', 'traditional');

-- AlterTable
ALTER TABLE "forms" ADD COLUMN     "type" "FormType" NOT NULL DEFAULT 'conversational';
