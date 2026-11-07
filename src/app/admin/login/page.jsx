
import { redirect } from "next/navigation";
import Image from "next/image";

import { auth } from "@/auth";
import LoginForm from "@/components/admin/LoginForm";

export const metadata = {
  title: "Yönetici Girişi | VICIX Car Care",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLoginPage() {
  const session = await auth();

  if (session?.user?.role === "admin") {
    redirect("/admin");
  }

  return (
    <main
      className="
        relative
        flex
        min-h-[calc(100svh-112px)]
        w-full
        items-center
        justify-center
        overflow-x-clip
        bg-[#F4F3EF]
        px-5
        py-8
        text-[#191C19]
        sm:px-8
        lg:py-6
      "
    >
      <div className="mx-auto w-full max-w-[400px]">
        <div className="mb-6 flex justify-center sm:mb-7">
          <Image
            src="/images/vicix-logo.png"
            alt="VICIX Car Care"
            width={100}
            height={100}
            priority
            className="h-auto w-[76px] object-contain sm:w-[88px]"
          />
        </div>

        <div className="text-center">
          <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#A61922]">
            VICIX CAR CARE
          </span>

          <h1 className="mt-3 text-[clamp(1.9rem,4vw,2.65rem)] font-semibold leading-[1.1] tracking-[-0.055em]">
            Yönetim Paneli
          </h1>

          <p className="mt-3 text-[13px] leading-6 text-[#747974]">
            Yönetici hesabınızla güvenli giriş yapın.
          </p>
        </div>

        <LoginForm />

        <div className="mt-7 text-center">
          <span className="text-[11px] text-[#898D88]">
            © {new Date().getFullYear()} VICIX Car Care
          </span>
        </div>
      </div>
    </main>
  );
}
