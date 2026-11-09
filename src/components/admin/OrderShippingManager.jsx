
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Truck,
  PackageCheck,
  ExternalLink,
  Save,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  LockKeyhole,
} from "lucide-react";

export default function OrderShippingManager({
  orderId,
  orderNumber,
  orderStatus,
  initialShippingCompany,
  initialTrackingNumber,
  initialTrackingUrl,
}) {
  const router = useRouter();

  const [shippingCompany, setShippingCompany] = useState(
    initialShippingCompany ?? "",
  );
  const [trackingNumber, setTrackingNumber] = useState(
    initialTrackingNumber ?? "",
  );
  const [trackingUrl, setTrackingUrl] = useState(
    initialTrackingUrl ?? "",
  );

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setShippingCompany(initialShippingCompany ?? "");
    setTrackingNumber(initialTrackingNumber ?? "");
    setTrackingUrl(initialTrackingUrl ?? "");
  }, [
    initialShippingCompany,
    initialTrackingNumber,
    initialTrackingUrl,
  ]);

  const isLocked =
    orderStatus === "CANCELLED" ||
    orderStatus === "DELIVERED";

  const hasShippingInfo =
    Boolean(initialShippingCompany) &&
    Boolean(initialTrackingNumber);

  const hasChanges =
    shippingCompany.trim() !==
      (initialShippingCompany ?? "") ||
    trackingNumber.trim() !==
      (initialTrackingNumber ?? "") ||
    trackingUrl.trim() !==
      (initialTrackingUrl ?? "");

  const canSave =
    !isLocked &&
    !loading &&
    shippingCompany.trim().length > 0 &&
    trackingNumber.trim().length > 0 &&
    hasChanges;

  async function handleSubmit(event) {
    event.preventDefault();

    if (!canSave) return;

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `/api/admin/orders/${encodeURIComponent(orderId)}/shipping`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            shippingCompany: shippingCompany.trim(),
            trackingNumber: trackingNumber.trim(),
            trackingUrl: trackingUrl.trim() || null,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Kargo bilgileri kaydedilemedi.",
        );
      }

      setShippingCompany(data.order.shippingCompany ?? "");
      setTrackingNumber(data.order.trackingNumber ?? "");
      setTrackingUrl(data.order.trackingUrl ?? "");

      setMessage(
        data.message || "Kargo bilgileri kaydedildi.",
      );

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Beklenmeyen bir hata oluştu.",
      );

      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "min-h-[48px] w-full min-w-0 border-b border-[#D9DCD6] !bg-transparent px-0 py-3 text-[13px] text-[#191C19] outline-none ring-0 transition-colors placeholder:text-[#A0A59F] focus:border-[#111312] focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <section className="border-t border-[#D9DCD6] pt-7">
      <div className="flex items-center gap-3">
        <Truck
          size={20}
          strokeWidth={1.5}
          className="text-[#A61922]"
        />

        <h2 className="text-lg font-semibold tracking-tight">
          Kargo Yönetimi
        </h2>
      </div>

      <p className="mt-3 text-[12px] leading-6 text-[#747974]">
        Siparişin kargo firmasını, takip numarasını ve
        takip bağlantısını yönetin.
      </p>

      {hasShippingInfo && (
        <div className="mt-5 flex items-center gap-3 border-l-2 border-[#346B38] bg-[#E5EFE3] px-4 py-3">
          <PackageCheck
            size={18}
            className="shrink-0 text-[#346B38]"
          />

          <p className="text-[12px] text-[#346B38]">
            Bu sipariş için kargo bilgileri kayıtlı.
          </p>
        </div>
      )}

      {isLocked && (
        <div className="mt-5 flex items-start gap-3 border border-[#D9DCD6] p-4">
          <LockKeyhole
            size={18}
            className="mt-0.5 shrink-0 text-[#747974]"
          />

          <p className="text-[12px] leading-6 text-[#626A64]">
            {orderStatus === "CANCELLED"
              ? "İptal edilmiş siparişlerin kargo bilgileri değiştirilemez."
              : "Teslim edilmiş siparişlerin kargo bilgileri değiştirilemez."}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div>
          <label
            htmlFor="shipping-company"
            className="block text-[11px] font-semibold text-[#626A64]"
          >
            Kargo Firması
          </label>

          <input
            id="shipping-company"
            type="text"
            value={shippingCompany}
            onChange={(event) =>
              setShippingCompany(event.target.value)
            }
            placeholder="Örn. Yurtiçi Kargo"
            maxLength={100}
            autoComplete="off"
            disabled={isLocked || loading}
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor="tracking-number"
            className="block text-[11px] font-semibold text-[#626A64]"
          >
            Kargo Takip Numarası
          </label>

          <input
            id="tracking-number"
            type="text"
            value={trackingNumber}
            onChange={(event) =>
              setTrackingNumber(event.target.value)
            }
            placeholder="Kargo takip numarasını girin"
            maxLength={150}
            autoComplete="off"
            disabled={isLocked || loading}
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor="tracking-url"
            className="block text-[11px] font-semibold text-[#626A64]"
          >
            Kargo Takip Bağlantısı
            <span className="ml-2 font-normal text-[#969B94]">
              (İsteğe bağlı)
            </span>
          </label>

          <input
            id="tracking-url"
            type="url"
            value={trackingUrl}
            onChange={(event) =>
              setTrackingUrl(event.target.value)
            }
            placeholder="https://..."
            maxLength={2000}
            autoComplete="off"
            disabled={isLocked || loading}
            className={inputClass}
          />
        </div>

        <div className="flex items-start gap-3">
          <AlertTriangle
            size={17}
            className="mt-0.5 shrink-0 text-[#A16A19]"
          />

          <p className="text-[11px] leading-6 text-[#747974]">
            Kargo bilgilerini kaydetmek siparişi otomatik
            olarak kargoya verildi durumuna geçirmez.
            Sipariş durumunu ayrıca yönetmelisiniz.
          </p>
        </div>

        <button
          type="submit"
          disabled={!canSave}
          className="flex min-h-[50px] w-full items-center justify-center gap-3 !bg-[#A61922] px-5 text-[11px] font-bold uppercase tracking-[0.08em] !text-white transition-colors hover:!bg-[#85141B] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? (
            <>
              <Loader2
                size={17}
                className="animate-spin"
              />
              Kaydediliyor...
            </>
          ) : (
            <>
              <Save size={17} />
              Kargo Bilgilerini Kaydet
            </>
          )}
        </button>
      </form>

      {trackingUrl?.startsWith("https://") && (
        <a
          href={trackingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2 break-all text-[12px] font-semibold text-[#A61922] transition-opacity hover:opacity-70"
        >
          <ExternalLink size={15} />
          Kargo Takip Sayfasını Aç
        </a>
      )}

      {error && (
        <div
          role="alert"
          className="mt-5 border-l-2 border-[#A61922] bg-[#F5E4E5] px-4 py-3 text-[12px] leading-6 text-[#85141B]"
        >
          {error}
        </div>
      )}

      {message && (
        <div
          role="status"
          className="mt-5 flex items-start gap-3 border-l-2 border-[#346B38] bg-[#E5EFE3] px-4 py-3"
        >
          <CheckCircle2
            size={17}
            className="mt-0.5 shrink-0 text-[#346B38]"
          />

          <p className="text-[12px] leading-6 text-[#346B38]">
            {message}
          </p>
        </div>
      )}
    </section>
  );
}
