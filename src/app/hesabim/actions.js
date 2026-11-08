"use server";

import { revalidatePath } from "next/cache";
import { hashPassword } from "@/lib/password";
import { z } from "zod";

import { auth, signOut } from "@/auth";
import prisma from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";

const updateProfileSchema = z.object({
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

  currentPassword: z.string().min(1, "Mevcut şifrenizi giriniz."),
});

export async function updateCustomerProfileAction(previousState, formData) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "customer") {
    return {
      success: false,
      error: "İşlem için müşteri hesabınıza giriş yapmalısınız.",
    };
  }

  const parsed = updateProfileSchema.safeParse({
    username: String(formData.get("username") ?? "")
      .trim()
      .toLowerCase(),

    email: String(formData.get("email") ?? "")
      .trim()
      .toLowerCase(),

    currentPassword: String(formData.get("currentPassword") ?? ""),
  });

  if (!parsed.success) {
    return {
      success: false,
      error:
        parsed.error.issues[0]?.message || "Lütfen bilgilerinizi kontrol edin.",
    };
  }

  const { username, email, currentPassword } = parsed.data;

  try {
    const customer = await prisma.customer.findUnique({
      where: {
        id: session.user.id,
      },
    });

    if (!customer || !customer.isActive) {
      return {
        success: false,
        error: "Müşteri hesabı bulunamadı veya aktif değil.",
      };
    }

    const validPassword = await verifyPassword(
      currentPassword,
      customer.passwordHash,
    );

    if (!validPassword) {
      return {
        success: false,
        error: "Mevcut şifreniz hatalı.",
      };
    }

    if (customer.username === username && customer.email === email) {
      return {
        success: false,
        error: "Herhangi bir değişiklik yapılmadı.",
      };
    }

    const existingCustomer = await prisma.customer.findFirst({
      where: {
        AND: [
          {
            id: {
              not: customer.id,
            },
          },
          {
            OR: [{ username }, { email }],
          },
        ],
      },
      select: {
        username: true,
        email: true,
      },
    });

    if (existingCustomer?.username === username) {
      return {
        success: false,
        error: "Bu kullanıcı adı başka bir hesapta kullanılıyor.",
      };
    }

    if (existingCustomer?.email === email) {
      return {
        success: false,
        error: "Bu e-posta adresi başka bir hesapta kullanılıyor.",
      };
    }

    await prisma.customer.update({
      where: {
        id: customer.id,
      },
      data: {
        username,
        email,
      },
    });

    revalidatePath("/hesabim");

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    if (error?.code === "P2002") {
      return {
        success: false,
        error: "Kullanıcı adı veya e-posta adresi zaten kullanılıyor.",
      };
    }

    console.error("VICIX profil güncelleme hatası:", error);

    return {
      success: false,
      error: "Bilgiler güncellenemedi. Lütfen tekrar deneyin.",
    };
  }
}

export async function customerLogoutAction() {
  await signOut({
    redirectTo: "/giris-yap",
  });
}

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mevcut şifrenizi giriniz."),
    newPassword: z
      .string()
      .min(12, "Yeni şifre en az 12 karakter olmalıdır.")
      .max(72, "Yeni şifre en fazla 72 karakter olabilir."),
    confirmPassword: z.string().min(1, "Yeni şifrenizi doğrulayınız."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Yeni şifreler eşleşmiyor.",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "Yeni şifre mevcut şifrenizden farklı olmalıdır.",
    path: ["newPassword"],
  });

export async function changeCustomerPasswordAction(previousState, formData) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "customer") {
    return {
      success: false,
      error: "Bu işlem için müşteri hesabınıza giriş yapmalısınız.",
    };
  }

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Bilgileri kontrol ediniz.",
    };
  }

  const { currentPassword, newPassword } = parsed.data;

  try {
    const customer = await prisma.customer.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        isActive: true,
        passwordHash: true,
      },
    });

    if (!customer || !customer.isActive) {
      return {
        success: false,
        error: "Müşteri hesabı bulunamadı veya aktif değil.",
      };
    }

    const passwordValid = await verifyPassword(
      currentPassword,
      customer.passwordHash,
    );

    if (!passwordValid) {
      return {
        success: false,
        error: "Mevcut şifreniz hatalı.",
      };
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        passwordHash,
        sessionVersion: {
          increment: 1,
        },
      },
    });

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error("VICIX şifre değiştirme hatası:", error);

    return {
      success: false,
      error: "Şifre güncellenemedi. Lütfen tekrar deneyin.",
    };
  }
}
