
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  CreditCard,
  AlertTriangle,
  Loader2,
  XCircle,
  Clock3,
} from "lucide-react";

const paymentStatusLabels = {
  PENDING: "Ödeme Bekleniyor",
  PAID: "Ödeme Alındı",
  FAILED: "Ödeme Başarısız",
  REFUNDED: "İade Edildi",
};

const paymentStatusStyles = {
  PENDING: "bg-[#F4E9D4] text-[#A16A19]",
  PAID: "bg-[#E5EFE3] text-[#346B38]",
  FAILED: "bg-[#F5E4E5] text-[#A61922]",
  REFUNDED: "bg-[#E8E9E6] text-[#626A64]",
};

const paymentMethodLabels = {
  CASH_ON_DELIVERY: "Kapıda Ödeme",
  ONLINE_PAYMENT: "Online Ödeme",
};

const dateFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Istanbul",
});

export default function OrderPaymentManager({
  orderId,
  orderNumber,
  orderStatus,
  paymentMethod,
  initialPaymentStatus,
  initialPaidAt,
  cancellationRequestStatus = null,
}) {
  const router = useRouter();

  const [paymentStatus, setPaymentStatus] = useState(
    initialPaymentStatus,
  );
  const [paidAt, setPaidAt] = useState(initialPaidAt);
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setPaymentStatus(initialPaymentStatus);
    setPaidAt(initialPaidAt);
  }, [initialPaymentStatus, initialPaidAt]);

  const hasPendingCancellation =
    cancellationRequestStatus === "PENDING";

  const canConfirm =
    paymentMethod === "CASH_ON_DELIVERY" &&
    paymentStatus === "PENDING" &&
    orderStatus !== "CANCELLED" &&
    !hasPendingCancellation;

  useEffect(() => {
    if (!canConfirm) {
      setConfirming(false);
    }
  }, [canConfirm]);

  async function confirmPayment() {
    if (!canConfirm || loading) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/orders/${encodeURIComponent(orderId)}/payment`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentStatus: "PAID",
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Ödeme durumu güncellenemedi.",
        );
      }

      setPaymentStatus(data.order.paymentStatus);
      setPaidAt(data.order.paidAt);
      setConfirming(false);
      setMessage(data.message || "Ödeme onaylandı.");

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

  return (
    <section className="border-t border-[#D9DCD6] pt-7">
      <div className="flex items-center gap-3">
        <CreditCard
          size={20}
          strokeWidth={1.5}
          className="text-[#A61922]"
        />

        <h2 className="text-lg font-semibold tracking-tight">
          Ödeme Yönetimi
        </h2>
      </div>

      <p className="mt-3 text-[12px] leading-6 text-[#747974]">
        Siparişin ödeme bilgilerini kontrol edin ve
        tahsil edilen kapıda ödemeleri onaylayın.
      </p>

      <div className="mt-6 divide-y divide-[#D9DCD6] border-y border-[#D9DCD6]">
        <div className="flex flex-wrap items-center justify-between gap-3 py-4">
          <span className="text-[11px] text-[#858B85]">
            Ödeme Yöntemi
          </span>

          <span className="text-[12px] font-semibold">
            {paymentMethodLabels[paymentMethod] ??
              paymentMethod}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 py-4">
          <span className="text-[11px] text-[#858B85]">
            Ödeme Durumu
          </span>

          <span
            className={`inline-flex px-3 py-1.5 text-[10px] font-bold ${
              paymentStatusStyles[paymentStatus] ?? ""
            }`}
          >
            {paymentStatusLabels[paymentStatus] ??
              paymentStatus}
          </span>
        </div>

        {paidAt && (
          <div className="flex flex-wrap items-center justify-between gap-3 py-4">
            <span className="text-[11px] text-[#858B85]">
              Tahsilat Tarihi
            </span>

            <span className="text-[12px] font-medium">
              {dateFormatter.format(new Date(paidAt))}
            </span>
          </div>
        )}
      </div>

      {hasPendingCancellation &&
        paymentMethod === "CASH_ON_DELIVERY" &&
        paymentStatus === "PENDING" &&
        orderStatus !== "CANCELLED" && (
          <div className="mt-6 flex items-start gap-3 border border-[#E6D8C1] bg-[#F8F1E6] p-4">
            <Clock3
              size={19}
              strokeWidth={1.5}
              className="mt-0.5 shrink-0 text-[#A16A19]"
            />

            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-[#7A5B2C]">
                Müşteri İptal Talebi Bekliyor
              </p>

              <p className="mt-2 text-[11px] leading-6 text-[#7A5B2C]">
                Bu sipariş için müşteri tarafından
                oluşturulmuş bir iptal talebi bulunuyor.
                Ödeme onaylamadan önce talebi
                değerlendirmeniz gerekiyor.
              </p>
            </div>
          </div>
        )}

      {canConfirm && !confirming && (
        <button
          type="button"
          disabled={loading}
          onClick={() => {
            setError("");
            setMessage("");
            setConfirming(true);
          }}
          className="mt-6 flex min-h-[52px] w-full items-center justify-center gap-3 !bg-[#A61922] px-5 text-[11px] font-bold uppercase tracking-[0.08em] !text-white transition-colors hover:!bg-[#85141B] disabled:opacity-60"
        >
          <CheckCircle2 size={18} />
          Ödeme Tahsil Edildi
        </button>
      )}

      {confirming && canConfirm && (
        <div className="mt-6 border border-[#D9DCD6] p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={20}
              strokeWidth={1.5}
              className="mt-0.5 shrink-0 text-[#A61922]"
            />

            <div className="min-w-0">
              <h3 className="text-[13px] font-semibold">
                Tahsilatı onaylıyor musunuz?
              </h3>

              <p className="mt-2 break-all text-[11px] text-[#858B85]">
                {orderNumber}
              </p>

              <p className="mt-3 text-[12px] leading-6 text-[#626A64]">
                Bu işlem, siparişin kapıda ödeme
                tutarının gerçekten tahsil edildiğini
                kaydeder. Ödeme durumu "Ödeme Alındı"
                olarak değiştirilecektir.
              </p>

              <p className="mt-2 text-[11px] font-semibold text-[#A61922]">
                Tahsilatı doğrulamadan onaylamayın.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={confirmPayment}
              className="inline-flex min-h-11 items-center justify-center gap-2 !bg-[#A61922] px-5 text-[11px] font-bold !text-white transition-colors hover:!bg-[#85141B] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                  İşleniyor...
                </>
              ) : (
                "Evet, Tahsilatı Onayla"
              )}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => setConfirming(false)}
              className="min-h-11 border border-[#D9DCD6] px-5 text-[11px] font-semibold transition-colors hover:border-[#111312] disabled:opacity-60"
            >
              Vazgeç
            </button>
          </div>
        </div>
      )}

      {paymentStatus === "PAID" && (
        <div className="mt-6 flex items-start gap-3">
          <CheckCircle2
            size={19}
            className="mt-0.5 shrink-0 text-[#346B38]"
          />

          <p className="text-[12px] leading-6 text-[#626A64]">
            Bu siparişin ödemesi tahsil edilmiş
            olarak kaydedildi.
          </p>
        </div>
      )}

      {orderStatus === "CANCELLED" &&
        paymentStatus !== "PAID" && (
          <div className="mt-6 flex items-start gap-3">
            <XCircle
              size={19}
              className="mt-0.5 shrink-0 text-[#A61922]"
            />

            <p className="text-[12px] leading-6 text-[#626A64]">
              Sipariş iptal edildiği için ödeme
              onaylanamaz.
            </p>
          </div>
        )}

      {paymentMethod === "ONLINE_PAYMENT" && (
        <p className="mt-6 text-[12px] leading-6 text-[#626A64]">
          Online ödeme durumları, ödeme sağlayıcısı
          entegrasyonu üzerinden yönetilecektir.
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

      {message && (
        <div
          role="status"
          className="mt-5 border-l-2 border-[#346B38] bg-[#E5EFE3] px-4 py-3 text-[12px] leading-6 text-[#346B38]"
        >
          {message}
        </div>
      )}
    </section>
  );
}
