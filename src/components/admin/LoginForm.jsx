
"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Eye, EyeOff, LockKeyhole, ArrowRight } from "lucide-react";

import { adminLoginAction } from "@/app/admin/login/actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-13 w-full items-center justify-center gap-3 bg-[#A61922] px-6 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#86141B] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Giriş yapılıyor..." : "Yönetici Girişi"}
      {!pending && <ArrowRight size={17} />}
    </button>
  );
}

export default function LoginForm() {
  const [state, formAction] = useActionState(
    adminLoginAction,
    { error: null }
  );

  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="mt-7 space-y-5 sm:mt-8">
      <div>
        <label
          htmlFor="email"
          className="mb-3 block text-xs font-semibold uppercase tracking-[0.14em] text-[#6C706C]"
        >
          E-posta Adresi
        </label>

        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          maxLength={254}
          placeholder="E-posta adresiniz"
          className="h-13 w-full border-0 border-b border-[#D4D7D2] bg-transparent px-0 text-sm text-[#1A1D1A] outline-none transition-colors focus:border-[#A61922] focus:outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-3 block text-xs font-semibold uppercase tracking-[0.14em] text-[#6C706C]"
        >
          Şifre
        </label>

        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="Yönetici şifreniz"
            className="h-13 w-full border-0 border-b border-[#D4D7D2] bg-transparent px-0 pr-12 text-sm text-[#1A1D1A] outline-none transition-colors focus:border-[#A61922] focus:outline-none"
          />

          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={
              showPassword ? "Şifreyi gizle" : "Şifreyi göster"
            }
            className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-[#777C77] transition-colors hover:text-[#A61922]"
          >
            {showPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        </div>
      </div>

      {state?.error && (
        <p
          role="alert"
          className="border-l-2 border-[#A61922] bg-[#A61922]/5 px-4 py-3 text-sm text-[#A61922]"
        >
          {state.error}
        </p>
      )}

      <SubmitButton />

      <div className="flex items-center justify-center gap-2 pt-2 text-xs text-[#777C77]">
        <LockKeyhole size={14} />
        Güvenli yönetici erişimi
      </div>
    </form>
  );
}
