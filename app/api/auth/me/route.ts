import { NextResponse } from "next/server";

import {
  getAuthenticatedUser,
} from "@/lib/auth";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        {
          user: null,
        },
        {
          status: 401,
        }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("===== AUTH ME ERROR =====");
    console.error(error);

    return NextResponse.json(
      {
        error: "認証情報の取得に失敗しました。",
      },
      {
        status: 500,
      }
    );
  }
}
