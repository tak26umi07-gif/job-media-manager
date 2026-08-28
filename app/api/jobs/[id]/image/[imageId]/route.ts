import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, UnauthorizedError } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

type RouteContext = {
  params: Promise<{
    id: string;
    imageId: string;
  }>;
};

export async function DELETE(
  request: Request,
  { params }: RouteContext
) {
  try {
        await requireUser();

const { id, imageId } = await params;

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

    await prisma.jobImage.delete({
      where: {
        id: imageId,
      },
    });

    try {
      const filePath = path.join(
        process.cwd(),
        "public",
        image.imageUrl.replace(/^\/+/, "")
      );

      await fs.unlink(filePath);
    } catch (fileError) {
      console.warn(
        "画像ファイル削除に失敗しました:",
        fileError
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {

    if (error instanceof UnauthorizedError) {

      return NextResponse.json(

        { error: "ログインが必要です。" },

        { status: 401 }

      );

    }
    console.error("画像削除エラー:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "画像の削除に失敗しました。",
      },
      { status: 500 }
    );
  }
}
