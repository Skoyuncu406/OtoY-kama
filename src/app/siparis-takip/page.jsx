
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleAlert,
  ClipboardList,
  Loader2,
  Package,
  PackageCheck,
  PackageSearch,
  Search,
  Truck,
  ExternalLink,
  CreditCard,
  CalendarDays,
  XCircle,
} from "lucide-react";

const STEPS = [
  { key: "PENDING", label: "Sipariş Alındı" },
  { key: "CONFIRMED", label: "Onaylandı" },
  { key: "PREPARING", label: "Hazırlanıyor" },
  { key: "SHIPPED", label: "Kargoya Verildi" },
  { key: "DELIVERED", label: "Teslim Edildi" },
];

const STATUS_LABELS = {
  PENDING: "Sipariş Alındı",
  CONFIRMED: "Sipariş Onaylandı",
  PREPARING: "Hazırlanıyor",
  SHIPPED: "Kargoya Verildi",
  DELIVERED: "Teslim Edildi",
  CANCELLED: "Sipariş İptal Edildi",
};

const PAYMENT_LABELS = {
  PENDING: "Ödeme Bekleniyor",
  PAID: "Ödendi",
  FAILED: "Ödeme Başarısız",
  REFUNDED: "İade Edildi",
};

const dateFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : dateFormatter.format(date);
}

function getStepIndex(status) {
  return STEPS.findIndex((step) => step.key === status);
}

function getSafeTrackingUrl(value) {
  if (!value || typeof value !== "string") {
    return null;
  }

  try {
    const url = new URL(value);

    return ["https:", "http:"].includes(url.protocol)
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function SectionTitle({ number, title, description }) {
  return (
    <div className="mb-7 flex items-start gap-4 border-b border-[#D8DBD7] pb-6">
      <span className="pt-1 text-[11px] font-bold text-[#A61922]">
        {number}
      </span>

      <div className="min-w-0">
        <h2 className="font-[family-name:var(--font-manrope)] text-[21px] font-semibold tracking-[-0.045em] sm:text-[25px]">
          {title}
        </h2>

        {description && (
          <p className="mt-2 text-[12px] leading-6 text-[#626A64]">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function StatusProgress({ status }) {
  const activeIndex = getStepIndex(status);
  const cancelled = status === "CANCELLED";

  if (cancelled) {
    return (
      <div className="flex items-start gap-4 border-l-2 border-[#A61922] bg-[#F1E7E5] px-5 py-5">
        <XCircle
          size={23}
          strokeWidth={1.5}
          className="shrink-0 text-[#A61922]"
        />

        <div>
          <p className="text-[13px] font-bold text-[#A61922]">
            Sipariş İptal Edildi
          </p>

          <p className="mt-2 text-[12px] leading-6 text-[#626A64]">
            Bu sipariş iptal edildiği için teslimat süreci
            devam etmiyor.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-5 gap-1 sm:gap-3">
      {STEPS.map((step, index) => {
        const completed = index < activeIndex;
        const current = index === activeIndex;
        const reached = index <= activeIndex;

        return (
          <div key={step.key} className="min-w-0">
            <div
              className={`flex h-10 items-center justify-center border transition-colors sm:h-12 ${
                reached
                  ? "border-[#111312] bg-[#111312] text-white"
                  : "border-[#D8DBD7] bg-transparent text-[#9CA19B]"
              }`}
            >
              {completed ? (
                <Check size={18} strokeWidth={1.8} />
              ) : current ? (
                <span className="text-[12px] font-bold">
                  {String(index + 1).padStart(2, "0")}
                </span>
              ) : (
                <span className="text-[12px]">
                  {String(index + 1).padStart(2, "0")}
                </span>
              )}
            </div>

            <p
              className={`mt-3 text-center text-[9px] font-semibold leading-4 sm:text-[11px] ${
                reached
                  ? "text-[#111312]"
                  : "text-[#9CA19B]"
              }`}
            >
              {step.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function OrderResult({ order }) {
  const safeTrackingUrl = getSafeTrackingUrl(
    order.trackingUrl,
  );

  return (
    <div className="mt-14 border-t border-[#D8DBD7] pt-12 sm:mt-16">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#A61922]">
            VICIX / SİPARİŞ BİLGİLERİ
          </p>

          <h2 className="mt-4 break-all font-[family-name:var(--font-manrope)] text-[clamp(1.5rem,4vw,2.6rem)] font-semibold tracking-[-0.055em]">
            {order.orderNumber}
          </h2>

          <p className="mt-3 flex items-center gap-2 text-[12px] text-[#626A64]">
            <CalendarDays size={15} strokeWidth={1.5} />
            {formatDate(order.createdAt)}
          </p>
        </div>

        <div className="flex items-center gap-2 border border-[#D8DBD7] px-4 py-3">
          {order.status === "CANCELLED" ? (
            <XCircle
              size={17}
              className="text-[#A61922]"
            />
          ) : (
            <PackageCheck
              size={17}
              className="text-[#527C16]"
            />
          )}

          <span className="text-[11px] font-bold">
            {STATUS_LABELS[order.status] ?? "İşlemde"}
          </span>
        </div>
      </div>

      <section className="mt-12">
        <SectionTitle
          number="01"
          title="Sipariş Durumu"
          description="Siparişinizin hazırlık ve teslimat aşamalarını buradan takip edebilirsiniz."
        />

        <StatusProgress status={order.status} />

        {order.status === "DELIVERED" && (
          <p className="mt-7 flex items-center gap-2 text-[12px] text-[#527C16]">
            <PackageCheck size={17} />
            Siparişiniz başarıyla teslim edildi.
          </p>
        )}
      </section>

      <section className="mt-14">
        <SectionTitle
          number="02"
          title="Kargo Bilgileri"
          description="Siparişiniz kargoya verildiğinde gönderi bilgileri burada görüntülenir."
        />

        {order.shippingCompany ||
        order.trackingNumber ||
        safeTrackingUrl ? (
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-5 border-b border-[#D8DBD7] pb-5">
              <span className="text-[12px] text-[#626A64]">
                Kargo Firması
              </span>

              <span className="text-right text-[12px] font-semibold">
                {order.shippingCompany || "Belirtilmedi"}
              </span>
            </div>

            {order.trackingNumber && (
              <div className="flex items-center justify-between gap-5 border-b border-[#D8DBD7] pb-5">
                <span className="text-[12px] text-[#626A64]">
                  Kargo Takip Numarası
                </span>

                <span className="break-all text-right text-[12px] font-semibold">
                  {order.trackingNumber}
                </span>
              </div>
            )}

            {order.shippedAt && (
              <div className="flex items-center justify-between gap-5 border-b border-[#D8DBD7] pb-5">
                <span className="text-[12px] text-[#626A64]">
                  Kargoya Verilme Tarihi
                </span>

                <span className="text-right text-[12px] font-semibold">
                  {formatDate(order.shippedAt)}
                </span>
              </div>
            )}

            {order.deliveredAt && (
              <div className="flex items-center justify-between gap-5 border-b border-[#D8DBD7] pb-5">
                <span className="text-[12px] text-[#626A64]">
                  Teslimat Tarihi
                </span>

                <span className="text-right text-[12px] font-semibold">
                  {formatDate(order.deliveredAt)}
                </span>
              </div>
            )}

            {safeTrackingUrl && (
              <a
                href={safeTrackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex min-h-[48px] items-center gap-3 border border-[#111312] px-5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#111312] transition-colors hover:border-[#A61922] hover:text-[#A61922]"
              >
                Kargo Firmasında Takip Et

                <ExternalLink
                  size={16}
                  strokeWidth={1.6}
                />
              </a>
            )}
          </div>
        ) : (
          <div className="flex items-start gap-4 border-l-2 border-[#D8DBD7] py-3 pl-5">
            <Truck
              size={23}
              strokeWidth={1.4}
              className="shrink-0 text-[#858B85]"
            />

            <div>
              <p className="text-[13px] font-semibold">
                Kargo bilgileri henüz eklenmedi.
              </p>

              <p className="mt-2 text-[12px] leading-6 text-[#626A64]">
                Siparişiniz kargoya verildiğinde gönderi
                detayları bu alanda görüntülenecektir.
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="mt-14">
        <SectionTitle
          number="03"
          title="Sipariş İçeriği"
          description="Siparişinizde bulunan ürünler ve adet bilgileri."
        />

        <div className="border-t border-[#D8DBD7]">
          {order.items.map((item, index) => (
            <div
              key={`${item.productName}-${index}`}
              className="flex min-w-0 items-center gap-5 border-b border-[#D8DBD7] py-5"
            >
              <div className="relative h-[90px] w-[76px] shrink-0 overflow-hidden bg-[#E6E8E3]">
                {item.productImage ? (
                  <Image
                    src={item.productImage}
                    alt={item.productName}
                    fill
                    sizes="76px"
                    className="object-contain"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[#858B85]">
                    <Package
                      size={23}
                      strokeWidth={1.3}
                    />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold leading-6">
                  {item.productName}
                </p>

                <p className="mt-2 text-[11px] text-[#626A64]">
                  Adet: {item.quantity}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <SectionTitle
          number="04"
          title="Ödeme Bilgileri"
        />

        <div className="space-y-5">
          <div className="flex items-center justify-between gap-5 border-b border-[#D8DBD7] pb-5">
            <span className="text-[12px] text-[#626A64]">
              Ödeme Yöntemi
            </span>

            <span className="text-right text-[12px] font-semibold">
              {order.paymentMethod === "CASH_ON_DELIVERY"
                ? "Kapıda Ödeme"
                : "Online Ödeme"}
            </span>
          </div>

          <div className="flex items-center justify-between gap-5 border-b border-[#D8DBD7] pb-5">
            <span className="text-[12px] text-[#626A64]">
              Ödeme Durumu
            </span>

            <span className="text-right text-[12px] font-semibold">
              {PAYMENT_LABELS[order.paymentStatus] ??
                "Bilinmiyor"}
            </span>
          </div>
        </div>
      </section>

      <div className="mt-14 border-t border-[#D8DBD7] pt-8">
        <Link
          href="/urunler"
          className="group inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.1em] text-[#111312] transition-colors hover:text-[#A61922]"
        >
          Alışverişe Devam Et
          <ArrowRight
            size={17}
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>
      </div>
    </div>
  );
}

export default function OrderTrackingPage() {
  const [trackingCode, setTrackingCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    const code = trackingCode.trim().toUpperCase();

    setOrder(null);
    setError("");

    if (!/^VTX-[A-F0-9]{48}$/.test(code)) {
      setError(
        "Geçerli bir sipariş takip kodu girin.",
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/store/order-tracking",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
          body: JSON.stringify({
            trackingCode: code,
          }),
        },
      );

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.error ||
            "Sipariş sorgulanamadı. Lütfen tekrar deneyin.",
        );
      }

      setOrder(data.order);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Bir hata oluştu. Lütfen tekrar deneyin.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    setTrackingCode(event.target.value);
    setError("");
    setOrder(null);
  }

  return (
    <main className="min-h-[75vh] w-full overflow-x-clip bg-[#F4F3EF] text-[#111312]">
      <div className="revora-container py-10 sm:py-16 lg:py-20">
        <div className="border-b border-[#D8DBD7] pb-10 sm:pb-14">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-[11px] font-semibold text-[#626A64] transition-colors hover:text-[#A61922]"
          >
            <ArrowLeft size={15} />
            Ana Sayfaya Dön
          </Link>

          <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.22em] text-[#A61922]">
            VICIX / SİPARİŞ TAKİP
          </p>

          <h1 className="font-[family-name:var(--font-manrope)] text-[clamp(2.5rem,6vw,5.5rem)] font-semibold leading-[1.05] tracking-[-0.06em]">
            Siparişinizi{" "}
            <span className="text-[#858B85]">
              takip edin.
            </span>
          </h1>

          <p className="mt-6 max-w-[540px] text-[13px] leading-7 text-[#626A64]">
            Siparişinizin güncel durumunu öğrenmek için
            size verilen takip kodunu girmeniz yeterlidir.
            Üye girişi yapmanıza gerek yoktur.
          </p>
        </div>

        <div className="mx-auto max-w-[820px] pt-12 sm:pt-16">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-[#D8DBD7]">
              <PackageSearch
                size={23}
                strokeWidth={1.4}
              />
            </div>

            <div>
              <h2 className="font-[family-name:var(--font-manrope)] text-[22px] font-semibold tracking-[-0.045em]">
                Sipariş Sorgulama
              </h2>

              <p className="mt-2 text-[12px] leading-6 text-[#626A64]">
                Siparişiniz oluşturulurken gösterilen
                takip kodunu aşağıya yazın.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-10"
          >
            <label
              htmlFor="trackingCode"
              className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#626A64]"
            >
              Sipariş Takip Kodu
            </label>

            <div className="mt-3 flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end">
              <input
                id="trackingCode"
                name="trackingCode"
                type="text"
                value={trackingCode}
                onChange={handleChange}
                placeholder="VTX-..."
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                maxLength={52}
                required
                className="min-h-[54px] w-full min-w-0 flex-1 rounded-none border-0 border-b border-[#D8DBD7] bg-transparent px-0 py-3 font-mono text-[12px] text-[#111312] outline-none ring-0 placeholder:text-[#9CA19B] focus:border-[#111312] focus:outline-none focus:ring-0 sm:text-[13px]"
              />

              <button
                type="submit"
                disabled={loading}
                className="group flex min-h-[54px] shrink-0 items-center justify-center gap-4 border border-[#A61922] !bg-[#A61922] px-7 text-[11px] font-bold uppercase tracking-[0.08em] !text-white transition-colors hover:!border-[#84131B] hover:!bg-[#84131B] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="!text-white">
                  {loading
                    ? "Sorgulanıyor..."
                    : "Siparişi Sorgula"}
                </span>

                {loading ? (
                  <Loader2
                    size={18}
                    className="animate-spin !text-white"
                  />
                ) : (
                  <Search
                    size={18}
                    className="!text-white"
                  />
                )}
              </button>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-6 flex items-start gap-3 border-l-2 border-[#A61922] bg-[#F1E7E5] px-4 py-4"
              >
                <CircleAlert
                  size={18}
                  className="mt-0.5 shrink-0 text-[#A61922]"
                />

                <p className="text-[12px] leading-6 text-[#A61922]">
                  {error}
                </p>
              </div>
            )}

            <div className="mt-7 flex items-start gap-3">
              <ClipboardList
                size={18}
                strokeWidth={1.5}
                className="mt-0.5 shrink-0 text-[#858B85]"
              />

              <p className="text-[11px] leading-6 text-[#626A64]">
                Takip kodunuz, sipariş tamamlandıktan
                sonra gösterilen onay ekranında bulunur.
                Güvenliğiniz için kodunuzu başkalarıyla
                paylaşmayın.
              </p>
            </div>
          </form>

          {order && <OrderResult order={order} />}

          {!order && !error && (
            <div className="mt-16 flex items-start gap-4 border-t border-[#D8DBD7] pt-8">
              <Truck
                size={23}
                strokeWidth={1.3}
                className="shrink-0 text-[#858B85]"
              />

              <div>
                <p className="text-[12px] font-semibold">
                  Siparişinizin her aşamasını görüntüleyin.
                </p>

                <p className="mt-2 text-[11px] leading-6 text-[#626A64]">
                  Sipariş onayı, hazırlık, kargoya verilme
                  ve teslimat bilgileri burada gösterilir.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
