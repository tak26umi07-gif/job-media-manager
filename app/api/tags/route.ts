import { NextResponse } from "next/server";
import { requireUser, UnauthorizedError } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireUser();
    const tags = await prisma.jobTag.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return new NextResponse(
      JSON.stringify({
        tags,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      }
    );
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { error: "ログインが必要です。" },
        { status: 401 }
      );
    }

    console.error("タグ取得エラー:", error);

    return new NextResponse(
      JSON.stringify({
        error: "タグの取得に失敗しました。",
        detail:
          error instanceof Error
            ? error.message
            : String(error),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireUser();
    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    if (!name) {
      return new NextResponse(
        JSON.stringify({
          error: "タグ名を入力してください。",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        }
      );
    }

    const tag = await prisma.jobTag.upsert({
      where: {
        name,
      },
      update: {},
      create: {
        name,
      },
    });

    return new NextResponse(
      JSON.stringify({
        tag,
      }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      }
    );
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { error: "ログインが必要です。" },
        { status: 401 }
      );
    }

    console.error("タグ作成エラー:", error);

    return new NextResponse(
      JSON.stringify({
        error: "タグの作成に失敗しました。",
        detail:
          error instanceof Error
            ? error.message
            : String(error),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      }
    );
  }
}