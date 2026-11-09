
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  Send,
  XCircle,
} from "lucide-react";

const cancellationStatusLabels = {
  PENDING: "Değerlendiriliyor",
  APPROVED: "Onaylandı",
  REJECTED: "Reddedildi",
};

function formatDate(value) {
  if (!value) return null;

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  }).format(new Date(value));
}

export default function OrderCancellationRequest({
  orderId,
  orderStatus,
  paymentStatus,
  cancellationRequest = null,
}) {
  const router = useRouter();

  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canRequest =
    ["PENDING", "CONFIRMED", "PREPARING"].includes(
      orderStatus,
    ) &&
    paymentStatus === "PENDING" &&
    !cancellationRequest;

  const hasRequest = Boolean(cancellationRequest);

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading || !canRequest) return;

    setError("");
    setSuccess("");

    const cleanedReason = reason.trim();

    if (
      cleanedReason.length < 10 ||
      cleanedReason.length > 1000
    ) {
      setError(
        "İptal gerekçesi 10 ile 1000 karakter arasında olmalıdır.",
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/store/orders/${encodeURIComponent(orderId)}/cancellation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reason: cleanedReason,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "İptal talebi oluşturulamadı.",
        );
      }

      setSuccess(
        "İptal talebiniz alındı. Yönetici değerlendirmesi bekleniyor.",
      );

      setReason("");
      router.refresh();
    } catch (err) {
      setError(
        err.message ||
          "Bir hata oluştu. Lütfen tekrar deneyin.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (hasRequest) {
    const status = cancellationRequest.status;

    const StatusIcon =
      status === "APPROVED"
        ? CheckCircle2
        : status === "REJECTED"
          ? XCircle
          : Clock3;

    return (
      <section className="border-t border-[#D8DBD7] pt-8">
        <div className="flex items-start gap-3">
          <StatusIcon
            size={20}
            strokeWidth={1.5}
            className={
              status === "APPROVED"
                ? "text-[#346B38]"
                : status === "REJECTED"
                  ? "text-[#A61922]"
                  : "text-[#A16A19]"
            }
          />

          <div className="min-w-0 flex-1">
            <h3 className="text-[13px] font-semibold">
              Sipariş İptal Talebi
            </h3>

            <p className="mt-2 text-[12px] text-[#626A64]">
              Durum:{" "}
              <span className="font-semibold text-[#111312]">
                {cancellationStatusLabels[status] ??
                  status}
              </span>
            </p>

            <p className="mt-2 text-[11px] text-[#858B85]">
              Talep tarihi:{" "}
              {formatDate(cancellationRequest.createdAt)}
            </p>

            <div className="mt-5 border-l-2 border-[#D8DBD7] pl-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#858B85]">
                İptal Gerekçeniz
              </p>

              <p className="mt-2 whitespace-pre-wrap break-words text-[12px] leading-7">
                {cancellationRequest.reason}
              </p>
            </div>

            {cancellationRequest.adminNote && (
              <div className="mt-5 border-l-2 border-[#A61922] pl-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#858B85]">
                  Yönetici Açıklaması
                </p>

                <p className="mt-2 whitespace-pre-wrap break-words text-[12px] leading-7">
                  {cancellationRequest.adminNote}
                </p>
              </div>
            )}

            {cancellationRequest.reviewedAt && (
              <p className="mt-4 text-[11px] text-[#858B85]">
                Değerlendirme:{" "}
                {formatDate(
                  cancellationRequest.reviewedAt,
                )}
              </p>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (!canRequest) {
    return null;
  }

  return (
    <section className="border-t border-[#D8DBD7] pt-8">
      <div className="flex items-start gap-3">
        <AlertCircle
          size={20}
          strokeWidth={1.5}
          className="shrink-0 text-[#A61922]"
        />

        <div className="min-w-0 flex-1">
          <h3 className="text-[13px] font-semibold">
            Sipariş İptal Talebi
          </h3>

          <p className="mt-3 text-[12px] leading-7 text-[#626A64]">
            Siparişinizi iptal etmek istiyorsanız
            gerekçenizi belirterek talep
            oluşturabilirsiniz. Talebiniz yönetici
            tarafından değerlendirilecektir.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-6"
          >
            <label
              htmlFor="cancellation-reason"
              className="mb-3 block text-[11px] font-semibold"
            >
              İptal Gerekçesi
            </label>

            <textarea
              id="cancellation-reason"
              value={reason}
              onChange={(event) =>
                setReason(event.target.value)
              }
              rows={4}
              maxLength={1000}
              placeholder="Siparişinizi neden iptal etmek istediğinizi yazın..."
              disabled={loading}
              className="w-full resize-y border border-[#D8DBD7] bg-transparent px-4 py-3 text-[12px] leading-6 text-[#111312] outline-none transition-colors placeholder:text-[#858B85] focus:border-[#A61922] disabled:opacity-60"
            />

            <div className="mt-2 flex items-center justify-between gap-4">
              <span className="text-[10px] text-[#858B85]">
                En az 10, en fazla 1000 karakter
              </span>

              <span className="text-[10px] tabular-nums text-[#858B85]">
                {reason.length}/1000
              </span>
            </div>

            {error && (
              <p
                role="alert"
                className="mt-4 text-[11px] leading-6 text-[#A61922]"
              >
                {error}
              </p>
            )}

            {success && (
              <p
                role="status"
                className="mt-4 text-[11px] leading-6 text-[#346B38]"
              >
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={
                loading ||
                reason.trim().length < 10
              }
              className="mt-6 inline-flex min-h-11 items-center justify-center gap-3 bg-[#111312] px-6 text-[11px] font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#A61922] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <LoaderCircle
                    size={16}
                    className="animate-spin"
                  />
                  Gönderiliyor
                </>
              ) : (
                <>
                  <Send size={15} />
                  İptal Talebi Gönder
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
