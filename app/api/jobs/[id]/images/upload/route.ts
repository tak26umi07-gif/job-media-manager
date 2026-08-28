import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, UnauthorizedError } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

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

    const job = await prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      return NextResponse.json(
        { error: "求人が見つかりません。" },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "画像ファイルが指定されていません。" },
        { status: 400 }
      );
    }

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "PNG、JPEG、WebP形式の画像のみアップロードできます。",
        },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: "画像サイズは10MB以下にしてください。",
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const extension =
      file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : "jpg";

    const fileName = `${id}-${crypto.randomUUID()}.${extension}`;

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

    const existingMainImage =
      await prisma.jobImage.findFirst({
        where: {
          jobId: id,
          isMain: true,
        },
      });

    const image = await prisma.jobImage.create({
      data: {
        jobId: id,
        imageUrl: relativePath,
        prompt: "アップロード画像",
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
    console.error("画像アップロードエラー:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "画像のアップロードに失敗しました。",
      },
      { status: 500 }
    );
  }
}
