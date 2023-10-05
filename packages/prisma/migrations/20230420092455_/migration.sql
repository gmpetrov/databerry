/*
  Warnings:

  - You are about to drop the `_AgentToDatastore` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_AgentToDatastore" DROP CONSTRAINT "_AgentToDatastore_A_fkey";

-- DropForeignKey
ALTER TABLE "_AgentToDatastore" DROP CONSTRAINT "_AgentToDatastore_B_fkey";

-- DropTable
DROP TABLE "_AgentToDatastore";

-- CreateTable
CREATE TABLE "tools" (
    "id" TEXT NOT NULL,
    "type" "ToolType" NOT NULL,
    "agent_id" TEXT,
    "datastore_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tools_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tools" ADD CONSTRAINT "tools_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tools" ADD CONSTRAINT "tools_datastore_id_fkey" FOREIGN KEY ("datastore_id") REFERENCES "data_stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
