-- CreateEnum
CREATE TYPE "ConversationChannel" AS ENUM ('dashboard', 'website', 'slack', 'crisp');

-- AlterTable
ALTER TABLE "conversations" ADD COLUMN     "channel" "ConversationChannel" NOT NULL DEFAULT 'dashboard';
