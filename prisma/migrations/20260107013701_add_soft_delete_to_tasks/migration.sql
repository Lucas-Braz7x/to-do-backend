-- AlterTable
ALTER TABLE "tarefas" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "tarefas_deletedAt_idx" ON "tarefas"("deletedAt");
