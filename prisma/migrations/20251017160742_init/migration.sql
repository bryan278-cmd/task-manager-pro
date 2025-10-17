-- CreateTable
CREATE TABLE "Task" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "complexity" TEXT NOT NULL,
    "deadline" TIMESTAMP(3),
    "tags" TEXT[],
    "estimatedHours" INTEGER NOT NULL,
    "dependencies" INTEGER[],
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Task_priority_category_idx" ON "Task"("priority", "category");

-- CreateIndex
CREATE INDEX "Task_completed_idx" ON "Task"("completed");
