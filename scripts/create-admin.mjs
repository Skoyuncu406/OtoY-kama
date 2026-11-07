import "dotenv/config";

import { createInterface } from "node:readline";
import { stdin, stdout } from "node:process";
import { PrismaClient } from "../src/generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const rl = createInterface({
  input: stdin,
  output: stdout,
  terminal: true,
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function askPassword() {
  const password = await ask("Yönetici şifresi (yazarken görünür): ");

  return password;
}

async function main() {
  const connectionString = process.env.DIRECT_URL;

  if (!connectionString) {
    throw new Error("DIRECT_URL bulunamadı.");
  }

  const adapter = new PrismaPg({
    connectionString,
  });

  const prisma = new PrismaClient({ adapter });

  try {
    console.log("\nVICIX — Yönetici Hesabı Oluşturma\n");

    const name = (await ask("Yönetici adı: ")).trim();
    const email = (await ask("E-posta adresi: ")).trim().toLowerCase();

    const password = await askPassword();

    if (!name) {
      throw new Error("Yönetici adı boş olamaz.");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Geçerli bir e-posta adresi gir.");
    }

    if (password.length < 12 || password.length > 72) {
      throw new Error("Şifre 12–72 karakter arasında olmalıdır.");
    }

    const existingAdmin = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      throw new Error("Bu e-posta adresiyle bir yönetici zaten mevcut.");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.adminUser.create({
      data: {
        name,
        email,
        passwordHash,
        isActive: true,
      },
    });

    console.log("\nYönetici hesabı başarıyla oluşturuldu.");
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error("\nHata:", error.message);
    process.exitCode = 1;
  })
  .finally(() => {
    rl.close();
  });
