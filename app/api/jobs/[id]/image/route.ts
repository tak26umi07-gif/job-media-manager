import { NextResponse } from "next/server";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { requireUser, UnauthorizedError } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  request: Request,
  { params }: RouteContext
) {
  try {
        await requireUser();

const { id } = await params;

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
        {
          error: "求人が見つかりません。",
        },
        {
          status: 404,
        }
      );
    }

    const prompt = `
あなたは求人広告用のプロモーション画像を作成する
プロの広告デザイナーです。

以下の求人情報をもとに、
求職者が「この求人を詳しく見たい」と感じる
求人サイト用のメインビジュアル画像を作成してください。

【会社名】
${job.company.name}

【求人タイトル】
${job.title}

【勤務地】
${job.location}

【雇用形態】
${job.employmentType}

【給与】
${job.salary}

【勤務時間】
${job.workingHours || "記載なし"}

【仕事内容】
${job.description}

【応募条件】
${job.requirements || "記載なし"}

【休日】
${job.holidays || "記載なし"}

【福利厚生】
${job.benefits || "記載なし"}

デザイン条件:

- 日本の求人サイトで使用する求人広告画像
- 清潔感があり、信頼感のあるデザイン
- 求職者が見やすい構図
- 職種・仕事内容に合った自然な写真表現
- 人物が必要な場合は自然でリアルな人物
- 過度に派手な広告表現にしない
- 高品質な商用広告写真風
- 企業ロゴは勝手に作成しない
- 実在企業のロゴやブランドを勝手に再現しない
- 画像内に大量の文字を入れない
- 不自然な文字・意味不明な文字を生成しない
- 求人サイトのサムネイルとして見やすい横長構図
`;

    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1536x1024",
      quality: "medium",
    });

    const imageData = result.data?.[0]?.b64_json;

    if (!imageData) {
      return NextResponse.json(
        {
          error: "AI画像を生成できませんでした。",
        },
        {
          status: 500,
        }
      );
    }

    const buffer = Buffer.from(imageData, "base64");

    const fileName = `${id}-${crypto.randomUUID()}.png`;

    const relativePath =
      `/generated/job-images/${fileName}`;

    const filePath = path.join(
      process.cwd(),
      "public",
      "generated",
      "job-images",
      fileName
    );

    await fs.writeFile(filePath, buffer);

    const existingMainImage = await prisma.jobImage.findFirst({
      where: {
        jobId: id,
        isMain: true,
      },
    });

    const image = await prisma.jobImage.create({
      data: {
        jobId: id,
        imageUrl: relativePath,
        prompt,
        isMain: !existingMainImage,
      },
    });

    return NextResponse.json({
      success: true,
      image,
    });
  } catch (error) {

    if (error instanceof UnauthorizedError) {

      return NextResponse.json(

        { error: "ログインが必要です。" },

        { status: 401 }

      );

    }
    console.error("求人画像生成エラー:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "求人画像の生成に失敗しました。",
      },
      {
        status: 500,
      }
    );
  }
}
