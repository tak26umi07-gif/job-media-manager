import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import readline from "readline";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

function ask(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log("");
  console.log("===== Job Media Manager 管理者作成 =====");
  console.log("");

  const name = await ask("管理者名: ");
  const email = (
    await ask("メールアドレス: ")
  ).toLowerCase();

  const password = await ask(
    "パスワード: "
  );

  if (!name || !email || !password) {
    throw new Error(
      "名前・メールアドレス・パスワードは必須です。"
    );
  }

  if (password.length < 8) {
    throw new Error(
      "パスワードは8文字以上にしてください。"
    );
  }

  const existingUser =
    await prisma.user.findUnique({
      where: {
        email,
      },
    });

  if (existingUser) {
    throw new Error(
      `このメールアドレスは既に登録されています: ${email}`
    );
  }

  const passwordHash =
    await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("");
  console.log("===== 管理者作成完了 =====");
  console.log(`ID: ${user.id}`);
  console.log(`名前: ${user.name}`);
  console.log(`メール: ${user.email}`);
  console.log(`権限: ${user.role}`);
  console.log("");
}

main()
  .catch((error) => {
    console.error("");
    console.error("管理者作成エラー:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });