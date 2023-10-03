-- AlterTable
ALTER TABLE "data_stores" ADD COLUMN     "plugin_description_for_humans" TEXT,
ADD COLUMN     "plugin_description_for_model" TEXT,
ADD COLUMN     "plugin_name" TEXT;
