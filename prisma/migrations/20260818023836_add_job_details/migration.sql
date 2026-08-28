-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "access" TEXT,
ADD COLUMN     "ageCondition" TEXT,
ADD COLUMN     "annualHolidays" TEXT,
ADD COLUMN     "applicationMethod" TEXT,
ADD COLUMN     "bonus" TEXT,
ADD COLUMN     "breakTime" TEXT,
ADD COLUMN     "businessTrip" TEXT,
ADD COLUMN     "driverLicense" TEXT,
ADD COLUMN     "education" TEXT,
ADD COLUMN     "employmentInsurance" TEXT,
ADD COLUMN     "experience" TEXT,
ADD COLUMN     "fixedOvertimeHours" TEXT,
ADD COLUMN     "fixedOvertimePay" TEXT,
ADD COLUMN     "incentive" TEXT,
ADD COLUMN     "interviewCount" TEXT,
ADD COLUMN     "interviewLocation" TEXT,
ADD COLUMN     "jobCategory" TEXT,
ADD COLUMN     "locationDetail" TEXT,
ADD COLUMN     "longVacation" TEXT,
ADD COLUMN     "maxSalary" INTEGER,
ADD COLUMN     "minSalary" INTEGER,
ADD COLUMN     "nearestStation" TEXT,
ADD COLUMN     "otherLeave" TEXT,
ADD COLUMN     "overtime" TEXT,
ADD COLUMN     "paidLeave" TEXT,
ADD COLUMN     "pcSkills" TEXT,
ADD COLUMN     "pension" TEXT,
ADD COLUMN     "position" TEXT,
ADD COLUMN     "preferredConditions" TEXT,
ADD COLUMN     "qualifications" TEXT,
ADD COLUMN     "raise" TEXT,
ADD COLUMN     "recruiterEmail" TEXT,
ADD COLUMN     "recruiterName" TEXT,
ADD COLUMN     "recruiterPhone" TEXT,
ADD COLUMN     "recruitmentCount" INTEGER,
ADD COLUMN     "requiredConditions" TEXT,
ADD COLUMN     "requiredDocuments" TEXT,
ADD COLUMN     "salaryType" TEXT,
ADD COLUMN     "selectionProcess" TEXT,
ADD COLUMN     "socialInsurance" TEXT,
ADD COLUMN     "sourceText" TEXT,
ADD COLUMN     "transfer" TEXT,
ADD COLUMN     "transportation" TEXT,
ADD COLUMN     "workersCompensation" TEXT;

-- CreateTable
CREATE TABLE "MediaListingContent" (
    "id" TEXT NOT NULL,
    "jobMediaId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "catchCopy" TEXT,
    "description" TEXT NOT NULL,
    "salary" TEXT,
    "location" TEXT,
    "employmentType" TEXT,
    "workingHours" TEXT,
    "holidays" TEXT,
    "benefits" TEXT,
    "requirements" TEXT,
    "application" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaListingContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MediaListingContent_jobMediaId_key" ON "MediaListingContent"("jobMediaId");

-- AddForeignKey
ALTER TABLE "MediaListingContent" ADD CONSTRAINT "MediaListingContent_jobMediaId_fkey" FOREIGN KEY ("jobMediaId") REFERENCES "JobMedia"("id") ON DELETE CASCADE ON UPDATE CASCADE;
