-- AlterTable
ALTER TABLE "data_sources" ADD COLUMN     "group_id" TEXT;

-- AddForeignKey
ALTER TABLE "data_sources" ADD CONSTRAINT "data_sources_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "data_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
