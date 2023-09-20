-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_organization_id_fkey";

-- AlterTable
ALTER TABLE "usages" ALTER COLUMN "user_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
