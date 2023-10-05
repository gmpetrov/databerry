-- AlterTable
ALTER TABLE "agents" ADD COLUMN     "include_sources" BOOLEAN DEFAULT true,
ADD COLUMN     "restrict_knowledge" BOOLEAN DEFAULT true;
