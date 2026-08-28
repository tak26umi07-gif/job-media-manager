import { NextResponse } from "next/server";
import { requireUser, UnauthorizedError } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function csvValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  const text = String(value);

  return `"${text.replace(/"/g, '""').replace(/\r?\n/g, "\r\n")}"`;
}

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    await requireUser();
    const { id } = await params;

    const job = await prisma.job.findUnique({
      where: {
        id,
      },
      include: {
        company: true,
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: "求人が見つかりません。" },
        { status: 404 }
      );
    }

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
      "福利厚生",
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
      "ステータス",
      "登録日時",
      "最終更新日時",
    ];

    const values = [
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
      job.createdAt.toISOString(),
      job.updatedAt.toISOString(),
    ];

    const csv = [
      headers.map(csvValue).join(","),
      values.map(csvValue).join(","),
    ].join("\r\n");

    // Excel / Googleスプレッドシートで日本語が文字化けしないようBOMを付ける
    const csvWithBom = "\uFEFF" + csv;

    return new NextResponse(csvWithBom, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="job-${job.id}.csv"`,
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

    console.error("CSV export error:", error);

    return NextResponse.json(
      { error: "CSV出力に失敗しました。" },
      { status: 500 }
    );
  }
}
