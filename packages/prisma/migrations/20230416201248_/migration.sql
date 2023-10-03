/*
  Warnings:

  - You are about to drop the `tools` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "tools" DROP CONSTRAINT "tools_agent_id_fkey";

-- DropForeignKey
ALTER TABLE "tools" DROP CONSTRAINT "tools_datastore_id_fkey";

-- DropTable
DROP TABLE "tools";

-- CreateTable
CREATE TABLE "_AgentToDatastore" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AgentToDatastore_AB_unique" ON "_AgentToDatastore"("A", "B");

-- CreateIndex
CREATE INDEX "_AgentToDatastore_B_index" ON "_AgentToDatastore"("B");

-- AddForeignKey
ALTER TABLE "_AgentToDatastore" ADD CONSTRAINT "_AgentToDatastore_A_fkey" FOREIGN KEY ("A") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgentToDatastore" ADD CONSTRAINT "_AgentToDatastore_B_fkey" FOREIGN KEY ("B") REFERENCES "data_stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
