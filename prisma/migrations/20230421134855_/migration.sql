-- CreateTable
CREATE TABLE "usages" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "nb_agent_queries" INTEGER NOT NULL DEFAULT 0,
    "nb_datastore_queries" INTEGER NOT NULL DEFAULT 0,
    "nb_uploaded_bytes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "usages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usages_user_id_key" ON "usages"("user_id");

-- AddForeignKey
ALTER TABLE "usages" ADD CONSTRAINT "usages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
