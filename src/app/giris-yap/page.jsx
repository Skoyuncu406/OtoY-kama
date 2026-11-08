
"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  UserRound,
} from "lucide-react";

import { customerLoginAction } from "./actions";

const initialState = {
  error: null,
};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(
    customerLoginAction,
    initialState
  );

  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="min-h-[85svh] w-full overflow-x-hidden bg-[#F4F3EF] text-[#111312]">
      <div className="mx-auto grid min-h-[85svh] w-full max-w-[1320px] lg:grid-cols-2">
        {/* SOL ALAN */}
        <div className="relative hidden overflow-hidden border-r border-[#D8DBD7] px-12 py-16 lg:flex lg:flex-col lg:justify-between xl:px-20">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#A61922]">
              VICIX / ACCOUNT ACCESS
            </span>

            <h1 className="mt-10 max-w-[500px] font-[family-name:var(--font-manrope)] text-[clamp(3.2rem,5vw,5.5rem)] font-semibold leading-[1.03] tracking-[-0.065em]">
              Yeniden
              <span className="block text-[#858B85]">
                hoş geldiniz.
              </span>
            </h1>

            <p className="mt-8 max-w-[370px] text-[14px] leading-8 text-[#626A64]">
              VICIX hesabınıza giriş yapın.
              Araç bakım deneyiminize kaldığınız yerden
              devam edin.
            </p>
          </div>

          <div className="border-t border-[#D8DBD7] pt-7">
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#858B85]">
              VICIX CAR CARE
            </span>

            <p className="mt-3 text-[13px] leading-6 text-[#626A64]">
              Her detayda profesyonel bakım.
            </p>
          </div>
        </div>

        {/* GİRİŞ FORMU */}
        <div className="flex min-w-0 items-center justify-center px-5 py-14 sm:px-10 lg:px-12 xl:px-20">
          <div className="w-full max-w-[430px]">
            <div className="mb-10">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A61922]">
                VICIX / SECURE LOGIN
              </span>

              <h2 className="mt-4 font-[family-name:var(--font-manrope)] text-[clamp(2.2rem,4vw,3.3rem)] font-semibold tracking-[-0.055em]">
                Giriş Yap
              </h2>

              <p className="mt-3 text-[13px] leading-7 text-[#626A64]">
                Hesabınıza erişmek için giriş bilgilerinizi girin.
              </p>
            </div>

            <form action={formAction} className="space-y-8">
              {/* KULLANICI ADI VEYA E-POSTA */}
              <div>
                <label
                  htmlFor="identifier"
                  className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.1em]"
                >
                  Kullanıcı Adı veya E-posta
                </label>

                <div className="flex items-center gap-3 border-b border-[#C7CCC5] transition-colors focus-within:border-[#111312]">
                  <UserRound
                    size={18}
                    strokeWidth={1.5}
                    className="shrink-0 text-[#858B85]"
                  />

                  <input
                    id="identifier"
                    name="identifier"
                    type="text"
                    required
                    maxLength={254}
                    autoComplete="username"
                    placeholder="Kullanıcı adı veya e-posta"
                    className="h-12 w-full min-w-0 border-0 bg-transparent text-[13px] outline-none ring-0 placeholder:text-[#9AA19A] focus:bg-transparent focus:outline-none focus:ring-0"
                  />
                </div>
              </div>

              {/* ŞİFRE */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.1em]"
                >
                  Şifre
                </label>

                <div className="flex items-center gap-3 border-b border-[#C7CCC5] transition-colors focus-within:border-[#111312]">
                  <LockKeyhole
                    size={18}
                    strokeWidth={1.5}
                    className="shrink-0 text-[#858B85]"
                  />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="Şifreniz"
                    className="h-12 w-full min-w-0 border-0 bg-transparent text-[13px] outline-none ring-0 placeholder:text-[#9AA19A] focus:bg-transparent focus:outline-none focus:ring-0"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={
                      showPassword ? "Şifreyi gizle" : "Şifreyi göster"
                    }
                    className="shrink-0 p-2 text-[#858B85] transition-colors hover:text-[#111312]"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* HATA MESAJI */}
              {state?.error && (
                <p
                  role="alert"
                  className="border-l-2 border-[#A61922] bg-[#A61922]/5 px-4 py-3 text-[12px] text-[#A61922]"
                >
                  {state.error}
                </p>
              )}

              {/* GİRİŞ BUTONU */}
              <button
                type="submit"
                disabled={pending}
                className="group flex h-13 w-full items-center justify-between bg-[#111312] px-6 text-[12px] font-semibold uppercase tracking-[0.12em] text-white transition-colors duration-300 hover:bg-[#A61922] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>
                  {pending ? "Giriş Yapılıyor..." : "Giriş Yap"}
                </span>

                <ArrowRight
                  size={19}
                  strokeWidth={1.6}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </button>
            </form>

            {/* ÜYELİK */}
            <div className="mt-9 border-t border-[#D8DBD7] pt-6">
              <p className="text-[13px] text-[#626A64]">
                Henüz hesabınız yok mu?{" "}
                <Link
                  href="/uye-ol"
                  className="font-semibold text-[#111312] underline decoration-[#A61922] underline-offset-4 transition-colors hover:text-[#A61922]"
                >
                  Üye Ol
                </Link>
              </p>
            </div>

            <div className="mt-10 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#D8DBD7]" />
              <span className="text-[10px] uppercase tracking-[0.16em] text-[#858B85]">
                VICIX CAR CARE
              </span>
              <div className="h-px flex-1 bg-[#D8DBD7]" />
            </div>

            <Link
              href="/"
              className="mt-7 inline-flex items-center gap-2 text-[12px] font-medium text-[#626A64] transition-colors hover:text-[#A61922]"
            >
              Alışverişe dön
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
