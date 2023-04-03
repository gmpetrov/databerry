-- CreateTable
CREATE TABLE "external_integrations" (
    "id" TEXT NOT NULL,
    "integration_id" TEXT NOT NULL,
    "api_key_id" TEXT NOT NULL,

    CONSTRAINT "external_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "external_integrations_integration_id_key" ON "external_integrations"("integration_id");

-- AddForeignKey
ALTER TABLE "external_integrations" ADD CONSTRAINT "external_integrations_api_key_id_fkey" FOREIGN KEY ("api_key_id") REFERENCES "datastore_api_keys"("id") ON DELETE CASCADE ON UPDATE CASCADE;
