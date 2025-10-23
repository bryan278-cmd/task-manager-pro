-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "difficultyLevel" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "experienceLevel" TEXT;

-- CreateIndex
CREATE INDEX "Task_difficultyLevel_idx" ON "Task"("difficultyLevel");
