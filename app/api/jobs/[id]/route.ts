import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, UnauthorizedError } from "@/lib/auth";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const allowedStatuses = [
  "DRAFT",
  "READY",
  "PUBLISHED",
  "CLOSED",
] as const;

type JobStatusValue = (typeof allowedStatuses)[number];

function toNullableInt(value: unknown): number | null {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return null;
  }

  return Math.trunc(numberValue);
}

/**
 * GET
 * 求人編集画面などから求人情報を取得
 */
export async function GET(
  request: Request,
  { params }: RouteContext
) {
  try {
    await requireUser();

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          error: "求人IDが指定されていません。",
        },
        {
          status: 400,
        }
      );
    }

    const job = await prisma.job.findUnique({
      where: {
        id,
      },
      include: {
        company: true,
        tags: {
          include: {
            tag: true,
          },
        },
        mediaListings: true,
      },
    });

    if (!job) {
      return NextResponse.json(
        {
          error: "指定された求人が見つかりません。",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...job,
        companyName: job.company.name,
      },
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

    console.error("求人情報取得エラー:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "求人情報の取得に失敗しました。",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * PATCH
 * 求人情報を更新
 */
export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  try {
    await requireUser();

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          error: "求人IDが指定されていません。",
        },
        {
          status: 400,
        }
      );
    }

    const body = await request.json();

    const existingJob =
      await prisma.job.findUnique({
        where: {
          id,
        },
        include: {
          company: true,
        },
      });

    if (!existingJob) {
      return NextResponse.json(
        {
          error: "指定された求人が見つかりません。",
        },
        {
          status: 404,
        }
      );
    }

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
      tags,
    } = body;

    if (
      typeof title !== "string" ||
      !title.trim()
    ) {
      return NextResponse.json(
        {
          error: "求人タイトルを入力してください。",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof location !== "string" ||
      !location.trim()
    ) {
      return NextResponse.json(
        {
          error: "勤務地を入力してください。",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof employmentType !== "string" ||
      !employmentType.trim()
    ) {
      return NextResponse.json(
        {
          error: "雇用形態を入力してください。",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof salary !== "string" ||
      !salary.trim()
    ) {
      return NextResponse.json(
        {
          error: "給与を入力してください。",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof description !== "string" ||
      !description.trim()
    ) {
      return NextResponse.json(
        {
          error: "仕事内容を入力してください。",
        },
        {
          status: 400,
        }
      );
    }

    let nextStatus: JobStatusValue =
      existingJob.status;

    if (status !== undefined) {
      if (
        !allowedStatuses.includes(status)
      ) {
        return NextResponse.json(
          {
            error: "無効な求人ステータスです。",
          },
          {
            status: 400,
          }
        );
      }

      nextStatus = status;
    }

    let companyId =
      existingJob.companyId;

    if (
      typeof companyName === "string" &&
      companyName.trim()
    ) {
      const trimmedCompanyName =
        companyName.trim();

      if (
        trimmedCompanyName !==
        existingJob.company.name
      ) {
        const company =
          await prisma.company.upsert({
            where: {
              name: trimmedCompanyName,
            },
            update: {},
            create: {
              name: trimmedCompanyName,
            },
          });

        companyId = company.id;
      }
    }

    const updatedJob =
      await prisma.job.update({
        where: {
          id,
        },
        data: {
          companyId,

          title: title.trim(),
          location: location.trim(),
          employmentType:
            employmentType.trim(),
          salary: salary.trim(),

          workingHours:
            workingHours || null,

          description:
            description.trim(),

          requirements:
            requirements || null,

          holidays:
            holidays || null,

          benefits:
            benefits || null,

          sourceText:
            sourceText || null,

          jobCategory:
            jobCategory || null,

          position:
            position || null,

          recruitmentCount:
            toNullableInt(
              recruitmentCount
            ),

          locationDetail:
            locationDetail || null,

          nearestStation:
            nearestStation || null,

          access:
            access || null,

          breakTime:
            breakTime || null,

          overtime:
            overtime || null,

          transfer:
            transfer || null,

          businessTrip:
            businessTrip || null,

          salaryType:
            salaryType || null,

          minSalary:
            toNullableInt(minSalary),

          maxSalary:
            toNullableInt(maxSalary),

          fixedOvertimePay:
            fixedOvertimePay || null,

          fixedOvertimeHours:
            fixedOvertimeHours || null,

          transportation:
            transportation || null,

          bonus:
            bonus || null,

          raise:
            raise || null,

          incentive:
            incentive || null,

          annualHolidays:
            annualHolidays || null,

          paidLeave:
            paidLeave || null,

          longVacation:
            longVacation || null,

          otherLeave:
            otherLeave || null,

          socialInsurance:
            socialInsurance || null,

          employmentInsurance:
            employmentInsurance || null,

          workersCompensation:
            workersCompensation || null,

          pension:
            pension || null,

          requiredConditions:
            requiredConditions || null,

          preferredConditions:
            preferredConditions || null,

          qualifications:
            qualifications || null,

          experience:
            experience || null,

          education:
            education || null,

          ageCondition:
            ageCondition || null,

          pcSkills:
            pcSkills || null,

          driverLicense:
            driverLicense || null,

          applicationMethod:
            applicationMethod || null,

          selectionProcess:
            selectionProcess || null,

          interviewCount:
            interviewCount || null,

          interviewLocation:
            interviewLocation || null,

          requiredDocuments:
            requiredDocuments || null,

          recruiterName:
            recruiterName || null,

          recruiterEmail:
            recruiterEmail || null,

          recruiterPhone:
            recruiterPhone || null,

          status: nextStatus,
        },

        include: {
          company: true,
        },
      });

    const tagNames: string[] =
      Array.isArray(tags)
        ? tags
            .filter(
              (tag: unknown): tag is string =>
                typeof tag === "string"
            )
            .map((tag: string) =>
              tag.trim()
            )
            .filter(
              (tag: string) =>
                tag.length > 0
            )
        : [];

    await prisma.$transaction(
      async (tx) => {
        await tx.jobTagRelation.deleteMany({
          where: {
            jobId: id,
          },
        });

        for (const tagName of tagNames) {
          const tag =
            await tx.jobTag.upsert({
              where: {
                name: tagName,
              },
              update: {},
              create: {
                name: tagName,
              },
            });

          await tx.jobTagRelation.create({
            data: {
              jobId: id,
              tagId: tag.id,
            },
          });
        }
      }
    );

    const finalJob =
      await prisma.job.findUnique({
        where: {
          id,
        },
        include: {
          company: true,
          tags: {
            include: {
              tag: true,
            },
          },
          mediaListings: true,
        },
      });

    return NextResponse.json({
      success: true,
      data: {
        ...finalJob,
        companyName:
          finalJob?.company.name,
      },
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

    console.error(
      "求人情報更新エラー:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "求人情報の更新に失敗しました。",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * DELETE
 * 求人を削除
 */
export async function DELETE(
  request: Request,
  { params }: RouteContext
) {
  try {
    await requireUser();

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          error: "求人IDが指定されていません。",
        },
        {
          status: 400,
        }
      );
    }

    const job =
      await prisma.job.findUnique({
        where: {
          id,
        },
      });

    if (!job) {
      return NextResponse.json(
        {
          error: "指定された求人が見つかりません。",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.job.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "求人を削除しました。",
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

    console.error(
      "求人削除エラー:",
      error
    );

    return NextResponse.json(
      {
        error: "求人の削除に失敗しました。",
      },
      {
        status: 500,
      }
    );
  }
}
