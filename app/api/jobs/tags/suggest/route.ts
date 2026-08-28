import { NextResponse } from "next/server";
import { requireUser, UnauthorizedError } from "@/lib/auth";
import OpenAI from "openai";

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

export async function POST(request: Request) {
  try {
    await requireUser();
    const body = await request.json();

    const job = body.job;
    const availableTags = Array.isArray(body.availableTags)
      ? body.availableTags.filter(
          (tag: unknown): tag is string =>
            typeof tag === "string" && tag.trim() !== ""
        )
      : [];

    if (!job || typeof job !== "object") {
      return NextResponse.json(
        {
          error: "求人情報が指定されていません。",
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
            "OPENAI_API_KEYが設定されていません。.envを確認してください。",
        },
        {
          status: 500,
        }
      );
    }

    const jobText = JSON.stringify(job, null, 2);

    const tagListText =
      availableTags.length > 0
        ? availableTags.join("、")
        : "まだ登録されているタグはありません。";

    const response = await openai.responses.create({
      model: "gpt-5.6",
      input: [
        {
          role: "system",
          content: `
あなたは求人管理システムのタグ選定AIです。

求人情報を分析し、この求人に適した管理用タグを選定してください。

重要なルール:

- 基本的には「既存タグ一覧」の中から選択してください。
- 既存タグに適切なものがない場合のみ、新しいタグを提案して構いません。
- 求人情報から明確に判断できる内容だけをタグにしてください。
- 根拠のない内容を推測してはいけません。
- 5〜10個程度を目安にしてください。
- 同じ意味のタグを重複させないでください。
- 1つのタグは30文字以内にしてください。
- 「おすすめ」「人気」など抽象的なタグは使用しないでください。
- ハッシュタグ記号「#」は付けないでください。

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

既存タグ一覧:
${tagListText}

返答は必ず以下のJSONだけにしてください。

{
  "tags": [
    "タグ1",
    "タグ2"
  ]
}
          `,
        },
        {
          role: "user",
          content: `
以下の求人情報を分析してください。

${jobText}
          `,
        },
      ],
    });

    const text = response.output_text?.trim();

    if (!text) {
      return NextResponse.json(
        {
          error: "AIからタグ候補を取得できませんでした。",
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
      parsed && typeof parsed === "object"
        ? (parsed as Record<string, unknown>)
        : {};

    const tags = normalizeTags(parsedObject.tags);

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
      "AIタグ選定エラー:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "AIによるタグ選定に失敗しました。",
      },
      {
        status: 500,
      }
    );
  }
}
