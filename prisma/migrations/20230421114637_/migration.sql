-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('level_0', 'level_1', 'level_2', 'level_3');

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "plan" "SubscriptionPlan" DEFAULT 'level_1';
