-- CreateEnum
CREATE TYPE "AgentVisibility" AS ENUM ('public', 'private');

-- AlterTable
ALTER TABLE "agents" ADD COLUMN     "owner_id" TEXT,
ADD COLUMN     "visibility" "AgentVisibility" NOT NULL DEFAULT 'private';

-- AddForeignKey
ALTER TABLE "agents" ADD CONSTRAINT "agents_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
