-- CreateEnum
CREATE TYPE "ToolType" AS ENUM ('datastore');

-- DropForeignKey
ALTER TABLE "agents" DROP CONSTRAINT "agents_owner_id_fkey";

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
ALTER TABLE "agents" ADD CONSTRAINT "agents_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tools" ADD CONSTRAINT "tools_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tools" ADD CONSTRAINT "tools_datastore_id_fkey" FOREIGN KEY ("datastore_id") REFERENCES "data_stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
