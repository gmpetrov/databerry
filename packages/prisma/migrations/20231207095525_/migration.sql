-- AlterTable
ALTER TABLE "usages" ADD COLUMN     "notified_nb_agent_queries_limit_reached" BOOLEAN DEFAULT false,
ADD COLUMN     "notified_nb_stored_tokens_limit_reached" BOOLEAN DEFAULT false;
