import { NextResponse } from "next/server";

import {
  getCurrentUser,
  logout,
} from "@/lib/auth";

import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const user = await getCurrentUser();

    if (user) {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "LOGOUT",
          details: "ログアウトしました。",
        },
      });
    }

    await logout();

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("ログアウトエラー:", error);

    return NextResponse.json(
      {
        error: "ログアウトに失敗しました。",
      },
      {
        status: 500,
      }
    );
  }
}