import { NextResponse } from "next/server";
import { requireUser, UnauthorizedError } from "@/lib/auth";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function normalizeTags(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .filter(
          (tag): tag is string =>
            typeof tag === "string"
        )
        .map((tag) => tag.trim())
        .filter(Boolean)
        .filter((tag) => tag.length <= 30)
    )
  ).slice(0, 10);
}

export async function POST(
  request: Request
) {
  try {
    await requireUser();
    const body = await request.json();
    const jobId = body.jobId;

    if (
      typeof jobId !== "string" ||
      !jobId.trim()
    ) {
      return NextResponse.json(
        {
          error: "求人IDが指定されていません。",
        },
        {
          status: 400,
        }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error:
            "OPENAI_API_KEYが設定されていません。",
        },
        {
          status: 500,
        }
      );
    }

    const job = await prisma.job.findUnique({
      where: {
        id: jobId,
      },
      include: {
        company: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json(
        {
          error: "求人が見つかりません。",
        },
        {
          status: 404,
        }
      );
    }

    const currentTags = job.tags.map(
      (relation) => relation.tag.name
    );

    const sourceText = `
求人タイトル:
${job.title}

会社名:
${job.company?.name ?? ""}

勤務地:
${job.location ?? ""}

雇用形態:
${job.employmentType ?? ""}

給与:
${job.salary ?? ""}

勤務時間:
${job.workingHours ?? ""}

仕事内容:
${job.description ?? ""}

応募条件:
${job.requirements ?? ""}

休日:
${job.holidays ?? ""}

福利厚生:
${job.benefits ?? ""}

職種カテゴリ:
${job.jobCategory ?? ""}

ポジション:
${job.position ?? ""}

募集人数:
${job.recruitmentCount ?? ""}

勤務地詳細:
${job.locationDetail ?? ""}

最寄駅:
${job.nearestStation ?? ""}

アクセス:
${job.access ?? ""}

休憩時間:
${job.breakTime ?? ""}

残業:
${job.overtime ?? ""}

転勤:
${job.transfer ?? ""}

出張:
${job.businessTrip ?? ""}

給与形態:
${job.salaryType ?? ""}

最低給与:
${job.minSalary ?? ""}

最高給与:
${job.maxSalary ?? ""}

固定残業代:
${job.fixedOvertimePay ?? ""}

固定残業時間:
${job.fixedOvertimeHours ?? ""}

交通費:
${job.transportation ?? ""}

賞与:
${job.bonus ?? ""}

昇給:
${job.raise ?? ""}

インセンティブ:
${job.incentive ?? ""}

年間休日:
${job.annualHolidays ?? ""}

有給休暇:
${job.paidLeave ?? ""}

長期休暇:
${job.longVacation ?? ""}

その他休暇:
${job.otherLeave ?? ""}

社会保険:
${job.socialInsurance ?? ""}

雇用保険:
${job.employmentInsurance ?? ""}

労災保険:
${job.workersCompensation ?? ""}

厚生年金:
${job.pension ?? ""}

必須条件:
${job.requiredConditions ?? ""}

歓迎条件:
${job.preferredConditions ?? ""}

資格:
${job.qualifications ?? ""}

経験:
${job.experience ?? ""}

学歴:
${job.education ?? ""}

年齢条件:
${job.ageCondition ?? ""}

PCスキル:
${job.pcSkills ?? ""}

運転免許:
${job.driverLicense ?? ""}

現在設定されているタグ:
${currentTags.join(", ")}
`;

    const response =
      await openai.responses.create({
        model: "gpt-5.6",
        input: [
          {
            role: "system",
            content: `
あなたは求人管理システムのタグ選定AIです。

求人情報を分析して、
この求人を管理・検索するために適切なタグを
5〜10個選定してください。

重要ルール:

- JSON以外は絶対に返さない
- 以下の形式だけを返す

{
  "tags": []
}

タグは短く分かりやすい日本語にする。

優先するタグ:

・職種
・雇用形態
・未経験歓迎
・経験者優遇
・資格
・勤務地
・駅近
・高収入
・土日祝休み
・年間休日
・残業少なめ
・転勤なし
・インセンティブ
・賞与
・昇給
・交通費支給
・福利厚生
・学歴不問
・資格不要
・第二新卒歓迎
・経験不問
・普通免許必須

原文から明確に判断できる内容だけをタグにする。

推測でタグを追加しない。

「おすすめ」「人気」など
根拠のない抽象的なタグは禁止。

既存タグが設定されている場合も、
求人内容を改めて分析して、
より適切なタグに入れ替える。

同じ意味のタグを重複させない。

1タグ30文字以内。

#記号は付けない。
`,
          },
          {
            role: "user",
            content: sourceText,
          },
        ],
      });

    const text =
      response.output_text?.trim();

    if (!text) {
      return NextResponse.json(
        {
          error:
            "AIからタグ選定結果を取得できませんでした。",
        },
        {
          status: 500,
        }
      );
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(text);
    } catch {
      console.error(
        "AIタグJSON解析失敗:",
        text
      );

      return NextResponse.json(
        {
          error:
            "AIのタグ選定結果を処理できませんでした。",
        },
        {
          status: 500,
        }
      );
    }

    const parsedObject =
      parsed &&
      typeof parsed === "object"
        ? (parsed as Record<string, unknown>)
        : {};

    const tags = normalizeTags(
      parsedObject.tags
    );

    return NextResponse.json({
      success: true,
      tags,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { error: "ログインが必要です。" },
        { status: 401 }
      );
    }

    console.error(
      "AIタグ再選定エラー:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "AIによるタグ再選定に失敗しました。",
      },
      {
        status: 500,
      }
    );
  }
}
