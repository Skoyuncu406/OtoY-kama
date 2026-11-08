
"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";

import { registerCustomerAction } from "./actions";

const initialState = {
  success: false,
  error: null,
};

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(
    registerCustomerAction,
    initialState
  );

  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="min-h-[calc(100svh-var(--site-header-height))] w-full overflow-x-hidden bg-[#F4F3EF] text-[#111312]">
      <div className="mx-auto grid w-full max-w-[1320px] lg:min-h-[calc(100svh-var(--site-header-height))] lg:grid-cols-2">
        {/* SOL ALAN */}
        <div className="relative hidden overflow-hidden border-r border-[#D8DBD7] px-12 py-16 lg:flex lg:flex-col lg:justify-between xl:px-20">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#A61922]">
              VICIX / MEMBERSHIP
            </span>

            <h1 className="mt-10 max-w-[500px] font-[family-name:var(--font-manrope)] text-[clamp(3.2rem,5vw,5.5rem)] font-semibold leading-[1.03] tracking-[-0.065em]">
              Bakımın
              <span className="block text-[#858B85]">
                yeni adresi.
              </span>
            </h1>

            <p className="mt-8 max-w-[360px] text-[14px] leading-8 text-[#626A64]">
              VICIX dünyasına katılın. Profesyonel araç bakım
              ürünlerini keşfedin ve alışveriş deneyiminizi
              kişiselleştirin.
            </p>
          </div>

          <div className="border-t border-[#D8DBD7] pt-7">
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#858B85]">
              VICIX CAR CARE
            </span>
            <p className="mt-3 max-w-[320px] text-[13px] leading-6 text-[#626A64]">
              Her detayda profesyonel bakım.
            </p>
          </div>
        </div>

        {/* FORM ALANI */}
        <div className="flex min-w-0 items-center justify-center px-5 py-12 sm:px-10 lg:px-12 lg:py-16 xl:px-20">
          <div className="w-full max-w-[430px]">
            <div className="mb-10">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A61922]">
                VICIX / HESAP OLUŞTUR
              </span>

              <h2 className="mt-4 font-[family-name:var(--font-manrope)] text-[clamp(2.2rem,4vw,3.3rem)] font-semibold tracking-[-0.055em]">
                Üye Ol
              </h2>

              <p className="mt-3 text-[13px] leading-7 text-[#626A64]">
                VICIX hesabınızı oluşturmak için bilgilerinizi girin.
              </p>
            </div>

            {state.success ? (
              <div
                role="status"
                className="border-l-2 border-[#A61922] bg-[#EAECE7] px-5 py-6"
              >
                <h3 className="text-lg font-semibold">
                  Hesabınız oluşturuldu.
                </h3>

                <p className="mt-2 text-[13px] leading-6 text-[#626A64]">
                  Artık kullanıcı adınız ve şifrenizle giriş
                  yapabilirsiniz.
                </p>

                <Link
                  href="/giris-yap"
                  className="mt-6 inline-flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#A61922] hover:gap-5"
                >
                  Giriş Yap
                  <ArrowRight size={17} />
                </Link>
              </div>
            ) : (
              <form action={formAction} className="space-y-7">
                <div>
                  <label
                    htmlFor="username"
                    className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.1em]"
                  >
                    Kullanıcı Adı
                  </label>

                  <div className="flex items-center gap-3 border-b border-[#C7CCC5] focus-within:border-[#111312]">
                    <UserRound
                      size={18}
                      strokeWidth={1.5}
                      className="shrink-0 text-[#858B85]"
                    />

                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      minLength={3}
                      maxLength={30}
                      pattern="[a-zA-Z0-9_]+"
                      autoComplete="username"
                      placeholder="Kullanıcı adınız"
                      className="h-12 w-full min-w-0 border-0 bg-transparent text-[13px] outline-none ring-0 placeholder:text-[#9AA19A] focus:bg-transparent focus:outline-none focus:ring-0"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.1em]"
                  >
                    E-posta Adresi
                  </label>

                  <div className="flex items-center gap-3 border-b border-[#C7CCC5] focus-within:border-[#111312]">
                    <Mail
                      size={18}
                      strokeWidth={1.5}
                      className="shrink-0 text-[#858B85]"
                    />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      maxLength={254}
                      autoComplete="email"
                      placeholder="ornek@email.com"
                      className="h-12 w-full min-w-0 border-0 bg-transparent text-[13px] outline-none ring-0 placeholder:text-[#9AA19A] focus:bg-transparent focus:outline-none focus:ring-0"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.1em]"
                  >
                    Şifre
                  </label>

                  <div className="flex items-center gap-3 border-b border-[#C7CCC5] focus-within:border-[#111312]">
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
                      minLength={12}
                      maxLength={72}
                      autoComplete="new-password"
                      placeholder="En az 12 karakter"
                      className="h-12 w-full min-w-0 border-0 bg-transparent text-[13px] outline-none ring-0 placeholder:text-[#9AA19A] focus:bg-transparent focus:outline-none focus:ring-0"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
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

                  <p className="mt-2 text-[11px] text-[#858B85]">
                    Şifreniz en az 12 karakter olmalıdır.
                  </p>
                </div>

                {state.error && (
                  <p
                    role="alert"
                    className="border-l-2 border-[#A61922] bg-[#A61922]/5 px-4 py-3 text-[12px] text-[#A61922]"
                  >
                    {state.error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={pending}
                  className="group flex h-13 w-full items-center justify-between bg-[#111312] px-6 text-[12px] font-semibold uppercase tracking-[0.12em] text-white transition-colors duration-300 hover:bg-[#A61922] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span>
                    {pending ? "Hesap Oluşturuluyor..." : "Hesap Oluştur"}
                  </span>

                  <ArrowRight
                    size={19}
                    strokeWidth={1.6}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </button>
              </form>
            )}

            <div className="mt-9 border-t border-[#D8DBD7] pt-6">
              <p className="text-[13px] text-[#626A64]">
                Zaten hesabınız var mı?{" "}
                <Link
                  href="/giris-yap"
                  className="font-semibold text-[#111312] underline decoration-[#A61922] underline-offset-4 transition-colors hover:text-[#A61922]"
                >
                  Giriş Yap
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
