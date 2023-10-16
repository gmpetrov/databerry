-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('RESOLVED', 'UNRESOLVED');

-- AlterTable
ALTER TABLE "conversations" ADD COLUMN     "status" "ConversationStatus" NOT NULL DEFAULT 'UNRESOLVED';
