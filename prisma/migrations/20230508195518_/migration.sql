-- CreateEnum
CREATE TYPE "PromptType" AS ENUM ('raw', 'customer_support');

-- AlterTable
ALTER TABLE "agents" ADD COLUMN     "prompt_type" "PromptType" NOT NULL DEFAULT 'customer_support',
ADD COLUMN     "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.0;
