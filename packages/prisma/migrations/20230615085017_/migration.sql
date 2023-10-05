-- CreateTable
CREATE TABLE "messages_bnp" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "from" "MessageFrom" NOT NULL,
    "datastore_id" TEXT,
    "read" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_bnp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xp_bnp_evals" (
    "id" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "user_name" TEXT,
    "feature" TEXT,
    "usecase" TEXT,
    "prompt_type" TEXT,
    "prompt" TEXT,
    "comment" TEXT,
    "score_1" INTEGER,
    "score_2" INTEGER,
    "score_3" INTEGER,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "xp_bnp_evals_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "messages_bnp" ADD CONSTRAINT "messages_bnp_datastore_id_fkey" FOREIGN KEY ("datastore_id") REFERENCES "data_stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
