-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('DRAFT', 'READY', 'PUBLISHED', 'CLOSED');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('INDEED', 'JOB_BOX', 'ENGAGE', 'OTHER');

-- CreateEnum
CREATE TYPE "MediaStatus" AS ENUM ('NOT_PUBLISHED', 'PENDING', 'PUBLISHED', 'ERROR', 'CLOSED');

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "employmentType" TEXT NOT NULL,
    "salary" TEXT NOT NULL,
    "workingHours" TEXT,
    "description" TEXT NOT NULL,
    "requirements" TEXT,
    "holidays" TEXT,
    "benefits" TEXT,
    "status" "JobStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobMedia" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "media" "MediaType" NOT NULL,
    "status" "MediaStatus" NOT NULL DEFAULT 'NOT_PUBLISHED',
    "externalJobId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobMedia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JobMedia_jobId_media_key" ON "JobMedia"("jobId", "media");

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobMedia" ADD CONSTRAINT "JobMedia_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
