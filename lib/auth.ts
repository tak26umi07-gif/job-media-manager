import { cookies } from "next/headers";
import crypto from "crypto";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

const SESSION_COOKIE_NAME = "job_media_session";

const SESSION_DURATION_DAYS = 7;

function createSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

function hashSessionToken(token: string) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  passwordHash: string
) {
  return bcrypt.compare(password, passwordHash);
}

export async function createSession(userId: string) {
  const token = createSessionToken();
  const tokenHash = hashSessionToken(token);

  const expiresAt = new Date(
    Date.now() +
      SESSION_DURATION_DAYS *
        24 *
        60 *
        60 *
        1000
  );

  await prisma.session.create({
    data: {
      tokenHash,
      userId,
      expiresAt,
    },
  });

  const cookieStore = await cookies();

  cookieStore.set(
    SESSION_COOKIE_NAME,
    token,
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    }
  );

  return {
    expiresAt,
  };
}

export async function getCurrentUser() {
  const cookieStore = await cookies();

  const token = cookieStore.get(
    SESSION_COOKIE_NAME
  )?.value;

  if (!token) {
    return null;
  }

  const tokenHash = hashSessionToken(token);

  const session =
    await prisma.session.findUnique({
      where: {
        tokenHash,
      },
      include: {
        user: true,
      },
    });

  if (!session) {
    return null;
  }

  if (session.expiresAt <= new Date()) {
    await prisma.session.delete({
      where: {
        id: session.id,
      },
    });

    return null;
  }

  return session.user;
}

export class UnauthorizedError extends Error {
  constructor() {
    super("UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new UnauthorizedError();
  }

  return user;
}

export async function logout() {
  const cookieStore = await cookies();

  const token = cookieStore.get(
    SESSION_COOKIE_NAME
  )?.value;

  if (token) {
    const tokenHash = hashSessionToken(token);

    await prisma.session.deleteMany({
      where: {
        tokenHash,
      },
    });
  }

  cookieStore.delete(
    SESSION_COOKIE_NAME
  );
}

export async function getAuthenticatedUser() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return user;
}