/*
  Warnings:

  - The `model_name` column on the `agents` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "AgentModelName" AS ENUM ('gpt_3_5_turbo', 'gpt_4');

-- AlterTable
ALTER TABLE "agents" DROP COLUMN "model_name",
ADD COLUMN     "model_name" "AgentModelName" NOT NULL DEFAULT 'gpt_3_5_turbo';

-- DropEnum
DROP TYPE "ModelName";
