-- AlterTable
ALTER TABLE "agents" ADD COLUMN     "use_language_detection" BOOLEAN DEFAULT true,
ADD COLUMN     "use_markdown" BOOLEAN DEFAULT true;
