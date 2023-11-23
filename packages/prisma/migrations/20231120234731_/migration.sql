-- AlterEnum
ALTER TYPE "ServiceProviderType" ADD VALUE 'zendesk';

-- AlterEnum
ALTER TYPE "ToolType" ADD VALUE 'http';

-- AlterTable
ALTER TABLE "tools" ADD COLUMN     "config" JSONB,
ADD COLUMN     "service_provider_id" TEXT;

-- AddForeignKey
ALTER TABLE "tools" ADD CONSTRAINT "tools_service_provider_id_fkey" FOREIGN KEY ("service_provider_id") REFERENCES "service_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
