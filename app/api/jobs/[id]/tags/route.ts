import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, UnauthorizedError } from "@/lib/auth";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

// 求人に付いているタグを取得
export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
        await requireUser();

const { id } = await context.params;

    const relations = await prisma.jobTagRelation.findMany({
      where: {
        jobId: id,
      },
      include: {
        tag: true,
      },
      orderBy: {
        tag: {
          name: "asc",
        },
      },
    });

    return NextResponse.json({
      success: true,
      tags: relations.map((relation) => relation.tag),
    });
  } catch (error) {

    if (error instanceof UnauthorizedError) {

      return NextResponse.json(

        { error: "ログインが必要です。" },

        { status: 401 }

      );

    }
    console.error("求人タグ取得エラー:", error);

    return NextResponse.json(
      {
        error: "求人タグの取得に失敗しました。",
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

// 求人にタグを追加
export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
        await requireUser();

const { id } = await context.params;
    const body = await request.json();

    const tagId =
      typeof body.tagId === "string"
        ? body.tagId.trim()
        : "";

    const tagName =
      typeof body.tagName === "string"
        ? body.tagName.trim()
        : "";

    if (!tagId && !tagName) {
      return NextResponse.json(
        {
          error: "tagId または tagName を指定してください。",
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

    let tag;

    // 既存タグをIDで指定
    if (tagId) {
      tag = await prisma.jobTag.findUnique({
        where: {
          id: tagId,
        },
      });

      if (!tag) {
        return NextResponse.json(
          {
            error: "指定されたタグが見つかりません。",
          },
          {
            status: 404,
          }
        );
      }
    } else {
      // タグ名から取得。なければ作成
      tag = await prisma.jobTag.upsert({
        where: {
          name: tagName,
        },
        update: {},
        create: {
          name: tagName,
        },
      });
    }

    // 求人とタグを紐付け
    const relation = await prisma.jobTagRelation.upsert({
      where: {
        jobId_tagId: {
          jobId: id,
          tagId: tag.id,
        },
      },
      update: {},
      create: {
        jobId: id,
        tagId: tag.id,
      },
      include: {
        tag: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        tag: relation.tag,
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
    console.error("求人タグ追加エラー:", error);

    return NextResponse.json(
      {
        error: "求人タグの追加に失敗しました。",
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

// 求人からタグを削除
export async function DELETE(
  request: Request,
  context: RouteContext
) {
  try {
        await requireUser();

const { id } = await context.params;
    const { searchParams } = new URL(request.url);

    const tagId = searchParams.get("tagId");

    if (!tagId) {
      return NextResponse.json(
        {
          error: "tagId を指定してください。",
        },
        {
          status: 400,
        }
      );
    }

    await prisma.jobTagRelation.deleteMany({
      where: {
        jobId: id,
        tagId,
      },
    });

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
    console.error("求人タグ削除エラー:", error);

    return NextResponse.json(
      {
        error: "求人タグの削除に失敗しました。",
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