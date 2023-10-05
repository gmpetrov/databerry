-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('free', 'premium');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "plan" "SubscriptionPlan" DEFAULT 'free';
