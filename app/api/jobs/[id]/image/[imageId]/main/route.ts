import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, UnauthorizedError } from "@/lib/auth";

type RouteContext = {
  params: Promise<{
    id: string;
    imageId: string;
  }>;
};

export async function PATCH(
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

    await prisma.$transaction([
      prisma.jobImage.updateMany({
        where: {
          jobId: id,
        },
        data: {
          isMain: false,
        },
      }),

      prisma.jobImage.update({
        where: {
          id: imageId,
        },
        data: {
          isMain: true,
        },
      }),
    ]);

    const updatedImage =
      await prisma.jobImage.findUnique({
        where: {
          id: imageId,
        },
      });

    return NextResponse.json({
      success: true,
      image: updatedImage,
    });
  } catch (error) {

    if (error instanceof UnauthorizedError) {

      return NextResponse.json(

        { error: "ログインが必要です。" },

        { status: 401 }

      );

    }
    console.error(
      "メイン画像変更エラー:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "メイン画像の変更に失敗しました。",
      },
      { status: 500 }
    );
  }
}
