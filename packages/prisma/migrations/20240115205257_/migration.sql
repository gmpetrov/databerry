-- DropForeignKey
ALTER TABLE "conversations" DROP CONSTRAINT "conversations_agent_id_fkey";

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "agent_id" TEXT,
ADD COLUMN     "contact_id" TEXT,
ADD COLUMN     "user_id" TEXT,
ADD COLUMN     "visitor_id" TEXT;

-- CreateTable
CREATE TABLE "visitors" (
    "id" TEXT NOT NULL,
    "contact_id" TEXT,
    "organization_id" TEXT,
    "external_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visitors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_participants_agents" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_participants_users" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_participants_visitors" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_participants_contacts" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "visitors_external_id_organization_id_key" ON "visitors"("external_id", "organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "_participants_agents_AB_unique" ON "_participants_agents"("A", "B");

-- CreateIndex
CREATE INDEX "_participants_agents_B_index" ON "_participants_agents"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_participants_users_AB_unique" ON "_participants_users"("A", "B");

-- CreateIndex
CREATE INDEX "_participants_users_B_index" ON "_participants_users"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_participants_visitors_AB_unique" ON "_participants_visitors"("A", "B");

-- CreateIndex
CREATE INDEX "_participants_visitors_B_index" ON "_participants_visitors"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_participants_contacts_AB_unique" ON "_participants_contacts"("A", "B");

-- CreateIndex
CREATE INDEX "_participants_contacts_B_index" ON "_participants_contacts"("B");

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_visitor_id_fkey" FOREIGN KEY ("visitor_id") REFERENCES "visitors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitors" ADD CONSTRAINT "visitors_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitors" ADD CONSTRAINT "visitors_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_participants_agents" ADD CONSTRAINT "_participants_agents_A_fkey" FOREIGN KEY ("A") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_participants_agents" ADD CONSTRAINT "_participants_agents_B_fkey" FOREIGN KEY ("B") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_participants_users" ADD CONSTRAINT "_participants_users_A_fkey" FOREIGN KEY ("A") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_participants_users" ADD CONSTRAINT "_participants_users_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_participants_visitors" ADD CONSTRAINT "_participants_visitors_A_fkey" FOREIGN KEY ("A") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_participants_visitors" ADD CONSTRAINT "_participants_visitors_B_fkey" FOREIGN KEY ("B") REFERENCES "visitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_participants_contacts" ADD CONSTRAINT "_participants_contacts_A_fkey" FOREIGN KEY ("A") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_participants_contacts" ADD CONSTRAINT "_participants_contacts_B_fkey" FOREIGN KEY ("B") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
