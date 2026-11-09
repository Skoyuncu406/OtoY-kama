
import Link from "next/link";
import { notFound } from "next/navigation";

import OrderStatusManager from "@/components/admin/OrderStatusManager";
import OrderPaymentManager from "@/components/admin/OrderPaymentManager";
import OrderShippingManager from "@/components/admin/OrderShippingManager";
import OrderCancellationManager from "@/components/admin/OrderCancellationManager";

import {
  ArrowLeft,
  CalendarDays,
  CreditCard,
  MapPin,
  Package,
  Truck,
  UserRound,
} from "lucide-react";

import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sipariş Detayı | VICIX Yönetim",
  robots: {
    index: false,
    follow: false,
  },
};

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

const money = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
});

const dateTime = new Intl.DateTimeFormat("tr-TR", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Europe/Istanbul",
});

function DetailRow({ label, children }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-x-5 gap-y-2 border-b border-[#D9DCD6] py-4 last:border-b-0">
      <span className="text-[12px] text-[#747974]">
        {label}
      </span>

      <div className="min-w-0 max-w-full break-words text-right text-[12px] font-semibold text-[#191C19]">
        {children}
      </div>
    </div>
  );
}

function SectionHeading({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-3 border-b border-[#D9DCD6] pb-5">
      <Icon
        size={20}
        strokeWidth={1.5}
        className="shrink-0 text-[#A61922]"
      />

      <h2 className="text-lg font-semibold tracking-tight">
        {title}
      </h2>
    </div>
  );
}

export default async function AdminOrderDetailPage({
  params,
}) {
  await requireAdmin();

  const { id } = await params;

  if (!id || typeof id !== "string") {
    notFound();
  }

  const order = await prisma.order.findUnique({
    where: {
      id,
    },
    include: {
      customer: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
      items: {
        orderBy: {
          createdAt: "asc",
        },
      },
      cancellationRequest: {
        select: {
          id: true,
          status: true,
          reason: true,
          adminNote: true,
          createdAt: true,
          reviewedAt: true,
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <main className="min-h-screen w-full overflow-x-clip bg-[#F4F3EF] px-5 py-10 text-[#191C19] sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-6xl">

        {/* SAYFA BAŞLIĞI */}
        <header className="border-b border-[#D9DCD6] pb-8">
          <Link
            href="/admin/siparisler"
            className="group inline-flex items-center gap-2 text-[11px] font-semibold text-[#747974] transition-colors hover:text-[#A61922]"
          >
            <ArrowLeft
              size={15}
              className="transition-transform group-hover:-translate-x-1"
            />

            Siparişlere Dön
          </Link>

          <div className="mt-8 flex flex-wrap items-start justify-between gap-5">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#A61922]">
                VICIX CAR CARE / SİPARİŞ
              </p>

              <h1 className="mt-4 break-all text-2xl font-semibold tracking-[-0.045em] sm:text-4xl">
                {order.orderNumber}
              </h1>

              <p className="mt-3 flex items-center gap-2 text-[12px] text-[#747974]">
                <CalendarDays size={15} />
                {dateTime.format(order.createdAt)}
              </p>
            </div>

            <span
              className={`inline-flex px-4 py-2 text-[11px] font-bold ${
                statusStyles[order.status] ?? ""
              }`}
            >
              {statusLabels[order.status] ?? order.status}
            </span>
          </div>
        </header>

        {/* ANA İÇERİK */}
        <div className="grid min-w-0 gap-x-12 gap-y-12 py-10 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,1fr)]">

          {/* SOL SÜTUN */}
          <div className="min-w-0 space-y-12">

            {/* SİPARİŞ ÜRÜNLERİ */}
            <section>
              <SectionHeading
                icon={Package}
                title="Sipariş Edilen Ürünler"
              />

              <div className="divide-y divide-[#D9DCD6]">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex min-w-0 items-center gap-4 py-6"
                  >
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden bg-[#E9EAE5] sm:h-24 sm:w-24">
                      {item.productImage ? (
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="h-full w-full object-contain p-2"
                        />
                      ) : (
                        <Package
                          size={25}
                          className="text-[#969B94]"
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="break-words text-[13px] font-semibold leading-6">
                        {item.productName}
                      </p>

                      <p className="mt-2 text-[11px] text-[#747974]">
                        {item.quantity} adet ×{" "}
                        {money.format(
                          Number(item.unitPrice),
                        )}
                      </p>
                    </div>

                    <p className="shrink-0 text-right text-[12px] font-bold tabular-nums">
                      {money.format(
                        Number(item.totalPrice),
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* MÜŞTERİ BİLGİLERİ */}
            <section>
              <SectionHeading
                icon={UserRound}
                title="Müşteri Bilgileri"
              />

              <DetailRow label="Sipariş Veren">
                {order.fullName}
              </DetailRow>

              <DetailRow label="Hesap Türü">
                {order.customer ? "Kayıtlı Üye" : "Misafir Siparişi"}
              </DetailRow>

              <DetailRow label="Kullanıcı Adı">
                {order.customer?.username ?? "Misafir"}
              </DetailRow>

              <DetailRow label="E-posta">
                <a
                  href={`mailto:${order.email}`}
                  className="break-all transition-colors hover:text-[#A61922]"
                >
                  {order.email}
                </a>
              </DetailRow>

              <DetailRow label="Telefon">
                <a
                  href={`tel:${order.phone.replace(
                    /[^\d+]/g,
                    "",
                  )}`}
                  className="transition-colors hover:text-[#A61922]"
                >
                  {order.phone}
                </a>
              </DetailRow>
            </section>

            {/* TESLİMAT BİLGİLERİ */}
            <section>
              <SectionHeading
                icon={MapPin}
                title="Teslimat Bilgileri"
              />

              <DetailRow label="Ad Soyad">
                {order.fullName}
              </DetailRow>

              <DetailRow label="İl / İlçe">
                {order.city} / {order.district}
              </DetailRow>

              <DetailRow label="Posta Kodu">
                {order.postalCode || "Belirtilmedi"}
              </DetailRow>

              <div className="border-b border-[#D9DCD6] py-5">
                <p className="text-[12px] text-[#747974]">
                  Teslimat Adresi
                </p>

                <p className="mt-3 whitespace-pre-wrap break-words text-[13px] font-medium leading-7">
                  {order.address}
                </p>
              </div>

              {order.orderNote && (
                <div className="py-5">
                  <p className="text-[12px] text-[#747974]">
                    Sipariş Notu
                  </p>

                  <p className="mt-3 whitespace-pre-wrap break-words text-[13px] leading-7">
                    {order.orderNote}
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* SAĞ SÜTUN */}
          <aside className="min-w-0 space-y-10">

            {/* ÖDEME ÖZETİ */}
            <section>
              <SectionHeading
                icon={CreditCard}
                title="Ödeme Özeti"
              />

              <DetailRow label="Ara Toplam">
                {money.format(Number(order.subtotal))}
              </DetailRow>

              <DetailRow label="Kargo">
                {money.format(Number(order.shippingFee))}
              </DetailRow>

              <DetailRow label="Ödeme Ücreti">
                {money.format(Number(order.paymentFee))}
              </DetailRow>

              <div className="flex items-center justify-between gap-4 border-t border-[#191C19] py-5">
                <span className="text-[13px] font-bold">
                  Toplam
                </span>

                <span className="text-xl font-bold tabular-nums">
                  {money.format(Number(order.total))}
                </span>
              </div>
            </section>

            {/* ÖDEME YÖNETİMİ */}
            <OrderPaymentManager
              key={`${order.id}-${order.paymentStatus}`}
              orderId={order.id}
              orderNumber={order.orderNumber}
              orderStatus={order.status}
              paymentMethod={order.paymentMethod}
              initialPaymentStatus={order.paymentStatus}
              initialPaidAt={
                order.paidAt?.toISOString() ?? null
              }
              cancellationRequestStatus={
  order.cancellationRequest?.status ?? null
}
            />

            {/* SİPARİŞ SÜRECİ */}
            <section>
              <SectionHeading
                icon={Truck}
                title="Sipariş Süreci"
              />

              <DetailRow label="Sipariş Durumu">
                {statusLabels[order.status] ??
                  order.status}
              </DetailRow>

              <DetailRow label="Sipariş Tarihi">
                {dateTime.format(order.createdAt)}
              </DetailRow>

              <DetailRow label="Sipariş Takip Kodu">
                {order.trackingCode ? (
                  <span className="block max-w-[300px] break-all font-mono text-[11px] font-medium select-all">
                    {order.trackingCode}
                  </span>
                ) : (
                  <span className="font-normal text-[#858B85]">
                    Eski sipariş — takip kodu bulunmuyor
                  </span>
                )}
              </DetailRow>

              {order.shippedAt && (
                <DetailRow label="Kargoya Verildi">
                  {dateTime.format(order.shippedAt)}
                </DetailRow>
              )}

              {order.deliveredAt && (
                <DetailRow label="Teslim Edildi">
                  {dateTime.format(order.deliveredAt)}
                </DetailRow>
              )}

              {order.cancelledAt && (
                <DetailRow label="İptal Edildi">
                  {dateTime.format(order.cancelledAt)}
                </DetailRow>
              )}
            </section>

            {/* KARGO YÖNETİMİ */}
            <OrderShippingManager
              key={`${order.id}-${order.status}-${order.trackingNumber ?? ""}`}
              orderId={order.id}
              orderNumber={order.orderNumber}
              orderStatus={order.status}
              initialShippingCompany={
                order.shippingCompany
              }
              initialTrackingNumber={
                order.trackingNumber
              }
              initialTrackingUrl={
                order.trackingUrl
              }
            />

            {/* MÜŞTERİ İPTAL TALEBİ */}
            <OrderCancellationManager
              key={`${order.id}-${order.cancellationRequest?.status ?? "none"}-${order.status}-${order.paymentStatus}`}
              orderId={order.id}
              orderStatus={order.status}
              paymentStatus={order.paymentStatus}
              cancellationRequest={
                order.cancellationRequest
                  ? {
                      ...order.cancellationRequest,
                      createdAt: order.cancellationRequest.createdAt.toISOString(),
                      reviewedAt: order.cancellationRequest.reviewedAt?.toISOString() ?? null,
                    }
                  : null
              }
            />

            {/* SİPARİŞ DURUM YÖNETİMİ */}
            <OrderStatusManager
              key={`${order.id}-${order.status}`}
              orderId={order.id}
              orderNumber={order.orderNumber}
              initialStatus={order.status}
              paymentStatus={order.paymentStatus}
              cancellationRequestStatus={
  order.cancellationRequest?.status ?? null
}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}
