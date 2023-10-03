-- CreateEnum
CREATE TYPE "ServiceProviderType" AS ENUM ('google_drive', 'notion');

-- AlterEnum
ALTER TYPE "DatasourceType" ADD VALUE 'notion';

-- AlterTable
ALTER TABLE "data_sources" ADD COLUMN     "service_provider_id" TEXT;

-- CreateTable
CREATE TABLE "service_providers" (
    "id" TEXT NOT NULL,
    "type" "ServiceProviderType" NOT NULL,
    "name" TEXT,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "config" JSONB,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_providers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "service_providers_user_id_key" ON "service_providers"("user_id");

-- AddForeignKey
ALTER TABLE "data_sources" ADD CONSTRAINT "data_sources_service_provider_id_fkey" FOREIGN KEY ("service_provider_id") REFERENCES "service_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_providers" ADD CONSTRAINT "service_providers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
