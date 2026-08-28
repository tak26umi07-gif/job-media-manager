import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  requireUser,
  UnauthorizedError,
} from "@/lib/auth";

type RouteContext = {
  params: Promise<{
    id: string;
    media: string;
  }>;
};

const allowedMedia = [
  "INDEED",
  "JOB_BOX",
  "ENGAGE",
  "OTHER",
] as const;

function isValidMedia(
  media: string
): media is (typeof allowedMedia)[number] {
  return allowedMedia.includes(
    media as (typeof allowedMedia)[number]
  );
}

/**
 * GET
 *
 * 求人媒体ごとの掲載原稿を取得
 */
export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    await requireUser();

    const { id, media } = await context.params;

    if (!isValidMedia(media)) {
      return NextResponse.json(
        {
          error: "対応していない求人媒体です。",
        },
        {
          status: 400,
        }
      );
    }

    const jobMedia =
      await prisma.jobMedia.findUnique({
        where: {
          jobId_media: {
            jobId: id,
            media,
          },
        },
        include: {
          content: true,
          job: {
            include: {
              company: true,
            },
          },
        },
      });

    if (!jobMedia) {
      return NextResponse.json(
        {
          error:
            "この求人の媒体情報が見つかりません。",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      media: jobMedia,
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
      "媒体掲載原稿取得エラー:",
      error
    );

    return NextResponse.json(
      {
        error:
          "媒体掲載原稿の取得に失敗しました。",
        detail:
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

/**
 * PUT
 *
 * 求人媒体ごとの掲載原稿を保存
 */
export async function PUT(
  request: Request,
  context: RouteContext
) {
  try {
    const user = await requireUser();

    const { id, media } = await context.params;

    if (!isValidMedia(media)) {
      return NextResponse.json(
        {
          error: "対応していない求人媒体です。",
        },
        {
          status: 400,
        }
      );
    }

    const body = await request.json();

    const {
      title,
      catchCopy,
      description,
      salary,
      location,
      employmentType,
      workingHours,
      holidays,
      benefits,
      requirements,
      application,
    } = body;

    if (!title || !description) {
      return NextResponse.json(
        {
          error:
            "掲載タイトルと仕事内容は必須です。",
        },
        {
          status: 400,
        }
      );
    }

    const jobMedia =
      await prisma.jobMedia.findUnique({
        where: {
          jobId_media: {
            jobId: id,
            media,
          },
        },
      });

    if (!jobMedia) {
      return NextResponse.json(
        {
          error:
            "この求人の媒体情報が見つかりません。",
        },
        {
          status: 404,
        }
      );
    }

    const content =
      await prisma.mediaListingContent.upsert({
        where: {
          jobMediaId: jobMedia.id,
        },
        update: {
          title,
          catchCopy: catchCopy || null,
          description,
          salary: salary || null,
          location: location || null,
          employmentType:
            employmentType || null,
          workingHours:
            workingHours || null,
          holidays: holidays || null,
          benefits: benefits || null,
          requirements:
            requirements || null,
          application:
            application || null,
        },
        create: {
          jobMediaId: jobMedia.id,
          title,
          catchCopy: catchCopy || null,
          description,
          salary: salary || null,
          location: location || null,
          employmentType:
            employmentType || null,
          workingHours:
            workingHours || null,
          holidays: holidays || null,
          benefits: benefits || null,
          requirements:
            requirements || null,
          application:
            application || null,
        },
      });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        jobId: id,
        action: "MEDIA_CONTENT_UPDATED",
        details:
          `媒体「${media}」の掲載原稿を更新しました。`,
      },
    });

    return NextResponse.json({
      success: true,
      content,
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
      "媒体掲載原稿保存エラー:",
      error
    );

    return NextResponse.json(
      {
        error:
          "媒体掲載原稿の保存に失敗しました。",
        detail:
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
