/*
  Warnings:

  - The `eval` column on the `messages` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "MessageEval" AS ENUM ('good', 'bad');

-- AlterTable
ALTER TABLE "messages" DROP COLUMN "eval",
ADD COLUMN     "eval" "MessageEval";

-- DropEnum
DROP TYPE "AnswerEval";
