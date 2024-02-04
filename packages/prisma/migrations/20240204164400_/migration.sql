-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ToolType" ADD VALUE 'mark_as_resolved';
ALTER TYPE "ToolType" ADD VALUE 'request_human';
ALTER TYPE "ToolType" ADD VALUE 'lead_capture';
