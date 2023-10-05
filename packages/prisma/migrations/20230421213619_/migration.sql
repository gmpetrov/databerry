-- AlterTable
ALTER TABLE "external_integrations" ADD COLUMN     "user_api_key_id" TEXT;

-- AddForeignKey
ALTER TABLE "external_integrations" ADD CONSTRAINT "external_integrations_user_api_key_id_fkey" FOREIGN KEY ("user_api_key_id") REFERENCES "user_api_keys"("id") ON DELETE CASCADE ON UPDATE CASCADE;
