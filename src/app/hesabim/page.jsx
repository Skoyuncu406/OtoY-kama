
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  ArrowRight,
  CalendarDays,
  LogOut,
  Mail,
  ShieldCheck,
  UserRound,
  ShoppingBag,
  PackageCheck,
} from "lucide-react";

import PasswordEditor from "./PasswordEditor";
import ProfileEditor from "./ProfileEditor";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { customerLogoutAction } from "./actions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Hesabım | VICIX",
  description:
    "VICIX hesap bilgilerinizi yönetin ve siparişlerinizi takip edin.",
  robots: {
    index: false,
    follow: false,
  },
};

const orderStatusLabels = {
  PENDING: "Bekliyor",
  CONFIRMED: "Onaylandı",
  PREPARING: "Hazırlanıyor",
  SHIPPED: "Kargoda",
  DELIVERED: "Teslim Edildi",
  CANCELLED: "İptal Edildi",
};

const orderStatusStyles = {
  PENDING: "bg-[#F4E9D4] text-[#A16A19]",
  CONFIRMED: "bg-[#E5EFE3] text-[#346B38]",
  PREPARING: "bg-[#EEE8F5] text-[#7353A5]",
  SHIPPED: "bg-[#E5EDF6] text-[#315E91]",
  DELIVERED: "bg-[#E5EFE3] text-[#346B38]",
  CANCELLED: "bg-[#F5E4E5] text-[#A61922]",
};

const paymentMethodLabels = {
  CASH_ON_DELIVERY: "Kapıda Ödeme",
  ONLINE_PAYMENT: "Online Ödeme",
};

const memberDateFormatter = new Intl.DateTimeFormat(
  "tr-TR",
  {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Istanbul",
  },
);

const orderDateFormatter = new Intl.DateTimeFormat(
  "tr-TR",
  {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Istanbul",
  },
);

const priceFormatter = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
});

export default async function AccountPage() {
  const session = await auth();

  if (
    !session?.user?.id ||
    session.user.role !== "customer"
  ) {
    redirect("/giris-yap");
  }

  const customer = await prisma.customer.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      username: true,
      email: true,
      isActive: true,
      createdAt: true,
    },
  });

  if (!customer || !customer.isActive) {
    redirect("/giris-yap");
  }

  const recentOrders = await prisma.order.findMany({
    where: {
      customerId: customer.id,
    },
    orderBy: [
      { createdAt: "desc" },
      { id: "desc" },
    ],
    take: 5,
    select: {
      id: true,
      orderNumber: true,
      createdAt: true,
      total: true,
      status: true,
      paymentMethod: true,
    },
  });

  const memberSince = memberDateFormatter.format(
    customer.createdAt,
  );

  return (
    <main className="min-h-[85svh] w-full overflow-x-clip bg-[#F4F3EF] text-[#111312]">
      <div className="mx-auto w-full max-w-[1200px] px-5 py-12 sm:px-10 lg:px-16 lg:py-20">

        {/* ÜST BAŞLIK */}
        <header className="border-b border-[#D8DBD7] pb-10">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A61922]">
            VICIX / MEMBER ACCOUNT
          </span>

          <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="font-[family-name:var(--font-manrope)] text-[clamp(2.5rem,5vw,4.5rem)] font-semibold leading-[1.1] tracking-[-0.06em]">
                Hesabım
                <span className="text-[#A61922]">
                  .
                </span>
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
                className="inline-flex min-h-[46px] items-center gap-3 border border-[#D8DBD7] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors duration-300 hover:border-[#A61922] hover:text-[#A61922]"
              >
                <LogOut
                  size={17}
                  strokeWidth={1.5}
                />
                Çıkış Yap
              </button>
            </form>
          </div>
        </header>

        {/* HESAP BİLGİLERİ */}
        <div className="grid gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)] lg:gap-24 lg:py-16">
          <section className="min-w-0">
            <div className="mb-10 flex items-center gap-4">
              <span className="text-[11px] font-semibold text-[#A61922]">
                01
              </span>

              <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em]">
                Hesap Bilgileri
              </h2>
            </div>

            <div className="divide-y divide-[#D8DBD7] border-y border-[#D8DBD7]">

              {/* KULLANICI ADI */}
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

              {/* E-POSTA */}
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

              {/* ÜYELİK TARİHİ */}
              <div className="flex items-center gap-5 py-6">
                <CalendarDays
                  size={20}
                  strokeWidth={1.4}
                  className="shrink-0 text-[#858B85]"
                />

                <div className="min-w-0">
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

            {/* ŞİFRE DEĞİŞTİRME */}
            <PasswordEditor />
          </section>

          {/* SAĞ BİLGİ ALANI */}
          <aside className="flex min-w-0 flex-col justify-between border-t border-[#D8DBD7] pt-8 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
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

              <p className="mt-5 max-w-[340px] text-[13px] leading-7 text-[#626A64]">
                Oluşturduğunuz siparişleri hesabınızdan
                takip edebilir ve güncel durumlarını
                inceleyebilirsiniz.
              </p>
            </div>

            <Link
              href="/urunler"
              className="group mt-10 flex items-center justify-between gap-4 border-b border-[#111312] pb-4 text-[12px] font-semibold uppercase tracking-[0.1em] transition-colors hover:border-[#A61922] hover:text-[#A61922]"
            >
              Ürünleri Keşfet

              <ArrowRight
                size={19}
                strokeWidth={1.5}
                className="shrink-0 transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </aside>
        </div>

        {/* SİPARİŞLERİM */}
        <section className="border-t border-[#D8DBD7] py-12 lg:py-16">

          {/* BÖLÜM BAŞLIĞI */}
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="min-w-0">
              <div className="flex items-center gap-4">
                <span className="text-[11px] font-semibold text-[#A61922]">
                  02
                </span>

                <span className="text-[13px] font-semibold uppercase tracking-[0.12em]">
                  Sipariş Geçmişi
                </span>
              </div>

              <h2 className="mt-5 font-[family-name:var(--font-manrope)] text-[clamp(1.7rem,3vw,2.5rem)] font-semibold tracking-[-0.05em]">
                Siparişlerim
                <span className="text-[#A61922]">
                  .
                </span>
              </h2>

              <p className="mt-3 text-[13px] leading-7 text-[#626A64]">
                Son siparişlerinizi ve güncel durumlarını
                buradan takip edebilirsiniz.
              </p>
            </div>

            {recentOrders.length > 0 && (
              <Link
                href="/hesabim/siparisler"
                className="group inline-flex items-center gap-3 border-b border-[#111312] pb-2 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors hover:border-[#A61922] hover:text-[#A61922]"
              >
                Tüm Siparişlerim

                <ArrowRight
                  size={17}
                  strokeWidth={1.5}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            )}
          </div>

          {/* SİPARİŞ YOK */}
          {recentOrders.length === 0 ? (
            <div className="mt-10 flex flex-col items-center justify-center border-y border-[#D8DBD7] px-5 py-14 text-center">
              <ShoppingBag
                size={35}
                strokeWidth={1.3}
                className="text-[#858B85]"
              />

              <h3 className="mt-5 text-lg font-semibold">
                Henüz siparişiniz bulunmuyor.
              </h3>

              <p className="mt-3 max-w-sm text-[13px] leading-7 text-[#626A64]">
                VICIX ürünlerini keşfederek ilk
                siparişinizi oluşturabilirsiniz.
              </p>

              <Link
                href="/urunler"
                className="group mt-7 inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.1em] text-[#A61922]"
              >
                Alışverişe Başla

                <ArrowRight
                  size={17}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </div>
          ) : (
            /* SON SİPARİŞLER */
            <div className="mt-10 divide-y divide-[#D8DBD7] border-y border-[#D8DBD7]">
              {recentOrders.map((order) => (
                <article
                  key={order.id}
                  className="grid min-w-0 gap-5 py-6 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_auto] sm:items-center sm:gap-8"
                >

                  {/* SİPARİŞ NUMARASI */}
                  <div className="flex min-w-0 items-start gap-4">
                    <PackageCheck
                      size={21}
                      strokeWidth={1.4}
                      className="mt-1 shrink-0 text-[#A61922]"
                    />

                    <div className="min-w-0">
                      <p className="break-all text-[12px] font-bold tracking-tight">
                        {order.orderNumber}
                      </p>

                      <p className="mt-2 text-[11px] text-[#858B85]">
                        {orderDateFormatter.format(
                          order.createdAt,
                        )}
                      </p>

                      <p className="mt-2 text-[11px] text-[#626A64]">
                        {paymentMethodLabels[
                          order.paymentMethod
                        ] ?? order.paymentMethod}
                      </p>
                    </div>
                  </div>

                  {/* TUTAR VE DURUM */}
                  <div className="flex flex-wrap items-center justify-between gap-4 sm:block">
                    <p className="text-[17px] font-bold tabular-nums">
                      {priceFormatter.format(
                        Number(order.total),
                      )}
                    </p>

                    <span
                      className={`inline-flex px-3 py-1.5 text-[10px] font-bold sm:mt-2 ${
                        orderStatusStyles[order.status] ??
                        ""
                      }`}
                    >
                      {orderStatusLabels[order.status] ??
                        order.status}
                    </span>
                  </div>

                  {/* DETAY */}
                  <Link
                    href={`/hesabim/siparisler/${order.id}`}
                    className="group inline-flex items-center gap-2 self-start text-[11px] font-bold uppercase tracking-[0.08em] text-[#A61922] transition-colors hover:text-[#85141B] sm:self-center"
                  >
                    Sipariş Detayı

                    <ArrowRight
                      size={16}
                      strokeWidth={1.5}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* FOOTER */}
        <footer className="border-t border-[#D8DBD7] pt-7">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#858B85]">
            VICIX CAR CARE — MEMBER ACCOUNT
          </p>
        </footer>
      </div>
    </main>
  );
}
