import { NextResponse } from "next/server";

import {
  createSession,
  verifyPassword,
} from "@/lib/auth";

import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    if (!email || !password) {
      return NextResponse.json(
        {
          error: "メールアドレスとパスワードを入力してください。",
        },
        {
          status: 400,
        }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: "メールアドレスまたはパスワードが正しくありません。",
        },
        {
          status: 401,
        }
      );
    }

    const passwordValid = await verifyPassword(
      password,
      user.passwordHash
    );

    if (!passwordValid) {
      return NextResponse.json(
        {
          error: "メールアドレスまたはパスワードが正しくありません。",
        },
        {
          status: 401,
        }
      );
    }

    await createSession(user.id);

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "LOGIN",
        details: "ログインしました。",
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("===== LOGIN ERROR =====");
    console.error(error);
    console.error("name:", error instanceof Error ? error.name : "unknown");
    console.error("message:", error instanceof Error ? error.message : String(error));
    console.error("stack:", error instanceof Error ? error.stack : "");

    return NextResponse.json(
      {
        error: "ログインに失敗しました。",
      },
      {
        status: 500,
      }
    );
  }
}