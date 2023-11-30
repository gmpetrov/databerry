-- CreateEnum
CREATE TYPE "LLMTaskOutputType" AS ENUM ('youtube_summary');

-- CreateTable
CREATE TABLE "llm_task_outputs" (
    "id" TEXT NOT NULL,
    "type" "LLMTaskOutputType" NOT NULL,
    "external_id" TEXT,
    "output" JSONB,
    "usage" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "llm_task_outputs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "llm_task_outputs_type_external_id_key" ON "llm_task_outputs"("type", "external_id");
