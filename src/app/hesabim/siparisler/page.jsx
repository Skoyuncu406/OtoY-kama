
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Package,
  Search,
  ShoppingBag,
} from "lucide-react";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Siparişlerim | VICIX",
  description: "VICIX sipariş geçmişiniz ve sipariş takibi.",
  robots: {
    index: false,
    follow: false,
  },
};

const PAGE_SIZE = 10;

const statusLabels = {
  PENDING: "Bekliyor",
  CONFIRMED: "Onaylandı",
  PREPARING: "Hazırlanıyor",
  SHIPPED: "Kargoda",
  DELIVERED: "Teslim Edildi",
  CANCELLED: "İptal Edildi",
};

const statusStyles = {
  PENDING: "bg-[#F4E9D4] text-[#A16A19]",
  CONFIRMED: "bg-[#E5EFE3] text-[#346B38]",
  PREPARING: "bg-[#EEE8F5] text-[#7353A5]",
  SHIPPED: "bg-[#E5EDF6] text-[#315E91]",
  DELIVERED: "bg-[#E5EFE3] text-[#346B38]",
  CANCELLED: "bg-[#F5E4E5] text-[#A61922]",
};

const paymentLabels = {
  CASH_ON_DELIVERY: "Kapıda Ödeme",
  ONLINE_PAYMENT: "Online Ödeme",
};

const dateFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Istanbul",
});

const moneyFormatter = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
});

function buildUrl({ q, status, sort, page }) {
  const params = new URLSearchParams();

  if (q) params.set("q", q);
  if (status !== "ALL") params.set("status", status);
  if (sort !== "newest") params.set("sort", sort);
  if (page > 1) params.set("page", String(page));

  const query = params.toString();

  return `/hesabim/siparisler${query ? `?${query}` : ""}`;
}

export default async function CustomerOrdersPage({
  searchParams,
}) {
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
      isActive: true,
    },
  });

  if (!customer?.isActive) {
    redirect("/giris-yap");
  }

  const params = await searchParams;

  const q =
    typeof params?.q === "string"
      ? params.q.trim().slice(0, 100)
      : "";

  const requestedStatus =
    typeof params?.status === "string"
      ? params.status
      : "ALL";

  const status =
    requestedStatus === "ALL" ||
    Object.hasOwn(statusLabels, requestedStatus)
      ? requestedStatus
      : "ALL";

  const sort =
    params?.sort === "oldest" ? "oldest" : "newest";

  const rawPage = Number(params?.page);

  const requestedPage =
    Number.isSafeInteger(rawPage) && rawPage > 0
      ? rawPage
      : 1;

  const where = {
    customerId: customer.id,
    ...(status !== "ALL" ? { status } : {}),
    ...(q
      ? {
          orderNumber: {
            contains: q,
            mode: "insensitive",
          },
        }
      : {}),
  };

  const totalOrders = await prisma.order.count({
    where,
  });

  const totalPages = Math.max(
    1,
    Math.ceil(totalOrders / PAGE_SIZE),
  );

  const page = Math.min(requestedPage, totalPages);

  const orders = await prisma.order.findMany({
    where,
    orderBy: [
      { createdAt: sort === "oldest" ? "asc" : "desc" },
      { id: sort === "oldest" ? "asc" : "desc" },
    ],
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: {
      id: true,
      orderNumber: true,
      createdAt: true,
      status: true,
      total: true,
      paymentMethod: true,
      paymentStatus: true,
      _count: {
        select: {
          items: true,
        },
      },
    },
  });

  const hasFilters =
    q !== "" || status !== "ALL" || sort !== "newest";

  return (
    <main className="min-h-[85svh] w-full overflow-x-clip bg-[#F4F3EF] text-[#111312]">
      <div className="mx-auto w-full max-w-[1200px] px-5 py-12 sm:px-10 lg:px-16 lg:py-20">

        {/* GERİ DÖN */}
        <Link
          href="/hesabim"
          className="group inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#626A64] transition-colors hover:text-[#A61922]"
        >
          <ArrowLeft
            size={17}
            strokeWidth={1.5}
            className="transition-transform group-hover:-translate-x-1"
          />
          Hesabıma Dön
        </Link>

        {/* SAYFA BAŞLIĞI */}
        <header className="mt-9 border-b border-[#D8DBD7] pb-10">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A61922]">
            VICIX / ORDER HISTORY
          </span>

          <div className="mt-5 flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1 className="font-[family-name:var(--font-manrope)] text-[clamp(2.4rem,5vw,4.5rem)] font-semibold leading-[1.1] tracking-[-0.06em]">
                Siparişlerim
                <span className="text-[#A61922]">.</span>
              </h1>

              <p className="mt-4 max-w-xl text-[13px] leading-7 text-[#626A64]">
                Tüm siparişlerinizi, ödeme bilgilerinizi ve
                güncel sipariş durumlarınızı buradan
                takip edebilirsiniz.
              </p>
            </div>

            <div className="border-l-2 border-[#A61922] pl-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#858B85]">
                Eşleşen Sipariş
              </p>

              <p className="mt-2 text-3xl font-semibold tabular-nums">
                {totalOrders}
              </p>
            </div>
          </div>
        </header>

        {/* FİLTRELER */}
        <form
          action="/hesabim/siparisler"
          method="GET"
          className="grid gap-5 border-b border-[#D8DBD7] py-8 md:grid-cols-[minmax(0,1fr)_180px_180px_auto] md:items-end"
        >
          <div className="min-w-0">
            <label
              htmlFor="order-search"
              className="mb-3 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#858B85]"
            >
              Sipariş Numarası
            </label>

            <div className="flex items-center gap-3 border-b border-[#BFC5BE] pb-3 focus-within:border-[#111312]">
              <Search
                size={18}
                strokeWidth={1.5}
                className="shrink-0 text-[#858B85]"
              />

              <input
                id="order-search"
                name="q"
                type="search"
                defaultValue={q}
                placeholder="Sipariş numarası ara..."
                maxLength={100}
                className="min-w-0 w-full appearance-none border-0 !bg-transparent p-0 text-[13px] text-[#111312] outline-none ring-0 placeholder:text-[#858B85] focus:outline-none focus:ring-0"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="order-status"
              className="mb-3 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#858B85]"
            >
              Sipariş Durumu
            </label>

            <select
              id="order-status"
              name="status"
              defaultValue={status}
              className="min-h-11 w-full border-b border-[#BFC5BE] !bg-transparent px-0 text-[12px] font-medium text-[#111312] outline-none focus:border-[#111312] focus:outline-none"
            >
              <option value="ALL">Tüm Durumlar</option>
              <option value="PENDING">Bekliyor</option>
              <option value="CONFIRMED">Onaylandı</option>
              <option value="PREPARING">Hazırlanıyor</option>
              <option value="SHIPPED">Kargoda</option>
              <option value="DELIVERED">Teslim Edildi</option>
              <option value="CANCELLED">İptal Edildi</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="order-sort"
              className="mb-3 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#858B85]"
            >
              Sıralama
            </label>

            <select
              id="order-sort"
              name="sort"
              defaultValue={sort}
              className="min-h-11 w-full border-b border-[#BFC5BE] !bg-transparent px-0 text-[12px] font-medium text-[#111312] outline-none focus:border-[#111312] focus:outline-none"
            >
              <option value="newest">En Yeni</option>
              <option value="oldest">En Eski</option>
            </select>
          </div>

          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center gap-2 !bg-[#A61922] px-6 text-[11px] font-bold uppercase tracking-[0.08em] !text-white transition-colors hover:!bg-[#85141B]"
          >
            Uygula
            <ArrowRight size={16} />
          </button>
        </form>

        {/* FİLTRE TEMİZLE */}
        {hasFilters && (
          <div className="flex justify-end pt-5">
            <Link
              href="/hesabim/siparisler"
              className="text-[11px] font-semibold text-[#A61922] hover:underline"
            >
              Filtreleri Temizle
            </Link>
          </div>
        )}

        {/* SİPARİŞ LİSTESİ */}
        {orders.length === 0 ? (
          <section className="flex flex-col items-center border-b border-[#D8DBD7] px-4 py-20 text-center">
            <ShoppingBag
              size={38}
              strokeWidth={1.3}
              className="text-[#858B85]"
            />

            <h2 className="mt-6 text-xl font-semibold tracking-tight">
              {hasFilters
                ? "Aramanıza uygun sipariş bulunamadı."
                : "Henüz siparişiniz bulunmuyor."}
            </h2>

            <p className="mt-3 max-w-md text-[13px] leading-7 text-[#626A64]">
              {hasFilters
                ? "Farklı bir sipariş numarası veya durum filtresi deneyebilirsiniz."
                : "VICIX ürünlerini keşfederek ilk siparişinizi oluşturabilirsiniz."}
            </p>

            <Link
              href={hasFilters ? "/hesabim/siparisler" : "/urunler"}
              className="group mt-7 inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.1em] text-[#A61922]"
            >
              {hasFilters
                ? "Tüm Siparişleri Göster"
                : "Alışverişe Başla"}

              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </section>
        ) : (
          <section className="divide-y divide-[#D8DBD7] border-b border-[#D8DBD7]">
            {orders.map((order) => (
              <article
                key={order.id}
                className="grid min-w-0 gap-6 py-7 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-center lg:gap-8"
              >
                {/* NUMARA VE TARİH */}
                <div className="flex min-w-0 items-start gap-4">
                  <Package
                    size={23}
                    strokeWidth={1.4}
                    className="mt-1 shrink-0 text-[#A61922]"
                  />

                  <div className="min-w-0">
                    <p className="break-all text-[13px] font-bold tracking-tight">
                      {order.orderNumber}
                    </p>

                    <p className="mt-2 text-[11px] text-[#858B85]">
                      {dateFormatter.format(order.createdAt)}
                    </p>

                    <p className="mt-2 text-[11px] text-[#626A64]">
                      {order._count.items} ürün kalemi
                    </p>
                  </div>
                </div>

                {/* ÖDEME */}
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#858B85]">
                    Ödeme
                  </p>

                  <p className="mt-2 text-[12px] font-medium">
                    {paymentLabels[order.paymentMethod] ??
                      order.paymentMethod}
                  </p>

                  <p className="mt-1 text-[17px] font-bold tabular-nums">
                    {moneyFormatter.format(
                      Number(order.total),
                    )}
                  </p>
                </div>

                {/* DURUM */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#858B85]">
                    Sipariş Durumu
                  </p>

                  <span
                    className={`mt-3 inline-flex px-3 py-1.5 text-[10px] font-bold ${
                      statusStyles[order.status] ?? ""
                    }`}
                  >
                    {statusLabels[order.status] ??
                      order.status}
                  </span>
                </div>

                {/* DETAY BAĞLANTISI */}
                <Link
                  href={`/hesabim/siparisler/${order.id}`}
                  className="group inline-flex items-center gap-2 justify-self-start whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.08em] text-[#A61922] transition-colors hover:text-[#85141B]"
                >
                  Detay
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </article>
            ))}
          </section>
        )}

        {/* SAYFALAMA */}
        {totalPages > 1 && (
          <nav
            aria-label="Sipariş sayfaları"
            className="flex flex-wrap items-center justify-between gap-5 py-9"
          >
            <p className="text-[11px] text-[#626A64]">
              Sayfa {page} / {totalPages}
            </p>

            <div className="flex items-center gap-5">
              {page > 1 ? (
                <Link
                  href={buildUrl({
                    q,
                    status,
                    sort,
                    page: page - 1,
                  })}
                  className="inline-flex items-center gap-2 text-[11px] font-semibold text-[#111312] hover:text-[#A61922]"
                >
                  <ArrowLeft size={16} />
                  Önceki
                </Link>
              ) : (
                <span className="text-[11px] text-[#A8AEA7]">
                  Önceki
                </span>
              )}

              {page < totalPages ? (
                <Link
                  href={buildUrl({
                    q,
                    status,
                    sort,
                    page: page + 1,
                  })}
                  className="inline-flex items-center gap-2 text-[11px] font-semibold text-[#111312] hover:text-[#A61922]"
                >
                  Sonraki
                  <ArrowRight size={16} />
                </Link>
              ) : (
                <span className="text-[11px] text-[#A8AEA7]">
                  Sonraki
                </span>
              )}
            </div>
          </nav>
        )}

        {/* ALT ALAN */}
        <footer className="mt-10 flex flex-wrap items-center justify-between gap-5 border-t border-[#D8DBD7] pt-7">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#858B85]">
            VICIX CAR CARE — ORDER HISTORY
          </p>

          <Link
            href="/urunler"
            className="group inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#111312] hover:text-[#A61922]"
          >
            Alışverişe Devam Et
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </footer>
      </div>
    </main>
  );
}
