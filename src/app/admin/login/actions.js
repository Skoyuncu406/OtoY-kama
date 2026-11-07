"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export async function adminLoginAction(previousState, formData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return {
      error: "E-posta ve şifre alanları zorunludur.",
    };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/admin",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error: "E-posta veya şifre hatalı.",
      };
    }

    throw error;
  }

  return { error: null };
}
