-- CreateTable
CREATE TABLE "JobImage" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "prompt" TEXT,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JobImage_jobId_idx" ON "JobImage"("jobId");

-- AddForeignKey
ALTER TABLE "JobImage" ADD CONSTRAINT "JobImage_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
