-- AlterTable
ALTER TABLE "agents" ADD COLUMN     "system_prompt" TEXT,
ADD COLUMN     "user_prompt" TEXT;

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "input_id" TEXT;

-- CreateTable
CREATE TABLE "action_approvals" (
    "id" TEXT NOT NULL,
    "payload" JSONB,
    "tool_id" TEXT,
    "message_id" TEXT,
    "agent_id" TEXT,
    "organization_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "action_approvals_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "action_approvals" ADD CONSTRAINT "action_approvals_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "tools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_approvals" ADD CONSTRAINT "action_approvals_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_approvals" ADD CONSTRAINT "action_approvals_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_approvals" ADD CONSTRAINT "action_approvals_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_input_id_fkey" FOREIGN KEY ("input_id") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
