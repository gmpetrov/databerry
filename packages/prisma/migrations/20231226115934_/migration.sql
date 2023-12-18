-- AlterTable
ALTER TABLE "conversations" ADD COLUMN     "is_ai_enabled" BOOLEAN DEFAULT true;

-- CreateTable
CREATE TABLE "external_conversation_configs" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "serviceProviderId" TEXT NOT NULL,
    "config" JSONB NOT NULL,

    CONSTRAINT "external_conversation_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "external_conversation_configs_conversationId_key" ON "external_conversation_configs"("conversationId");

-- AddForeignKey
ALTER TABLE "external_conversation_configs" ADD CONSTRAINT "external_conversation_configs_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "external_conversation_configs" ADD CONSTRAINT "external_conversation_configs_serviceProviderId_fkey" FOREIGN KEY ("serviceProviderId") REFERENCES "service_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
