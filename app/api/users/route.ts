import { NextResponse } from "next/server";

import {
  getCurrentUser,
  hashPassword,
} from "@/lib/auth";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          error: "認証が必要です。",
        },
        {
          status: 401,
        }
      );
    }

    if (currentUser.role !== "ADMIN") {
      return NextResponse.json(
        {
          error: "ユーザー管理の権限がありません。",
        },
        {
          status: 403,
        }
      );
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      users,
    });
  } catch (error) {
    console.error("ユーザー一覧取得エラー:", error);

    return NextResponse.json(
      {
        error: "ユーザー一覧の取得に失敗しました。",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          error: "認証が必要です。",
        },
        {
          status: 401,
        }
      );
    }

    if (currentUser.role !== "ADMIN") {
      return NextResponse.json(
        {
          error: "ユーザー作成の権限がありません。",
        },
        {
          status: 403,
        }
      );
    }

    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    const role =
      typeof body.role === "string"
        ? body.role
        : "EDITOR";

    if (!name || !email || !password) {
      return NextResponse.json(
        {
          error: "名前・メールアドレス・パスワードを入力してください。",
        },
        {
          status: 400,
        }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          error: "パスワードは8文字以上で設定してください。",
        },
        {
          status: 400,
        }
      );
    }

    if (!["ADMIN", "EDITOR", "VIEWER"].includes(role)) {
      return NextResponse.json(
        {
          error: "不正な権限が指定されています。",
        },
        {
          status: 400,
        }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "このメールアドレスは既に登録されています。",
        },
        {
          status: 409,
        }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role as "ADMIN" | "EDITOR" | "VIEWER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: "USER_CREATE",
        details: `ユーザー「${user.name}」(${user.email})を作成しました。`,
      },
    });

    return NextResponse.json(
      {
        success: true,
        user,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("ユーザー作成エラー:", error);

    return NextResponse.json(
      {
        error: "ユーザーの作成に失敗しました。",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          error: "認証が必要です。",
        },
        {
          status: 401,
        }
      );
    }

    if (currentUser.role !== "ADMIN") {
      return NextResponse.json(
        {
          error: "ユーザー編集の権限がありません。",
        },
        {
          status: 403,
        }
      );
    }

    const url = new URL(request.url);
    const userId = url.searchParams.get("id");

    if (!userId) {
      return NextResponse.json(
        {
          error: "編集対象のユーザーIDが指定されていません。",
        },
        {
          status: 400,
        }
      );
    }

    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    const role =
      typeof body.role === "string"
        ? body.role
        : "";

    if (!name || !email || !role) {
      return NextResponse.json(
        {
          error: "名前・メールアドレス・権限を入力してください。",
        },
        {
          status: 400,
        }
      );
    }

    if (!["ADMIN", "EDITOR", "VIEWER"].includes(role)) {
      return NextResponse.json(
        {
          error: "不正な権限が指定されています。",
        },
        {
          status: 400,
        }
      );
    }

    if (password && password.length < 8) {
      return NextResponse.json(
        {
          error: "パスワードは8文字以上で設定してください。",
        },
        {
          status: 400,
        }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        {
          error: "編集対象のユーザーが見つかりません。",
        },
        {
          status: 404,
        }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });

    if (existingUser && existingUser.id !== userId) {
      return NextResponse.json(
        {
          error: "このメールアドレスは既に別のユーザーが使用しています。",
        },
        {
          status: 409,
        }
      );
    }

    /*
     * 最後の管理者を管理者以外へ変更することを禁止
     */
    if (
      targetUser.role === "ADMIN" &&
      role !== "ADMIN"
    ) {
      const adminCount = await prisma.user.count({
        where: {
          role: "ADMIN",
        },
      });

      if (adminCount <= 1) {
        return NextResponse.json(
          {
            error:
              "最後の管理者の権限は変更できません。別の管理者を登録してから変更してください。",
          },
          {
            status: 400,
          }
        );
      }
    }

    const data: {
      name: string;
      email: string;
      role: "ADMIN" | "EDITOR" | "VIEWER";
      passwordHash?: string;
    } = {
      name,
      email,
      role: role as "ADMIN" | "EDITOR" | "VIEWER",
    };

    if (password) {
      data.passwordHash = await hashPassword(password);
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    const changes: string[] = [];

    if (targetUser.name !== updatedUser.name) {
      changes.push(
        `名前: ${targetUser.name} → ${updatedUser.name}`
      );
    }

    if (targetUser.email !== updatedUser.email) {
      changes.push(
        `メール: ${targetUser.email} → ${updatedUser.email}`
      );
    }

    if (targetUser.role !== updatedUser.role) {
      changes.push(
        `権限: ${targetUser.role} → ${updatedUser.role}`
      );
    }

    if (password) {
      changes.push("パスワード変更");
    }

    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: "USER_UPDATE",
        details:
          changes.length > 0
            ? `ユーザー「${updatedUser.name}」(${updatedUser.email})を編集しました。${changes.join(" / ")}`
            : `ユーザー「${updatedUser.name}」(${updatedUser.email})を編集しました。`,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("ユーザー編集エラー:", error);

    return NextResponse.json(
      {
        error: "ユーザーの編集に失敗しました。",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          error: "認証が必要です。",
        },
        {
          status: 401,
        }
      );
    }

    if (currentUser.role !== "ADMIN") {
      return NextResponse.json(
        {
          error: "ユーザー削除の権限がありません。",
        },
        {
          status: 403,
        }
      );
    }

    const url = new URL(request.url);
    const userId = url.searchParams.get("id");

    if (!userId) {
      return NextResponse.json(
        {
          error: "削除対象のユーザーIDが指定されていません。",
        },
        {
          status: 400,
        }
      );
    }

    if (userId === currentUser.id) {
      return NextResponse.json(
        {
          error: "現在ログインしている自分自身は削除できません。",
        },
        {
          status: 400,
        }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        {
          error: "削除対象のユーザーが見つかりません。",
        },
        {
          status: 404,
        }
      );
    }

    if (targetUser.role === "ADMIN") {
      const adminCount = await prisma.user.count({
        where: {
          role: "ADMIN",
        },
      });

      if (adminCount <= 1) {
        return NextResponse.json(
          {
            error:
              "最後の管理者は削除できません。別の管理者を登録してから削除してください。",
          },
          {
            status: 400,
          }
        );
      }
    }

    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: "USER_DELETE",
        details: `ユーザー「${targetUser.name}」(${targetUser.email})を削除しました。`,
      },
    });

    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("ユーザー削除エラー:", error);

    return NextResponse.json(
      {
        error: "ユーザーの削除に失敗しました。",
      },
      {
        status: 500,
      }
    );
  }
}
