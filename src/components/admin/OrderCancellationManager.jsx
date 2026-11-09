
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  ShieldCheck,
  XCircle,
} from "lucide-react";

const statusLabels = {
  PENDING: "Değerlendirme Bekliyor",
  APPROVED: "Onaylandı",
  REJECTED: "Reddedildi",
};

const statusColors = {
  PENDING: "text-[#A16A19]",
  APPROVED: "text-[#346B38]",
  REJECTED: "text-[#A61922]",
};

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  }).format(date);
}

export default function OrderCancellationManager({
  orderId,
  orderStatus,
  paymentStatus,
  cancellationRequest,
}) {
  const router = useRouter();

  const [adminNote, setAdminNote] = useState("");
  const [decision, setDecision] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!cancellationRequest) {
    return null;
  }

  const isPending =
    cancellationRequest.status === "PENDING";

  const canApprove =
    isPending &&
    ["PENDING", "CONFIRMED", "PREPARING"].includes(
      orderStatus,
    ) &&
    paymentStatus === "PENDING";

  const canReject = isPending;

  const isInvalidForApproval =
    isPending && !canApprove;

  async function handleDecision(selectedDecision) {
    if (loading || !isPending) return;

    if (
      selectedDecision === "APPROVED" &&
      !canApprove
    ) {
      return;
    }

    if (
      selectedDecision === "REJECTED" &&
      !canReject
    ) {
      return;
    }

    const cleanedNote = adminNote.trim();

    if (cleanedNote.length > 1000) {
      setError(
        "Yönetici açıklaması en fazla 1000 karakter olabilir.",
      );
      return;
    }

    if (
      selectedDecision === "REJECTED" &&
      cleanedNote.length < 10
    ) {
      setError(
        "Ret gerekçesi en az 10 karakter olmalıdır.",
      );
      return;
    }

    setError("");
    setSuccess("");
    setDecision(selectedDecision);
    setLoading(true);

    try {
      const response = await fetch(
        `/api/admin/orders/${encodeURIComponent(orderId)}/cancellation`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            decision: selectedDecision,
            adminNote: cleanedNote,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "İptal talebi değerlendirilemedi.",
        );
      }

      setSuccess(data.message);
      router.refresh();
    } catch (err) {
      setError(
        err.message ||
          "Bir hata oluştu. Lütfen tekrar deneyin.",
      );
    } finally {
      setLoading(false);
      setDecision(null);
    }
  }

  const StatusIcon =
    cancellationRequest.status === "APPROVED"
      ? CheckCircle2
      : cancellationRequest.status === "REJECTED"
        ? XCircle
        : Clock3;

  return (
    <section className="min-w-0 border-t border-[#D8DBD7] pt-8">
      <div className="flex items-start gap-3">
        <StatusIcon
          size={21}
          strokeWidth={1.5}
          className={`shrink-0 ${
            statusColors[cancellationRequest.status] ??
            "text-[#626A64]"
          }`}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.1em]">
              Müşteri İptal Talebi
            </h2>

            <span
              className={`text-[11px] font-semibold ${
                statusColors[cancellationRequest.status] ??
                "text-[#626A64]"
              }`}
            >
              {statusLabels[cancellationRequest.status] ??
                cancellationRequest.status}
            </span>
          </div>

          <p className="mt-3 text-[11px] text-[#858B85]">
            Talep tarihi:{" "}
            {formatDate(cancellationRequest.createdAt)}
          </p>

          <div className="mt-6 border-l-2 border-[#D8DBD7] pl-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#858B85]">
              Müşterinin İptal Gerekçesi
            </p>

            <p className="mt-3 whitespace-pre-wrap break-words text-[12px] leading-7 text-[#111312]">
              {cancellationRequest.reason}
            </p>
          </div>

          {!isPending && (
            <div className="mt-6">
              {cancellationRequest.adminNote && (
                <div className="border-l-2 border-[#A61922] pl-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#858B85]">
                    Yönetici Açıklaması
                  </p>

                  <p className="mt-3 whitespace-pre-wrap break-words text-[12px] leading-7">
                    {cancellationRequest.adminNote}
                  </p>
                </div>
              )}

              {cancellationRequest.reviewedAt && (
                <p className="mt-5 text-[11px] text-[#858B85]">
                  Değerlendirme tarihi:{" "}
                  {formatDate(
                    cancellationRequest.reviewedAt,
                  )}
                </p>
              )}
            </div>
          )}

          {isPending && (
            <>
              {isInvalidForApproval && (
                <div className="mt-6 flex items-start gap-3 border border-[#E6D8C1] bg-[#F8F1E6] p-4">
                  <AlertCircle
                    size={17}
                    className="mt-0.5 shrink-0 text-[#A16A19]"
                  />

                  <p className="text-[11px] leading-6 text-[#7A5B2C]">
                    Siparişin mevcut durumu veya ödeme
                    durumu nedeniyle iptal onayı
                    verilemiyor. Talebi reddedebilir
                    veya ödeme sürecini ayrıca
                    değerlendirebilirsiniz.
                  </p>
                </div>
              )}

              <div className="mt-7">
                <label
                  htmlFor={`admin-cancellation-note-${orderId}`}
                  className="mb-3 block text-[11px] font-semibold"
                >
                  Yönetici Açıklaması
                </label>

                <textarea
                  id={`admin-cancellation-note-${orderId}`}
                  value={adminNote}
                  onChange={(event) =>
                    setAdminNote(event.target.value)
                  }
                  rows={4}
                  maxLength={1000}
                  disabled={loading}
                  placeholder="Talep hakkında açıklamanızı yazın..."
                  className="w-full resize-y border border-[#D8DBD7] bg-transparent px-4 py-3 text-[12px] leading-6 text-[#111312] outline-none transition-colors placeholder:text-[#858B85] focus:border-[#A61922] disabled:opacity-60"
                />

                <div className="mt-2 flex items-center justify-between gap-3 text-[10px] text-[#858B85]">
                  <span>
                    Ret için en az 10 karakter zorunlu.
                    Onay için açıklama isteğe bağlı.
                  </span>

                  <span className="shrink-0 tabular-nums">
                    {adminNote.length}/1000
                  </span>
                </div>
              </div>

              {error && (
                <p
                  role="alert"
                  className="mt-5 text-[11px] leading-6 text-[#A61922]"
                >
                  {error}
                </p>
              )}

              {success && (
                <p
                  role="status"
                  className="mt-5 text-[11px] leading-6 text-[#346B38]"
                >
                  {success}
                </p>
              )}

              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={loading || !canApprove}
                  onClick={() =>
                    handleDecision("APPROVED")
                  }
                  className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#111312] px-5 text-[11px] font-semibold uppercase tracking-[0.06em] text-white transition-colors hover:bg-[#346B38] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {loading &&
                  decision === "APPROVED" ? (
                    <LoaderCircle
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <ShieldCheck size={16} />
                  )}
                  Talebi Onayla
                </button>

                <button
                  type="button"
                  disabled={loading || !canReject}
                  onClick={() =>
                    handleDecision("REJECTED")
                  }
                  className="inline-flex min-h-11 items-center justify-center gap-2 border border-[#A61922] px-5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#A61922] transition-colors hover:bg-[#A61922] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {loading &&
                  decision === "REJECTED" ? (
                    <LoaderCircle
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <XCircle size={16} />
                  )}
                  Talebi Reddet
                </button>
              </div>

              <p className="mt-5 text-[11px] leading-6 text-[#858B85]">
                Onaylanan taleplerde sipariş iptal
                edilir ve ürün stokları geri yüklenir.
                Reddedilen taleplerde sipariş durumu
                değişmez.
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
