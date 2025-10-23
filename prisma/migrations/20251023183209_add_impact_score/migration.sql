-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "impactScore" INTEGER;

-- CreateIndex
CREATE INDEX "Task_impactScore_idx" ON "Task"("impactScore");
