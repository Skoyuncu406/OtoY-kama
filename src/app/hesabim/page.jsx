
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  LogOut,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import PasswordEditor from "./PasswordEditor";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { customerLogoutAction } from "./actions";
import ProfileEditor from "./ProfileEditor";

export const metadata = {
  title: "Hesabım | VICIX",
  description: "VICIX müşteri hesap bilgileri.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "customer") {
    redirect("/giris-yap");
  }

  const customer = await prisma.customer.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      username: true,
      email: true,
      isActive: true,
      createdAt: true,
    },
  });

  if (!customer || !customer.isActive) {
    redirect("/giris-yap");
  }

  const memberSince = new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(customer.createdAt);

  return (
    <main className="min-h-[85svh] w-full overflow-x-hidden bg-[#F4F3EF] text-[#111312]">
      <div className="mx-auto w-full max-w-[1200px] px-5 py-12 sm:px-10 lg:px-16 lg:py-20">
        {/* ÜST BAŞLIK */}
        <div className="border-b border-[#D8DBD7] pb-10">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A61922]">
            VICIX / MEMBER ACCOUNT
          </span>

          <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-[family-name:var(--font-manrope)] text-[clamp(2.5rem,5vw,4.5rem)] font-semibold leading-[1.1] tracking-[-0.06em]">
                Hesabım<span className="text-[#A61922]">.</span>
              </h1>

              <p className="mt-4 text-[14px] leading-7 text-[#626A64]">
                Hoş geldiniz,{" "}
                <span className="font-semibold text-[#111312]">
                  {customer.username}
                </span>
                .
              </p>
            </div>

            <form action={customerLogoutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-3 border border-[#D8DBD7] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors duration-300 hover:border-[#A61922] hover:text-[#A61922]"
              >
                <LogOut size={17} strokeWidth={1.5} />
                Çıkış Yap
              </button>
            </form>
          </div>
        </div>

        {/* HESAP BİLGİLERİ */}
        <div className="grid gap-12 py-12 lg:grid-cols-[1fr_0.7fr] lg:gap-24 lg:py-16">
          <section>
            <div className="mb-10 flex items-center gap-4">
              <span className="text-[11px] font-semibold text-[#A61922]">
                01
              </span>

              <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em]">
                Hesap Bilgileri
              </h2>
            </div>

            <div className="divide-y divide-[#D8DBD7] border-y border-[#D8DBD7]">
              <div className="flex items-center gap-5 py-6">
                <UserRound
                  size={20}
                  strokeWidth={1.4}
                  className="shrink-0 text-[#858B85]"
                />

                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-[#858B85]">
                    Kullanıcı Adı
                  </p>
                  <p className="mt-2 break-words text-[15px] font-medium">
                    {customer.username}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-5 py-6">
                <Mail
                  size={20}
                  strokeWidth={1.4}
                  className="shrink-0 text-[#858B85]"
                />

                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-[#858B85]">
                    E-posta Adresi
                  </p>
                  <p className="mt-2 break-all text-[15px] font-medium">
                    {customer.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-5 py-6">
                <CalendarDays
                  size={20}
                  strokeWidth={1.4}
                  className="shrink-0 text-[#858B85]"
                />

                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-[#858B85]">
                    Üyelik Tarihi
                  </p>
                  <p className="mt-2 text-[15px] font-medium">
                    {memberSince}
                  </p>
                </div>
              </div>
            </div>

            {/* PROFİL DÜZENLEME */}
            <ProfileEditor
              username={customer.username}
              email={customer.email}
            />
            <PasswordEditor />
          </section>

          {/* SAĞ BİLGİ ALANI */}
          <aside className="flex flex-col justify-between border-t border-[#D8DBD7] pt-8 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
            <div>
              <ShieldCheck
                size={28}
                strokeWidth={1.3}
                className="text-[#A61922]"
              />

              <h2 className="mt-7 text-[clamp(1.7rem,3vw,2.3rem)] font-semibold leading-tight tracking-[-0.04em]">
                VICIX dünyasına
                <span className="block text-[#858B85]">
                  hoş geldiniz.
                </span>
              </h2>

              <p className="mt-5 max-w-[340px] text-[13px] leading-7 text-[#626A64]">
                Hesap bilgilerinizi güvenli şekilde
                görüntüleyebilir ve güncelleyebilirsiniz.
                Değişikliklerinizi onaylamak için mevcut
                şifrenizi girmeniz yeterlidir.
              </p>
            </div>

            <Link
              href="/urunler"
              className="group mt-10 flex items-center justify-between border-b border-[#111312] pb-4 text-[12px] font-semibold uppercase tracking-[0.1em] transition-colors hover:border-[#A61922] hover:text-[#A61922]"
            >
              Ürünleri Keşfet
              <ArrowRight
                size={19}
                strokeWidth={1.5}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </aside>
        </div>

        <div className="border-t border-[#D8DBD7] pt-7">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#858B85]">
            VICIX CAR CARE — MEMBER ACCOUNT
          </p>
        </div>
      </div>
    </main>
  );
}
