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
    imageId: string;
  }>;
};

export async function POST(
  request: Request,
  { params }: RouteContext
) {
  try {
        await requireUser();

const { id, imageId } = await params;

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error:
            "OPENAI_API_KEYが設定されていません。",
        },
        { status: 500 }
      );
    }

    const body = await request.json();

    const instruction =
      typeof body.instruction === "string"
        ? body.instruction.trim()
        : "";

    if (!instruction) {
      return NextResponse.json(
        {
          error: "編集指示を入力してください。",
        },
        { status: 400 }
      );
    }

    const image = await prisma.jobImage.findFirst({
      where: {
        id: imageId,
        jobId: id,
      },
    });

    if (!image) {
      return NextResponse.json(
        {
          error: "画像が見つかりません。",
        },
        { status: 404 }
      );
    }

    const imagePath = path.join(
      process.cwd(),
      "public",
      image.imageUrl.replace(/^\/+/, "")
    );

    const imageBuffer = await fs.readFile(imagePath);

    const extension = path.extname(imagePath).toLowerCase();

    const mimeType =
      extension === ".jpg" || extension === ".jpeg"
        ? "image/jpeg"
        : extension === ".webp"
          ? "image/webp"
          : "image/png";

    const inputFile = await OpenAI.toFile(
      imageBuffer,
      `source${extension || ".png"}`,
      {
        type: mimeType,
      }
    );

    const prompt = `
あなたは求人広告用の画像編集デザイナーです。

元画像の基本的な構図・求人広告としての見やすさ・自然な写真表現をできるだけ維持してください。

ユーザーからの編集指示:
${instruction}

追加条件:
- 求人サイトのサムネイルとして利用できる品質にする
- 不自然な人物や手を生成しない
- 実在企業のロゴを勝手に生成しない
- 意味不明な文字を画像内に入れない
- 大量の文字を画像内に入れない
- 商用求人広告として自然で清潔感のあるデザインにする
`;

    const result = await openai.images.edit({
      model: "gpt-image-1",
      image: inputFile,
      prompt,
      size: "1536x1024",
      quality: "medium",
    });

    const imageData = result.data?.[0]?.b64_json;

    if (!imageData) {
      return NextResponse.json(
        {
          error:
            "AI編集画像を生成できませんでした。",
        },
        { status: 500 }
      );
    }

    const buffer = Buffer.from(
      imageData,
      "base64"
    );

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

    const newImage = await prisma.jobImage.create({
      data: {
        jobId: id,
        imageUrl: relativePath,
        prompt: `AI編集: ${instruction}`,
        isMain: false,
      },
    });

    return NextResponse.json({
      success: true,
      image: newImage,
    });
  } catch (error) {

    if (error instanceof UnauthorizedError) {

      return NextResponse.json(

        { error: "ログインが必要です。" },

        { status: 401 }

      );

    }
    console.error("AI画像編集エラー:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "AI画像編集に失敗しました。",
      },
      { status: 500 }
    );
  }
}
