-- CreateEnum
CREATE TYPE "AnswerEval" AS ENUM ('good', 'bad');

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "eval" "AnswerEval";
