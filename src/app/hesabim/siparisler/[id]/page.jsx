
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import OrderCancellationRequest from "@/components/store/OrderCancellationRequest";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CreditCard,
  ExternalLink,
  MapPin,
  Package,
  PackageCheck,
  Phone,
  Mail,
  Truck,
  UserRound,
  XCircle,
} from "lucide-react";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sipariş Detayı | VICIX",
  description: "VICIX sipariş detayları ve sipariş takibi.",
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

const paymentMethodLabels = {
  CASH_ON_DELIVERY: "Kapıda Ödeme",
  ONLINE_PAYMENT: "Online Ödeme",
};

const paymentStatusLabels = {
  PENDING: "Ödeme Bekleniyor",
  PAID: "Ödendi",
  FAILED: "Ödeme Başarısız",
  REFUNDED: "İade Edildi",
};

const progressSteps = [
  {
    status: "PENDING",
    title: "Sipariş Alındı",
    description: "Siparişiniz oluşturuldu.",
  },
  {
    status: "CONFIRMED",
    title: "Onaylandı",
    description: "Siparişiniz onaylandı.",
  },
  {
    status: "PREPARING",
    title: "Hazırlanıyor",
    description: "Ürünleriniz hazırlanıyor.",
  },
  {
    status: "SHIPPED",
    title: "Kargoya Verildi",
    description: "Siparişiniz yola çıktı.",
  },
  {
    status: "DELIVERED",
    title: "Teslim Edildi",
    description: "Siparişiniz tamamlandı.",
  },
];

const dateFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Istanbul",
});

const moneyFormatter = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
});

function formatDate(value) {
  return value ? dateFormatter.format(value) : "—";
}

function formatMoney(value) {
  return moneyFormatter.format(Number(value));
}

function InfoRow({ label, value }) {
  return (
    <div className="flex min-w-0 flex-col gap-2 border-b border-[#D8DBD7] py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <span className="shrink-0 text-[11px] text-[#858B85]">
        {label}
      </span>

      <span className="min-w-0 break-words text-[12px] font-medium text-[#111312] sm:text-right">
        {value || "—"}
      </span>
    </div>
  );
}

function safeTrackingUrl(value) {
  if (!value || typeof value !== "string") return null;

  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      !url.hostname ||
      url.username ||
      url.password
    ) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

function ShippingTracking({ order }) {
  if (order.status === "CANCELLED") return null;

  const hasShippingInfo =
    Boolean(order.shippingCompany) &&
    Boolean(order.trackingNumber);
  const isOnTheWay =
    order.status === "SHIPPED" ||
    order.status === "DELIVERED";
  const trackingLink = safeTrackingUrl(order.trackingUrl);

  return (
    <section className="border-b border-[#D8DBD7] py-10 lg:py-12">
      <div className="flex items-center gap-3">
        <PackageCheck
          size={21}
          strokeWidth={1.5}
          className="text-[#A61922]"
        />
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em]">
          Kargo Takip Bilgileri
        </h2>
      </div>

      {!hasShippingInfo ? (
        <p className="mt-5 text-[12px] leading-7 text-[#626A64]">
          {isOnTheWay
            ? "Kargo takip bilgileri henüz paylaşılmadı. Bilgiler eklendiğinde burada görüntülenecek."
            : "Siparişiniz kargoya hazırlandığında takip bilgileri burada görüntülenecek."}
        </p>
      ) : (
        <>
          {!isOnTheWay && (
            <p className="mt-5 text-[12px] leading-7 text-[#626A64]">
              Kargo bilgileri oluşturuldu. Siparişiniz henüz kargoya verilmedi.
            </p>
          )}
          <div className="mt-5 grid min-w-0 gap-x-12 sm:grid-cols-2">
            <InfoRow
              label="Kargo Firması"
              value={order.shippingCompany}
            />
            <InfoRow
              label="Takip Numarası"
              value={order.trackingNumber}
            />
            {order.shippedAt && (
              <InfoRow
                label="Kargoya Verilme Tarihi"
                value={formatDate(order.shippedAt)}
              />
            )}
            {order.deliveredAt && (
              <InfoRow
                label="Teslim Tarihi"
                value={formatDate(order.deliveredAt)}
              />
            )}
          </div>
          {isOnTheWay && trackingLink && (
            <a
              href={trackingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex min-h-12 items-center justify-center gap-3 bg-[#A61922] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#85141B]"
            >
              Kargomu Takip Et
              <ExternalLink size={16} strokeWidth={1.6} />
            </a>
          )}
        </>
      )}
    </section>
  );
}

function OrderProgress({ status }) {
  if (status === "CANCELLED") {
    return (
      <div className="mt-8 flex items-start gap-4 border-y border-[#D8DBD7] py-6">
        <XCircle
          size={23}
          strokeWidth={1.5}
          className="shrink-0 text-[#A61922]"
        />

        <div>
          <h3 className="text-[13px] font-semibold">
            Sipariş İptal Edildi
          </h3>

          <p className="mt-2 text-[12px] leading-6 text-[#626A64]">
            Bu sipariş iptal edilmiştir. Siparişin
            hazırlık ve teslimat süreci durdurulmuştur.
          </p>
        </div>
      </div>
    );
  }

  const currentIndex = progressSteps.findIndex(
    (step) => step.status === status,
  );

  return (
    <div className="mt-8 grid gap-0 sm:grid-cols-5">
      {progressSteps.map((step, index) => {
        const completed = index <= currentIndex;
        const current = index === currentIndex;

        return (
          <div
            key={step.status}
            className="relative flex gap-4 pb-8 last:pb-0 sm:block sm:pb-0"
          >
            {/* MOBİL ÇİZGİ */}
            {index < progressSteps.length - 1 && (
              <div
                className={`absolute left-[13px] top-7 h-[calc(100%-28px)] w-px sm:hidden ${
                  index < currentIndex
                    ? "bg-[#A61922]"
                    : "bg-[#D8DBD7]"
                }`}
              />
            )}

            {/* MASAÜSTÜ ÇİZGİ */}
            {index < progressSteps.length - 1 && (
              <div
                className={`absolute left-7 right-0 top-[13px] hidden h-px sm:block ${
                  index < currentIndex
                    ? "bg-[#A61922]"
                    : "bg-[#D8DBD7]"
                }`}
              />
            )}

            <div
              className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
                completed
                  ? "border-[#A61922] bg-[#A61922] text-white"
                  : "border-[#D8DBD7] bg-[#F4F3EF] text-[#858B85]"
              }`}
            >
              {completed ? (
                <Check size={14} strokeWidth={2} />
              ) : (
                <span className="text-[10px]">
                  {index + 1}
                </span>
              )}
            </div>

            <div className="min-w-0 sm:mt-4 sm:pr-4">
              <p
                className={`text-[11px] font-bold ${
                  completed
                    ? "text-[#111312]"
                    : "text-[#858B85]"
                }`}
              >
                {step.title}
              </p>

              <p className="mt-2 text-[11px] leading-5 text-[#858B85]">
                {step.description}
              </p>

              {current && (
                <span className="mt-2 inline-block text-[10px] font-semibold text-[#A61922]">
                  Güncel Aşama
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default async function CustomerOrderDetailPage({
  params,
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

  const { id } = await params;

  if (!id || typeof id !== "string") {
    notFound();
  }

  // Güvenlik:
  // Sipariş hem ID hem de oturumdaki müşteri ID'si
  // ile sorgulanıyor. Başka müşterinin siparişi
  // bu sayfadan görüntülenemez.
  const order = await prisma.order.findFirst({
    where: {
      id,
      customerId: customer.id,
    },
    include: {
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
    <main className="min-h-[85svh] w-full overflow-x-clip bg-[#F4F3EF] text-[#111312]">
      <div className="mx-auto w-full max-w-[1200px] px-5 py-12 sm:px-10 lg:px-16 lg:py-20">

        {/* GERİ DÖN */}
        <Link
          href="/hesabim/siparisler"
          className="group inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#626A64] transition-colors hover:text-[#A61922]"
        >
          <ArrowLeft
            size={17}
            strokeWidth={1.5}
            className="transition-transform group-hover:-translate-x-1"
          />

          Siparişlerime Dön
        </Link>

        {/* BAŞLIK */}
        <header className="mt-9 border-b border-[#D8DBD7] pb-10">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A61922]">
            VICIX / ORDER DETAILS
          </span>

          <div className="mt-5 flex flex-wrap items-end justify-between gap-6">
            <div className="min-w-0">
              <h1 className="font-[family-name:var(--font-manrope)] text-[clamp(2.3rem,5vw,4rem)] font-semibold leading-[1.1] tracking-[-0.06em]">
                Sipariş Detayı
                <span className="text-[#A61922]">
                  .
                </span>
              </h1>

              <p className="mt-5 break-all text-[13px] font-semibold">
                {order.orderNumber}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-[#858B85]">
                <CalendarDays
                  size={15}
                  strokeWidth={1.5}
                />

                {formatDate(order.createdAt)}
              </div>
            </div>

            <span
              className={`inline-flex px-4 py-2 text-[11px] font-bold ${
                statusStyles[order.status] ?? ""
              }`}
            >
              {statusLabels[order.status] ??
                order.status}
            </span>
          </div>
        </header>

        {/* SİPARİŞ SÜRECİ */}
        <section className="border-b border-[#D8DBD7] py-10 lg:py-12">
          <div className="flex items-center gap-3">
            <Truck
              size={21}
              strokeWidth={1.5}
              className="text-[#A61922]"
            />

            <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em]">
              Sipariş Süreci
            </h2>
          </div>

          <p className="mt-3 text-[12px] leading-6 text-[#626A64]">
            Siparişinizin güncel aşamasını buradan
            takip edebilirsiniz.
          </p>

          <OrderProgress status={order.status} />

          {(order.shippedAt ||
            order.deliveredAt ||
            order.cancelledAt) && (
            <div className="mt-9 grid gap-5 border-t border-[#D8DBD7] pt-6 sm:grid-cols-3">
              {order.shippedAt && (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.1em] text-[#858B85]">
                    Kargoya Verilme
                  </p>

                  <p className="mt-2 text-[12px] font-medium">
                    {formatDate(order.shippedAt)}
                  </p>
                </div>
              )}

              {order.deliveredAt && (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.1em] text-[#858B85]">
                    Teslim Edilme
                  </p>

                  <p className="mt-2 text-[12px] font-medium">
                    {formatDate(order.deliveredAt)}
                  </p>
                </div>
              )}

              {order.cancelledAt && (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.1em] text-[#858B85]">
                    İptal Tarihi
                  </p>

                  <p className="mt-2 text-[12px] font-medium">
                    {formatDate(order.cancelledAt)}
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* KARGO TAKİP BİLGİLERİ */}
        <ShippingTracking order={order} />

        {/* DETAYLAR */}
        <div className="grid min-w-0 gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.65fr)] lg:gap-16 lg:py-16">

          {/* SOL ALAN */}
          <div className="min-w-0 space-y-12">

            {/* ÜRÜNLER */}
            <section>
              <div className="flex items-center gap-3">
                <Package
                  size={21}
                  strokeWidth={1.5}
                  className="text-[#A61922]"
                />

                <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em]">
                  Sipariş Edilen Ürünler
                </h2>
              </div>

              <div className="mt-7 divide-y divide-[#D8DBD7] border-y border-[#D8DBD7]">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex min-w-0 gap-4 py-6 sm:gap-6"
                  >
                    <div className="flex h-24 w-20 shrink-0 items-center justify-center overflow-hidden bg-[#E9EAE5] sm:h-28 sm:w-24">
                      {item.productImage ? (
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <Package
                          size={25}
                          strokeWidth={1.3}
                          className="text-[#858B85]"
                        />
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                      <div>
                        <p className="break-words text-[13px] font-semibold leading-6">
                          {item.productName}
                        </p>

                        <p className="mt-2 text-[11px] text-[#858B85]">
                          Adet: {item.quantity}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-end justify-between gap-3">
                        <p className="text-[11px] text-[#626A64]">
                          Birim: {formatMoney(item.unitPrice)}
                        </p>

                        <p className="text-[14px] font-bold tabular-nums">
                          {formatMoney(item.totalPrice)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* TESLİMAT */}
            <section>
              <div className="flex items-center gap-3">
                <MapPin
                  size={21}
                  strokeWidth={1.5}
                  className="text-[#A61922]"
                />

                <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em]">
                  Teslimat Bilgileri
                </h2>
              </div>

              <div className="mt-6">
                <InfoRow
                  label="Ad Soyad"
                  value={order.fullName}
                />

                <InfoRow
                  label="İl / İlçe"
                  value={`${order.city} / ${order.district}`}
                />

                {order.postalCode && (
                  <InfoRow
                    label="Posta Kodu"
                    value={order.postalCode}
                  />
                )}

                <div className="border-b border-[#D8DBD7] py-4">
                  <p className="text-[11px] text-[#858B85]">
                    Teslimat Adresi
                  </p>

                  <p className="mt-3 whitespace-pre-wrap break-words text-[12px] leading-7 font-medium">
                    {order.address}
                  </p>
                </div>

                {order.orderNote && (
                  <div className="border-b border-[#D8DBD7] py-4">
                    <p className="text-[11px] text-[#858B85]">
                      Sipariş Notu
                    </p>

                    <p className="mt-3 whitespace-pre-wrap break-words text-[12px] leading-7">
                      {order.orderNote}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* İLETİŞİM */}
            <section>
              <div className="flex items-center gap-3">
                <UserRound
                  size={21}
                  strokeWidth={1.5}
                  className="text-[#A61922]"
                />

                <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em]">
                  İletişim Bilgileri
                </h2>
              </div>

              <div className="mt-6">
                <InfoRow
                  label="E-posta"
                  value={order.email}
                />

                <InfoRow
                  label="Telefon"
                  value={order.phone}
                />
              </div>
            </section>
          </div>

          {/* SAĞ ALAN */}
          <aside className="min-w-0 space-y-12">

            {/* ÖDEME ÖZETİ */}
            <section>
              <div className="flex items-center gap-3">
                <CreditCard
                  size={21}
                  strokeWidth={1.5}
                  className="text-[#A61922]"
                />

                <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em]">
                  Ödeme Özeti
                </h2>
              </div>

              <div className="mt-7 border-t border-[#D8DBD7]">
                <InfoRow
                  label="Ara Toplam"
                  value={formatMoney(order.subtotal)}
                />

                <InfoRow
                  label="Kargo"
                  value={
                    Number(order.shippingFee) === 0
                      ? "Ücretsiz"
                      : formatMoney(order.shippingFee)
                  }
                />

                <InfoRow
                  label="Ödeme Hizmet Bedeli"
                  value={formatMoney(order.paymentFee)}
                />

                <div className="flex items-center justify-between gap-4 py-6">
                  <span className="text-[12px] font-semibold">
                    Genel Toplam
                  </span>

                  <span className="text-[clamp(1.3rem,3vw,1.8rem)] font-bold tracking-tight tabular-nums">
                    {formatMoney(order.total)}
                  </span>
                </div>
              </div>
            </section>

            {/* ÖDEME BİLGİLERİ */}
            <section>
              <div className="flex items-center gap-3">
                <PackageCheck
                  size={21}
                  strokeWidth={1.5}
                  className="text-[#A61922]"
                />

                <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em]">
                  Ödeme Bilgileri
                </h2>
              </div>

              <div className="mt-6">
                <InfoRow
                  label="Ödeme Yöntemi"
                  value={
                    paymentMethodLabels[
                      order.paymentMethod
                    ] ?? order.paymentMethod
                  }
                />

                <InfoRow
                  label="Ödeme Durumu"
                  value={
                    paymentStatusLabels[
                      order.paymentStatus
                    ] ?? order.paymentStatus
                  }
                />

                {order.paidAt && (
                  <InfoRow
                    label="Ödeme Tarihi"
                    value={formatDate(order.paidAt)}
                  />
                )}
              </div>
            </section>

            {/* İPTAL TALEBİ */}
            <OrderCancellationRequest
              orderId={order.id}
              orderStatus={order.status}
              paymentStatus={order.paymentStatus}
              cancellationRequest={order.cancellationRequest}
            />

            {/* BİLGİ */}
            <section className="border-t border-[#D8DBD7] pt-7">
              <h3 className="text-[13px] font-semibold">
                Siparişinizle ilgili yardıma mı
                ihtiyacınız var?
              </h3>

              <p className="mt-3 text-[12px] leading-7 text-[#626A64]">
                Sipariş numaranızı belirterek bizimle
                iletişime geçebilirsiniz.
              </p>

              <p className="mt-4 break-all text-[12px] font-semibold">
                {order.orderNumber}
              </p>
            </section>
          </aside>
        </div>

        {/* ALT NAVİGASYON */}
        <footer className="flex flex-wrap items-center justify-between gap-5 border-t border-[#D8DBD7] pt-7">
          <Link
            href="/hesabim/siparisler"
            className="group inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#111312] transition-colors hover:text-[#A61922]"
          >
            <ArrowLeft
              size={17}
              className="transition-transform group-hover:-translate-x-1"
            />
            Tüm Siparişlerim
          </Link>

          <Link
            href="/urunler"
            className="group inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#A61922]"
          >
            Alışverişe Devam Et
            <ArrowRight
              size={17}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </footer>
      </div>
    </main>
  );
}
