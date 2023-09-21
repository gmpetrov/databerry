-- DropForeignKey
ALTER TABLE "leads" DROP CONSTRAINT "leads_agent_id_fkey";

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
