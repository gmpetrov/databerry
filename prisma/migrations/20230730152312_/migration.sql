-- DropForeignKey
ALTER TABLE "data_stores" DROP CONSTRAINT "data_stores_owner_id_fkey";

-- AddForeignKey
ALTER TABLE "data_stores" ADD CONSTRAINT "data_stores_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
