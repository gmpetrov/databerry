-- DropForeignKey
ALTER TABLE "_assignees" DROP CONSTRAINT "_assignees_B_fkey";

-- AlterTable
ALTER TABLE "conversations" ADD COLUMN     "priority" "ConversationPriority" NOT NULL DEFAULT 'MEDIUM';

-- AddForeignKey
ALTER TABLE "_assignees" ADD CONSTRAINT "_assignees_B_fkey" FOREIGN KEY ("B") REFERENCES "memberships"("id") ON DELETE CASCADE ON UPDATE CASCADE;
