/*
  Warnings:

  - You are about to drop the column `page_name` on the `agents` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[handle]` on the table `agents` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "agents_page_name_key";

-- AlterTable
ALTER TABLE "agents" DROP COLUMN "page_name",
ADD COLUMN     "handle" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "agents_handle_key" ON "agents"("handle");
