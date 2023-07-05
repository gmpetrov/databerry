/*
  Warnings:

  - The values [google_drive] on the enum `DatasourceType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DatasourceType_new" AS ENUM ('web_page', 'web_site', 'text', 'file', 'google_drive_file', 'google_drive_folder', 'notion');
ALTER TABLE "data_sources" ALTER COLUMN "type" TYPE "DatasourceType_new" USING ("type"::text::"DatasourceType_new");
ALTER TYPE "DatasourceType" RENAME TO "DatasourceType_old";
ALTER TYPE "DatasourceType_new" RENAME TO "DatasourceType";
DROP TYPE "DatasourceType_old";
COMMIT;
