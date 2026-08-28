import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, UnauthorizedError } from "@/lib/auth";

function parseNumber(value: unknown): number | null {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const text = value.trim();

  if (!text) {
    return null;
  }

  // 「25万円」「25万」など
  const manMatch = text.match(
    /([\d,]+(?:\.\d+)?)\s*万/
  );

  if (manMatch) {
    const number = Number(
      manMatch[1].replace(/,/g, "")
    );

    if (Number.isFinite(number)) {
      return Math.round(number * 10000);
    }
  }

  // 「250,000円」「250000円」「5名」など
  const numberMatch = text.match(
    /[\d,]+(?:\.\d+)?/
  );

  if (numberMatch) {
    const number = Number(
      numberMatch[0].replace(/,/g, "")
    );

    return Number.isFinite(number)
      ? number
      : null;
  }

  return null;
}
export async function POST(request: Request) {
  try {
    const user = await requireUser();

    const body = await request.json();

    const {
      title,
      companyName,
      location,
      employmentType,
      salary,
      workingHours,
      description,
      requirements,
      holidays,
      benefits,
      sourceText,

      jobCategory,
      position,
      recruitmentCount,
      locationDetail,
      nearestStation,
      access,
      breakTime,
      overtime,
      transfer,
      businessTrip,

      salaryType,
      minSalary,
      maxSalary,
      fixedOvertimePay,
      fixedOvertimeHours,
      transportation,
      bonus,
      raise,
      incentive,

      annualHolidays,
      paidLeave,
      longVacation,
      otherLeave,

      socialInsurance,
      employmentInsurance,
      workersCompensation,
      pension,

      requiredConditions,
      preferredConditions,
      qualifications,
      experience,
      education,
      ageCondition,
      pcSkills,
      driverLicense,

      applicationMethod,
      selectionProcess,
      interviewCount,
      interviewLocation,
      requiredDocuments,
      recruiterName,
      recruiterEmail,
      recruiterPhone,

      status,

      // タグ
      tags,
    } = body;

    if (
      !title ||
      !companyName ||
      !location ||
      !employmentType ||
      !salary ||
      !description
    ) {
      return NextResponse.json(
        {
          error:
            "求人タイトル、会社名、勤務地、雇用形態、給与、仕事内容は必須です。",
        },
        {
          status: 400,
        }
      );
    }

    const company = await prisma.company.upsert({
      where: {
        name: companyName,
      },
      update: {},
      create: {
        name: companyName,
      },
    });

    const jobStatus =
      status === "DRAFT"
        ? "DRAFT"
        : "READY";

    const job = await prisma.job.create({
      data: {
        companyId: company.id,

        createdById: user.id,
        updatedById: user.id,

        title,
        location,
        employmentType,
        salary,
        workingHours: workingHours || null,
        description,
        requirements: requirements || null,
        holidays: holidays || null,
        benefits: benefits || null,

        sourceText: sourceText || null,

        jobCategory: jobCategory || null,
        position: position || null,
        recruitmentCount: parseNumber(recruitmentCount),
        locationDetail: locationDetail || null,
        nearestStation: nearestStation || null,
        access: access || null,
        breakTime: breakTime || null,
        overtime: overtime || null,
        transfer: transfer || null,
        businessTrip: businessTrip || null,

        salaryType: salaryType || null,
        minSalary: parseNumber(minSalary),
        maxSalary: parseNumber(maxSalary),
        fixedOvertimePay: fixedOvertimePay || null,
        fixedOvertimeHours: fixedOvertimeHours || null,
        transportation: transportation || null,
        bonus: bonus || null,
        raise: raise || null,
        incentive: incentive || null,

        annualHolidays: annualHolidays || null,
        paidLeave: paidLeave || null,
        longVacation: longVacation || null,
        otherLeave: otherLeave || null,

        socialInsurance: socialInsurance || null,
        employmentInsurance: employmentInsurance || null,
        workersCompensation: workersCompensation || null,
        pension: pension || null,

        requiredConditions: requiredConditions || null,
        preferredConditions: preferredConditions || null,
        qualifications: qualifications || null,
        experience: experience || null,
        education: education || null,
        ageCondition: ageCondition || null,
        pcSkills: pcSkills || null,
        driverLicense: driverLicense || null,

        applicationMethod: applicationMethod || null,
        selectionProcess: selectionProcess || null,
        interviewCount: interviewCount || null,
        interviewLocation: interviewLocation || null,
        requiredDocuments: requiredDocuments || null,
        recruiterName: recruiterName || null,
        recruiterEmail: recruiterEmail || null,
        recruiterPhone: recruiterPhone || null,

        status: jobStatus,
      },
    });

    // -----------------------------------------
    // タグを求人に紐付け
    // -----------------------------------------

    if (Array.isArray(tags) && tags.length > 0) {
      // 文字列だけを取り出して空文字を除外
      const tagNames = Array.from(
        new Set(
          tags
            .filter(
              (tag: unknown): tag is string =>
                typeof tag === "string"
            )
            .map((tag: string) => tag.trim())
            .filter(Boolean)
        )
      );

      for (const tagName of tagNames) {
        const tag = await prisma.jobTag.upsert({
          where: {
            name: tagName,
          },
          update: {},
          create: {
            name: tagName,
          },
        });

        await prisma.jobTagRelation.upsert({
          where: {
            jobId_tagId: {
              jobId: job.id,
              tagId: tag.id,
            },
          },
          update: {},
          create: {
            jobId: job.id,
            tagId: tag.id,
          },
        });
      }
    }


    await prisma.jobMedia.createMany({
      data: [
        {
          jobId: job.id,
          media: "INDEED",
          status: "NOT_PUBLISHED",
        },
        {
          jobId: job.id,
          media: "JOB_BOX",
          status: "NOT_PUBLISHED",
        },
        {
          jobId: job.id,
          media: "ENGAGE",
          status: "NOT_PUBLISHED",
        },
      ],
    });

    // --------------------------------------------------------
    // 操作ログ
    // --------------------------------------------------------

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        jobId: job.id,
        action: "JOB_CREATED",
        details: `求人「${job.title}」を作成しました。`,
      },
    });

    // タグ込みで求人を取得
    const createdJob = await prisma.job.findUnique({
      where: {
        id: job.id,
      },
      include: {
        company: true,
        mediaListings: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        job: createdJob,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        {
          error: "ログインが必要です。",
        },
        {
          status: 401,
        }
      );
    }

    console.error("求人登録エラー:", error);

    return NextResponse.json(
      {
        error: "求人の登録に失敗しました。",
        detail:
          error instanceof Error
            ? error.message
            : String(error),
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET() {
  try {
    await requireUser();

    const jobs = await prisma.job.findMany({
      include: {
        company: true,
        mediaListings: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      jobs,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        {
          error: "ログインが必要です。",
        },
        {
          status: 401,
        }
      );
    }

    console.error("求人取得エラー:", error);

    return NextResponse.json(
      {
        error: "求人の取得に失敗しました。",
        detail:
          error instanceof Error
            ? error.message
            : String(error),
      },
      {
        status: 500,
      }
    );
  }
}



