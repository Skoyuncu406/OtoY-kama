"use server";

import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";

import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Kullanıcı adı en az 3 karakter olmalıdır.")
    .max(30, "Kullanıcı adı en fazla 30 karakter olabilir.")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Kullanıcı adı yalnızca harf, rakam ve alt çizgi içerebilir.",
    ),

  email: z
    .email("Geçerli bir e-posta adresi giriniz.")
    .max(254, "E-posta adresi çok uzun."),

  password: z
    .string()
    .min(12, "Şifre en az 12 karakter olmalıdır.")
    .max(72, "Şifre en fazla 72 karakter olabilir."),
});

export async function registerCustomerAction(previousState, formData) {
  const parsed = registerSchema.safeParse({
    username: String(formData.get("username") ?? "")
      .trim()
      .toLowerCase(),

    email: String(formData.get("email") ?? "")
      .trim()
      .toLowerCase(),

    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Bilgileri kontrol edin.",
    };
  }

  const { username, email, password } = parsed.data;

  try {
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
      select: {
        username: true,
        email: true,
      },
    });

    if (existingCustomer?.username === username) {
      return {
        success: false,
        error: "Bu kullanıcı adı zaten kullanılıyor.",
      };
    }

    if (existingCustomer?.email === email) {
      return {
        success: false,
        error: "Bu e-posta adresi zaten kullanılıyor.",
      };
    }

    const passwordHash = await hashPassword(password);

    await prisma.customer.create({
      data: {
        username,
        email,
        passwordHash,
        isActive: true,
      },
    });

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        error: "Kullanıcı adı veya e-posta adresi zaten kayıtlı.",
      };
    }

    console.error("VICIX müşteri kayıt hatası:", error);

    return {
      success: false,
      error: "Kayıt işlemi tamamlanamadı. Lütfen tekrar deneyin.",
    };
  }
}
