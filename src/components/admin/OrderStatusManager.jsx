
"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  XCircle,
  Clock3,
} from "lucide-react";

const nextActions = {
  PENDING: {
    status: "CONFIRMED",
    label: "Siparişi Onayla",
  },
  CONFIRMED: {
    status: "PREPARING",
    label: "Hazırlamaya Başla",
  },
  PREPARING: {
    status: "SHIPPED",
    label: "Kargoya Ver",
  },
  SHIPPED: {
    status: "DELIVERED",
    label: "Teslim Edildi Olarak İşaretle",
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

const cancellableStatuses = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
];

export default function OrderStatusManager({
  orderId,
  orderNumber,
  initialStatus,
  paymentStatus,
  cancellationRequestStatus = null,
}) {
  const router = useRouter();

  const [status, setStatus] = useState(initialStatus);
  const [pending, startTransition] = useTransition();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [
    showCancelConfirmation,
    setShowCancelConfirmation,
  ] = useState(false);

  const busy = submitting || pending;

  const nextAction = nextActions[status];

  const hasPendingCancellation =
    cancellationRequestStatus === "PENDING";

  const canAdvance =
    Boolean(nextAction) && !hasPendingCancellation;

  const canCancel =
    cancellableStatuses.includes(status) &&
    paymentStatus === "PENDING";

  const isFinished =
    status === "DELIVERED" ||
    status === "CANCELLED";

  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  useEffect(() => {
    if (!canCancel) {
      setShowCancelConfirmation(false);
    }
  }, [canCancel]);

  async function updateStatus(targetStatus) {
    if (busy) return;

    if (
      targetStatus !== "CANCELLED" &&
      !canAdvance
    ) {
      return;
    }

    if (
      targetStatus === "CANCELLED" &&
      !canCancel
    ) {
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/admin/orders/${encodeURIComponent(orderId)}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: targetStatus,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Sipariş durumu güncellenemedi.",
        );
      }

      setStatus(data.order.status);
      setSuccess(
        data.message || "Sipariş güncellendi.",
      );
      setShowCancelConfirmation(false);

      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Beklenmeyen bir hata oluştu.",
      );

      startTransition(() => {
        router.refresh();
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="border-t border-[#D9DCD6] pt-7">
      <div className="flex items-center gap-3">
        <CheckCircle2
          size={20}
          strokeWidth={1.5}
          className="text-[#A61922]"
        />

        <h2 className="text-lg font-semibold tracking-tight">
          Durum Yönetimi
        </h2>
      </div>

      <p className="mt-3 text-[12px] leading-6 text-[#747974]">
        Siparişin mevcut durumunu görüntüleyin ve
        bir sonraki aşamaya ilerletin.
      </p>

      <div className="mt-6 border-y border-[#D9DCD6] py-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#858B85]">
          Mevcut Durum
        </p>

        <p className="mt-2 text-lg font-semibold">
          {statusLabels[status] || status}
        </p>
      </div>

      {hasPendingCancellation &&
        !isFinished && (
          <div className="mt-6 flex items-start gap-3 border border-[#E6D8C1] bg-[#F8F1E6] p-4">
            <Clock3
              size={19}
              strokeWidth={1.5}
              className="mt-0.5 shrink-0 text-[#A16A19]"
            />

            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-[#7A5B2C]">
                İptal Talebi Değerlendirme Bekliyor
              </p>

              <p className="mt-2 text-[11px] leading-6 text-[#7A5B2C]">
                Müşteri bu sipariş için iptal
                talebinde bulundu. Talep
                değerlendirilene kadar sipariş
                bir sonraki aşamaya ilerletilemez.
              </p>

              <p className="mt-2 text-[11px] leading-6 text-[#7A5B2C]">
                İptal talebini yukarıdaki ilgili
                bölümden onaylayabilir veya
                reddedebilirsiniz.
              </p>
            </div>
          </div>
        )}

      {nextAction && (
        <button
          type="button"
          disabled={busy || !canAdvance}
          onClick={() =>
            updateStatus(nextAction.status)
          }
          className={`group mt-6 flex min-h-[54px] w-full items-center justify-between gap-4 border px-5 transition-colors duration-300 disabled:cursor-not-allowed ${
            canAdvance
              ? "border-[#A61922] !bg-[#A61922] !text-white hover:!bg-[#85141B] disabled:opacity-60"
              : "border-[#D9DCD6] !bg-[#E8E9E6] !text-[#858B85]"
          }`}
        >
          <span
            className={`text-[11px] font-bold uppercase tracking-[0.08em] ${
              canAdvance
                ? "!text-white"
                : "!text-[#858B85]"
            }`}
          >
            {submitting
              ? "Güncelleniyor..."
              : nextAction.label}
          </span>

          {busy ? (
            <Loader2
              size={18}
              className={`animate-spin ${
                canAdvance
                  ? "!text-white"
                  : "!text-[#858B85]"
              }`}
            />
          ) : (
            <ArrowRight
              size={18}
              className={
                canAdvance
                  ? "!text-white transition-transform group-hover:translate-x-1"
                  : "!text-[#858B85]"
              }
            />
          )}
        </button>
      )}

      {isFinished && (
        <div className="mt-6 flex items-start gap-3 border border-[#D9DCD6] p-4">
          <CheckCircle2
            size={18}
            className="mt-0.5 shrink-0 text-[#747974]"
          />

          <p className="text-[12px] leading-6 text-[#626A64]">
            {status === "DELIVERED"
              ? "Sipariş teslim edildi. İşlem tamamlandı."
              : "Sipariş iptal edildi. Bu sipariş üzerinde başka bir durum değişikliği yapılamaz."}
          </p>
        </div>
      )}

      {canCancel &&
        !showCancelConfirmation && (
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setError("");
              setSuccess("");
              setShowCancelConfirmation(true);
            }}
            className="mt-4 inline-flex min-h-10 items-center gap-2 text-[11px] font-semibold text-[#A61922] transition-colors hover:text-[#85141B] disabled:opacity-50"
          >
            <XCircle size={16} />
            Siparişi İptal Et
          </button>
        )}

      {showCancelConfirmation && canCancel && (
        <div className="mt-5 border border-[#D9DCD6] p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={19}
              className="mt-0.5 shrink-0 text-[#A61922]"
            />

            <div className="min-w-0">
              <p className="text-[13px] font-bold">
                Siparişi iptal etmek istiyor musunuz?
              </p>

              <p className="mt-2 break-all text-[11px] text-[#747974]">
                {orderNumber}
              </p>

              <p className="mt-3 text-[12px] leading-6 text-[#747974]">
                Sipariş iptal edilecek ve
                sipariş edilen ürünlerin stokları
                geri yüklenecek. Bu işlem panel
                üzerinden geri alınamaz.
              </p>

              {hasPendingCancellation && (
                <p className="mt-3 text-[11px] font-semibold leading-6 text-[#A16A19]">
                  Bekleyen müşteri iptal talebi de
                  otomatik olarak onaylanacaktır.
                </p>
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                updateStatus("CANCELLED")
              }
              className="min-h-11 border border-[#A61922] !bg-[#A61922] px-5 text-[11px] font-bold !text-white transition-colors hover:!bg-[#85141B] disabled:opacity-60"
            >
              {busy
                ? "İşleniyor..."
                : "Evet, Siparişi İptal Et"}
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={() =>
                setShowCancelConfirmation(false)
              }
              className="min-h-11 border border-[#D9DCD6] px-5 text-[11px] font-semibold text-[#191C19] transition-colors hover:border-[#191C19] disabled:opacity-60"
            >
              Vazgeç
            </button>
          </div>
        </div>
      )}

      {paymentStatus === "PAID" &&
        cancellableStatuses.includes(status) && (
          <p className="mt-4 text-[11px] leading-6 text-[#747974]">
            Ödemesi alınmış siparişlerde iptal
            işlemi, ödeme iadesi tamamlanmadan
            yapılamaz.
          </p>
        )}

      {error && (
        <div
          role="alert"
          className="mt-5 border-l-2 border-[#A61922] bg-[#F5E4E5] px-4 py-3 text-[12px] leading-6 text-[#85141B]"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="mt-5 border-l-2 border-[#346B38] bg-[#E5EFE3] px-4 py-3 text-[12px] leading-6 text-[#346B38]"
        >
          {success}
        </div>
      )}
    </section>
  );
}
