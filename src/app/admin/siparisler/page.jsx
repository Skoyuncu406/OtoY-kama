
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Search,
  ShoppingBag,
  AlertCircle,
} from "lucide-react";

import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sipariş Yönetimi | VICIX",
  robots: {
    index: false,
    follow: false,
  },
};

const PAGE_SIZE = 15;

const statusLabels = {
  PENDING: "Bekliyor",
  CONFIRMED: "Onaylandı",
  PREPARING: "Hazırlanıyor",
  SHIPPED: "Kargoda",
  DELIVERED: "Teslim Edildi",
  CANCELLED: "İptal Edildi",
};

const statusStyles = {
  PENDING: "text-[#A16A19] bg-[#F4E9D4]",
  CONFIRMED: "text-[#346B38] bg-[#E5EFE3]",
  PREPARING: "text-[#7353A5] bg-[#EEE8F5]",
  SHIPPED: "text-[#315E91] bg-[#E5EDF6]",
  DELIVERED: "text-[#346B38] bg-[#E5EFE3]",
  CANCELLED: "text-[#A61922] bg-[#F5E4E5]",
};

const paymentLabels = {
  CASH_ON_DELIVERY: "Kapıda Ödeme",
  ONLINE_PAYMENT: "Online Ödeme",
};

const formatPrice = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
});

const formatDate = new Intl.DateTimeFormat("tr-TR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Istanbul",
});

const inputClass =
  "min-h-[46px] w-full min-w-0 border border-[#D9DCD6] bg-transparent px-4 text-[12px] text-[#191C19] outline-none transition-colors focus:border-[#A61922] focus:outline-none";

function buildQuery(params, updates) {
  const query = new URLSearchParams();

  const values = {
    q: params.q,
    status: params.status,
    cancellation: params.cancellation,
    sort: params.sort,
    page: params.page,
    ...updates,
  };

  for (const [key, value] of Object.entries(values)) {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      query.set(key, String(value));
    }
  }

  return `/admin/siparisler?${query.toString()}`;
}

function getOrderBy(sort) {
  if (sort === "oldest") {
    return [{ createdAt: "asc" }, { id: "asc" }];
  }

  if (sort === "status_asc") {
    return [{ status: "asc" }, { createdAt: "desc" }];
  }

  if (sort === "status_desc") {
    return [{ status: "desc" }, { createdAt: "desc" }];
  }

  return [{ createdAt: "desc" }, { id: "desc" }];
}

export default async function AdminOrdersPage({
  searchParams,
}) {
  await requireAdmin();

  const rawParams = await searchParams;

  const q =
    typeof rawParams?.q === "string"
      ? rawParams.q.trim().slice(0, 100)
      : "";

  const status =
    typeof rawParams?.status === "string" &&
    Object.hasOwn(statusLabels, rawParams.status)
      ? rawParams.status
      : "all";

  const cancellation =
    typeof rawParams?.cancellation === "string" &&
    ["all", "pending", "approved", "rejected"].includes(rawParams.cancellation)
      ? rawParams.cancellation
      : "all";

  const allowedSorts = [
    "newest",
    "oldest",
    "status_asc",
    "status_desc",
  ];

  const sort = allowedSorts.includes(rawParams?.sort)
    ? rawParams.sort
    : "newest";

  const requestedPage = Number(rawParams?.page);

  const page =
    Number.isSafeInteger(requestedPage) &&
    requestedPage > 0
      ? requestedPage
      : 1;

  const where = {
    ...(status !== "all" ? { status } : {}),
    ...(cancellation !== "all"
      ? {
          cancellationRequest: {
            is: {
              status: cancellation.toUpperCase(),
            },
          },
        }
      : {}),
    ...(q
      ? {
          OR: [
            {
              fullName: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              orderNumber: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              customer: {
  is: {
    username: {
      contains: q,
      mode: "insensitive",
    },
  },
},
            },
          ],
        }
      : {}),
  };

  const pendingCancellationCount = await prisma.cancellationRequest.count({
    where: { status: "PENDING" },
  });

  const totalOrders = await prisma.order.count({
    where,
  });

  const totalPages = Math.max(
    1,
    Math.ceil(totalOrders / PAGE_SIZE),
  );

  const currentPage = Math.min(page, totalPages);

  const orders = await prisma.order.findMany({
    where,
    orderBy: getOrderBy(sort),
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: {
      id: true,
      orderNumber: true,
      fullName: true,
      createdAt: true,
      total: true,
      status: true,
      paymentMethod: true,
      cancellationRequest: {
        select: { status: true },
      },
     customer: {
  select: {
    username: true,
  },
},
      _count: {
        select: {
          items: true,
        },
      },
    },
  });

  const hasFilters =
    q !== "" || status !== "all" || cancellation !== "all" || sort !== "newest";

  return (
    <main className="min-h-screen w-full overflow-x-clip bg-[#F4F3EF] px-5 py-10 text-[#191C19] sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-6xl">
        <header className="border-b border-[#D9DCD6] pb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-[11px] font-semibold text-[#747974] transition-colors hover:text-[#A61922]"
          >
            <ArrowLeft size={15} />
            Yönetim Paneline Dön
          </Link>

          <div className="mt-8 flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#A61922]">
                VICIX CAR CARE / ADMIN
              </p>

              <h1 className="mt-4 font-[family-name:var(--font-manrope)] text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
                Sipariş Yönetimi
              </h1>

              <p className="mt-3 text-sm leading-6 text-[#747974]">
                Gelen siparişleri inceleyin, arayın ve
                durumlarına göre filtreleyin.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              {pendingCancellationCount > 0 && (
                <Link
                  href="/admin/siparisler?cancellation=pending"
                  className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#A61922] hover:underline"
                >
                  <AlertCircle size={17} />
                  {pendingCancellationCount} bekleyen iptal talebi
                </Link>
              )}
              <ShoppingBag
                size={20}
                strokeWidth={1.5}
                className="text-[#A61922]"
              />

              <span className="text-sm font-semibold">
                {totalOrders} sipariş
              </span>
            </div>
          </div>
        </header>

        <section className="border-b border-[#D9DCD6] py-7">
          <form
            action="/admin/siparisler"
            method="GET"
            className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_160px_170px_170px_auto]"
          >
            <div className="min-w-0">
              <label
                htmlFor="order-search"
                className="mb-2 block text-[10px] font-bold uppercase tracking-[0.1em] text-[#747974]"
              >
                Müşteri veya Sipariş Ara
              </label>

              <div className="relative">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#858B85]"
                />

                <input
                  id="order-search"
                  name="q"
                  type="search"
                  defaultValue={q}
                  placeholder="Ad, soyad veya sipariş numarası"
                  maxLength={100}
                  className={`${inputClass} pl-11`}
                />
              </div>
            </div>

            <div className="min-w-0">
              <label
                htmlFor="order-status"
                className="mb-2 block text-[10px] font-bold uppercase tracking-[0.1em] text-[#747974]"
              >
                Sipariş Durumu
              </label>

              <select
                id="order-status"
                name="status"
                defaultValue={status}
                className={inputClass}
              >
                <option value="all">Tüm Durumlar</option>

                {Object.entries(statusLabels).map(
                  ([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div className="min-w-0">
              <label
                htmlFor="order-cancellation"
                className="mb-2 block text-[10px] font-bold uppercase tracking-[0.1em] text-[#747974]"
              >
                İptal Talebi
              </label>
              <select
                id="order-cancellation"
                name="cancellation"
                defaultValue={cancellation}
                className={inputClass}
              >
                <option value="all">Tüm Talepler</option>
                <option value="pending">Değerlendirme Bekliyor</option>
                <option value="approved">Onaylandı</option>
                <option value="rejected">Reddedildi</option>
              </select>
            </div>

            <div className="min-w-0">
              <label
                htmlFor="order-sort"
                className="mb-2 block text-[10px] font-bold uppercase tracking-[0.1em] text-[#747974]"
              >
                Sıralama
              </label>

              <select
                id="order-sort"
                name="sort"
                defaultValue={sort}
                className={inputClass}
              >
                <option value="newest">
                  Tarih: En Yeni
                </option>

                <option value="oldest">
                  Tarih: En Eski
                </option>

                <option value="status_asc">
                  Durum: A → Z
                </option>

                <option value="status_desc">
                  Durum: Z → A
                </option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="min-h-[46px] flex-1 border border-[#A61922] !bg-[#A61922] px-5 text-[11px] font-bold uppercase tracking-[0.08em] !text-white transition-colors hover:!bg-[#85141B] lg:flex-none"
              >
                <span className="!text-white">
                  Uygula
                </span>
              </button>

              {hasFilters && (
                <Link
                  href="/admin/siparisler"
                  className="flex min-h-[46px] items-center justify-center border border-[#D9DCD6] px-4 text-[11px] font-semibold text-[#626A64] transition-colors hover:border-[#111312] hover:text-[#111312]"
                >
                  Temizle
                </Link>
              )}
            </div>
          </form>
        </section>

        <section className="py-8">
          {orders.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center border-y border-[#D9DCD6] px-5 py-14 text-center">
              <ShoppingBag
                size={34}
                strokeWidth={1.3}
                className="text-[#858B85]"
              />

              <h2 className="mt-5 text-lg font-semibold">
                Sipariş bulunamadı.
              </h2>

              <p className="mt-3 max-w-sm text-sm leading-6 text-[#747974]">
                Arama veya filtre kriterlerinize uygun
                sipariş bulunmuyor.
              </p>

              {hasFilters && (
                <Link
                  href="/admin/siparisler"
                  className="mt-6 text-xs font-bold text-[#A61922] hover:underline"
                >
                  Filtreleri Temizle
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[#D9DCD6] text-[10px] font-bold uppercase tracking-[0.1em] text-[#858B85]">
                      <th className="pb-5 pr-4">
                        Sipariş
                      </th>
                      <th className="pb-5 pr-4">
                        Müşteri
                      </th>
                      <th className="pb-5 pr-4">
                        Tarih
                      </th>
                      <th className="pb-5 pr-4">
                        Ödeme
                      </th>
                      <th className="pb-5 pr-4">
                        Durum
                      </th>
                      <th className="pb-5 pr-4 text-right">
                        Tutar
                      </th>
                      <th className="pb-5 text-right">
                        İşlem
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-[#D9DCD6] transition-colors hover:bg-[#EBEDE8]"
                      >
                        <td className="py-5 pr-4">
                          <p className="text-[12px] font-bold">
                            {order.orderNumber}
                          </p>
                          <p className="mt-1 text-[10px] text-[#858B85]">
                            {order._count.items} kalem
                          </p>
                        </td>

                        <td className="py-5 pr-4">
                          <p className="text-[12px] font-semibold">
                            {order.fullName}
                          </p>
                          <p className="mt-1 text-[10px] text-[#858B85]">
                            Hesap: {order.customer?.username ?? "Misafir"}
                          </p>
                        </td>

                        <td className="py-5 pr-4 text-[11px] text-[#626A64]">
                          {formatDate.format(order.createdAt)}
                        </td>

                        <td className="py-5 pr-4 text-[11px] text-[#626A64]">
                          {paymentLabels[order.paymentMethod] ??
                            order.paymentMethod}
                        </td>

                        <td className="py-5 pr-4">
                          <span
                            className={`inline-flex px-3 py-1.5 text-[10px] font-bold ${
                              statusStyles[order.status] ??
                              ""
                            }`}
                          >
                            {statusLabels[order.status] ??
                              order.status}
                          </span>
                          {order.cancellationRequest && (
                            <p className={`mt-2 flex items-center gap-1.5 text-[10px] font-semibold ${
                              order.cancellationRequest.status === "PENDING"
                                ? "text-[#A61922]"
                                : "text-[#747974]"
                            }`}>
                              {order.cancellationRequest.status === "PENDING" && <AlertCircle size={13} />}
                              {order.cancellationRequest.status === "PENDING"
                                ? "İptal talebi bekliyor"
                                : order.cancellationRequest.status === "APPROVED"
                                  ? "İptal talebi onaylandı"
                                  : "İptal talebi reddedildi"}
                            </p>
                          )}
                        </td>

                        <td className="py-5 pr-4 text-right text-[12px] font-bold tabular-nums">
                          {formatPrice.format(
                            Number(order.total),
                          )}
                        </td>

                        <td className="py-5 text-right">
                          <Link
                            href={`/admin/siparisler/${order.id}`}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#A61922] hover:text-[#85141B]"
                          >
                            Detay
                            <ArrowUpRight size={15} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-[#D9DCD6] border-t border-[#D9DCD6] lg:hidden">
                {orders.map((order) => (
                  <article
                    key={order.id}
                    className="min-w-0 py-6"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="break-all text-[12px] font-bold">
                          {order.orderNumber}
                        </p>

                        <p className="mt-2 text-[11px] text-[#858B85]">
                          {formatDate.format(order.createdAt)}
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <span
                          className={`px-3 py-1.5 text-[10px] font-bold ${
                            statusStyles[order.status] ?? ""
                          }`}
                        >
                          {statusLabels[order.status] ?? order.status}
                        </span>
                        {order.cancellationRequest && (
                          <span className={`max-w-[160px] text-right text-[10px] font-semibold ${
                            order.cancellationRequest.status === "PENDING"
                              ? "text-[#A61922]"
                              : "text-[#747974]"
                          }`}>
                            {order.cancellationRequest.status === "PENDING"
                              ? "İptal talebi bekliyor"
                              : order.cancellationRequest.status === "APPROVED"
                                ? "İptal talebi onaylandı"
                                : "İptal talebi reddedildi"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 space-y-2">
                      <p className="text-[13px] font-semibold">
                        {order.fullName}
                      </p>

                      <p className="text-[11px] text-[#858B85]">
                        Kullanıcı: {order.customer?.username ?? "Misafir"}
                      </p>

                      <p className="text-[11px] text-[#626A64]">
                        {paymentLabels[order.paymentMethod] ??
                          order.paymentMethod}
                      </p>
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-4 border-t border-[#D9DCD6] pt-4">
                      <p className="text-[17px] font-bold tabular-nums">
                        {formatPrice.format(
                          Number(order.total),
                        )}
                      </p>

                      <Link
                        href={`/admin/siparisler/${order.id}`}
                        className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.06em] text-[#A61922]"
                      >
                        Sipariş Detayı
                        <ArrowUpRight size={16} />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>

        {totalPages > 1 && (
          <nav
            aria-label="Sipariş sayfaları"
            className="flex flex-wrap items-center justify-between gap-4 border-t border-[#D9DCD6] py-6"
          >
            <p className="text-[11px] text-[#747974]">
              Sayfa {currentPage} / {totalPages}
            </p>

            <div className="flex items-center gap-3">
              {currentPage > 1 ? (
                <Link
                  href={buildQuery(
                    { q, status, cancellation, sort, page: currentPage },
                    { page: currentPage - 1 },
                  )}
                  className="inline-flex min-h-10 items-center gap-2 border border-[#D9DCD6] px-4 text-[11px] font-semibold hover:border-[#111312]"
                >
                  <ChevronLeft size={15} />
                  Önceki
                </Link>
              ) : (
                <span className="inline-flex min-h-10 items-center gap-2 border border-[#D9DCD6] px-4 text-[11px] text-[#A3A7A2]">
                  <ChevronLeft size={15} />
                  Önceki
                </span>
              )}

              {currentPage < totalPages ? (
                <Link
                  href={buildQuery(
                    { q, status, cancellation, sort, page: currentPage },
                    { page: currentPage + 1 },
                  )}
                  className="inline-flex min-h-10 items-center gap-2 border border-[#D9DCD6] px-4 text-[11px] font-semibold hover:border-[#111312]"
                >
                  Sonraki
                  <ChevronRight size={15} />
                </Link>
              ) : (
                <span className="inline-flex min-h-10 items-center gap-2 border border-[#D9DCD6] px-4 text-[11px] text-[#A3A7A2]">
                  Sonraki
                  <ChevronRight size={15} />
                </span>
              )}
            </div>
          </nav>
        )}
      </div>
    </main>
  );
}
