import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, UnauthorizedError } from "@/lib/auth";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const allowedMedia = [
  "INDEED",
  "JOB_BOX",
  "ENGAGE",
  "OTHER",
] as const;

const allowedStatuses = [
  "NOT_PUBLISHED",
  "PENDING",
  "PUBLISHED",
  "ERROR",
  "CLOSED",
] as const;

export async function POST(
  request: Request,
  { params }: RouteContext
) {
  try {
        await requireUser();

const { id } = await params;
    const body = await request.json();

    const media = body.media;

    if (!media || !allowedMedia.includes(media)) {
      return NextResponse.json(
        {
          error: "有効な媒体を指定してください。",
        },
        {
          status: 400,
        }
      );
    }

    const job = await prisma.job.findUnique({
      where: {
        id,
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

    const existing = await prisma.jobMedia.findUnique({
      where: {
        jobId_media: {
          jobId: id,
          media,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          error: "この媒体はすでに登録されています。",
        },
        {
          status: 409,
        }
      );
    }

    const mediaListing = await prisma.jobMedia.create({
      data: {
        jobId: id,
        media,
        status: "NOT_PUBLISHED",
      },
    });

    return NextResponse.json(
      {
        success: true,
        mediaListing,
      },
      {
        status: 201,
      }
    );
  } catch (error) {

    if (error instanceof UnauthorizedError) {

      return NextResponse.json(

        { error: "ログインが必要です。" },

        { status: 401 }

      );

    }
    console.error("媒体登録エラー:", error);

    return NextResponse.json(
      {
        error: "媒体の登録に失敗しました。",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  try {
        await requireUser();

const { id } = await params;
    const body = await request.json();

    const {
      mediaId,
      status,
      externalJobId,
      listingUrl,
      publishedAt,
      closedAt,
      errorMessage,
    } = body;

    if (!mediaId) {
      return NextResponse.json(
        {
          error: "媒体IDを指定してください。",
        },
        {
          status: 400,
        }
      );
    }

    if (
      status !== undefined &&
      !allowedStatuses.includes(status)
    ) {
      return NextResponse.json(
        {
          error: "無効な掲載ステータスです。",
        },
        {
          status: 400,
        }
      );
    }

    const job = await prisma.job.findUnique({
      where: {
        id,
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

    const mediaListing = await prisma.jobMedia.findFirst({
      where: {
        id: mediaId,
        jobId: id,
      },
    });

    if (!mediaListing) {
      return NextResponse.json(
        {
          error: "媒体情報が見つかりません。",
        },
        {
          status: 404,
        }
      );
    }

    const nextStatus =
      status ?? mediaListing.status;

    let nextPublishedAt =
      publishedAt !== undefined
        ? publishedAt
          ? new Date(publishedAt)
          : null
        : mediaListing.publishedAt;

    let nextClosedAt =
      closedAt !== undefined
        ? closedAt
          ? new Date(closedAt)
          : null
        : mediaListing.closedAt;

    if (
      nextStatus === "PUBLISHED" &&
      !nextPublishedAt
    ) {
      nextPublishedAt = new Date();
    }

    if (
      nextStatus === "CLOSED" &&
      !nextClosedAt
    ) {
      nextClosedAt = new Date();
    }

    if (
      nextStatus === "NOT_PUBLISHED"
    ) {
      nextClosedAt = null;
    }

    const updated = await prisma.jobMedia.update({
      where: {
        id: mediaId,
      },
      data: {
        status: nextStatus,
        externalJobId:
          externalJobId !== undefined
            ? externalJobId || null
            : mediaListing.externalJobId,
        listingUrl:
          listingUrl !== undefined
            ? listingUrl || null
            : mediaListing.listingUrl,
        publishedAt: nextPublishedAt,
        closedAt: nextClosedAt,
        errorMessage:
          errorMessage !== undefined
            ? errorMessage || null
            : mediaListing.errorMessage,
      },
    });

    return NextResponse.json({
      success: true,
      mediaListing: updated,
    });
  } catch (error) {

    if (error instanceof UnauthorizedError) {

      return NextResponse.json(

        { error: "ログインが必要です。" },

        { status: 401 }

      );

    }
    console.error("媒体情報更新エラー:", error);

    return NextResponse.json(
      {
        error: "媒体情報の更新に失敗しました。",
      },
      {
        status: 500,
      }
    );
  }
}
