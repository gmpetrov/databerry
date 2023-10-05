-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "organization_id" TEXT;

-- AlterTable
ALTER TABLE "usages" ADD COLUMN     "organization_id" TEXT;

-- AddForeignKey
ALTER TABLE "usages" ADD CONSTRAINT "usages_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
