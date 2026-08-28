-- CreateTable
CREATE TABLE "JobTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobTagRelation" (
    "jobId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "JobTagRelation_pkey" PRIMARY KEY ("jobId","tagId")
);

-- CreateIndex
CREATE UNIQUE INDEX "JobTag_name_key" ON "JobTag"("name");

-- CreateIndex
CREATE INDEX "JobTagRelation_tagId_idx" ON "JobTagRelation"("tagId");

-- AddForeignKey
ALTER TABLE "JobTagRelation" ADD CONSTRAINT "JobTagRelation_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobTagRelation" ADD CONSTRAINT "JobTagRelation_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "JobTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
