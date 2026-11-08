"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export async function customerLoginAction(previousState, formData) {
  const identifier = String(formData.get("identifier") ?? "")
    .trim()
    .toLowerCase();

  const password = String(formData.get("password") ?? "");

  if (!identifier || !password) {
    return {
      error: "Kullanıcı adı veya e-posta ve şifre zorunludur.",
    };
  }

  if (identifier.length > 254 || password.length > 1024) {
    return {
      error: "Giriş bilgileri geçersiz.",
    };
  }

  const isAdminLogin = identifier.includes("@");

  try {
    if (isAdminLogin) {
      await signIn("credentials", {
        email: identifier,
        password,
        redirectTo: "/admin",
      });
    } else {
      await signIn("customer-credentials", {
        username: identifier,
        password,
        redirectTo: "/hesabim",
      });
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error: "Giriş bilgileri hatalı veya hesap aktif değil.",
      };
    }

    // Next.js başarılı girişten sonra yönlendirme
    // sinyali gönderir. Bu hata olarak yakalanmamalıdır.
    throw error;
  }

  return { error: null };
}
