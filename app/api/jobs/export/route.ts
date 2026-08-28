import { NextResponse } from "next/server";
import { requireUser, UnauthorizedError } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function escapeCsv(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  let text = "";

  if (value instanceof Date) {
    text = value.toISOString();
  } else if (typeof value === "object") {
    text = JSON.stringify(value);
  } else {
    text = String(value);
  }

  if (
    text.includes('"') ||
    text.includes(",") ||
    text.includes("\n") ||
    text.includes("\r")
  ) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

export async function GET(request: Request) {
  try {
    await requireUser();
    const { searchParams } = new URL(request.url);

    const idsParam = searchParams.get("ids");

    const ids = idsParam
      ? idsParam
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean)
      : [];

    const jobs = await prisma.job.findMany({
      where:
        ids.length > 0
          ? {
              id: {
                in: ids,
              },
            }
          : undefined,
      include: {
        company: true,
        mediaListings: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const headers = [
      "求人ID",
      "会社名",
      "求人タイトル",
      "職種カテゴリ",
      "ポジション",
      "募集人数",
      "雇用形態",
      "勤務地",
      "勤務地詳細",
      "最寄り駅",
      "アクセス",
      "勤務時間",
      "休憩時間",
      "残業",
      "転勤",
      "出張",
      "交通費",
      "給与",
      "給与形態",
      "給与下限",
      "給与上限",
      "固定残業代",
      "固定残業時間",
      "賞与",
      "昇給",
      "インセンティブ",
      "仕事内容",
      "応募条件",
      "必須条件",
      "歓迎条件",
      "資格",
      "経験",
      "学歴",
      "年齢条件",
      "PCスキル",
      "運転免許",
      "休日・休暇",
      "年間休日",
      "有給休暇",
      "長期休暇",
      "その他休暇",
      "福利厚生・待遇",
      "社会保険",
      "雇用保険",
      "労災保険",
      "年金",
      "応募方法",
      "選考フロー",
      "面接回数",
      "面接場所",
      "必要書類",
      "採用担当者",
      "採用担当メール",
      "採用担当電話",
      "求人ステータス",
      "Indeed",
      "求人ボックス",
      "engage",
      "元案件情報",
      "登録日時",
      "最終更新",
    ];

    const rows = jobs.map((job) => {
      const getMediaStatus = (media: string) => {
        const listing = job.mediaListings.find(
          (item) => item.media === media
        );

        if (!listing) {
          return "未掲載";
        }

        switch (listing.status) {
          case "PUBLISHED":
            return "掲載中";
          case "PENDING":
            return "処理中";
          case "ERROR":
            return "エラー";
          case "CLOSED":
            return "掲載終了";
          default:
            return "未掲載";
        }
      };

      return [
        job.id,
        job.company?.name,
        job.title,
        job.jobCategory,
        job.position,
        job.recruitmentCount,
        job.employmentType,
        job.location,
        job.locationDetail,
        job.nearestStation,
        job.access,
        job.workingHours,
        job.breakTime,
        job.overtime,
        job.transfer,
        job.businessTrip,
        job.transportation,
        job.salary,
        job.salaryType,
        job.minSalary,
        job.maxSalary,
        job.fixedOvertimePay,
        job.fixedOvertimeHours,
        job.bonus,
        job.raise,
        job.incentive,
        job.description,
        job.requirements,
        job.requiredConditions,
        job.preferredConditions,
        job.qualifications,
        job.experience,
        job.education,
        job.ageCondition,
        job.pcSkills,
        job.driverLicense,
        job.holidays,
        job.annualHolidays,
        job.paidLeave,
        job.longVacation,
        job.otherLeave,
        job.benefits,
        job.socialInsurance,
        job.employmentInsurance,
        job.workersCompensation,
        job.pension,
        job.applicationMethod,
        job.selectionProcess,
        job.interviewCount,
        job.interviewLocation,
        job.requiredDocuments,
        job.recruiterName,
        job.recruiterEmail,
        job.recruiterPhone,
        job.status,
        getMediaStatus("INDEED"),
        getMediaStatus("JOB_BOX"),
        getMediaStatus("ENGAGE"),
        job.sourceText,
        job.createdAt,
        job.updatedAt,
      ];
    });

    const csv = [
      headers.map(escapeCsv).join(","),
      ...rows.map((row) =>
        row.map(escapeCsv).join(",")
      ),
    ].join("\r\n");

    // UTF-8 BOM付きでExcel・Googleスプレッドシート向けに出力
    const csvWithBom = "\uFEFF" + csv;

    const body = new TextEncoder().encode(csvWithBom);

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="jobs.csv"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { error: "ログインが必要です。" },
        { status: 401 }
      );
    }

    console.error("求人CSV出力エラー:", error);

    return NextResponse.json(
      {
        error:
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

