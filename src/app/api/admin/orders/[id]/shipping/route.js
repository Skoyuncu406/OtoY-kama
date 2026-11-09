import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

class ShippingUpdateError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "ShippingUpdateError";
    this.status = status;
  }
}

function errorResponse(message, status) {
  return NextResponse.json({ success: false, message }, { status });
}

function normalizeText(value, maxLength, label) {
  if (typeof value !== "string") {
    throw new ShippingUpdateError(`${label} geçerli bir metin olmalıdır.`);
  }

  const normalized = value.trim();

  if (normalized.length > maxLength) {
    throw new ShippingUpdateError(
      `${label} en fazla ${maxLength} karakter olabilir.`,
    );
  }

  return normalized;
}

function validateTrackingUrl(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    throw new ShippingUpdateError("Takip bağlantısı geçersiz.");
  }

  const normalized = value.trim();

  if (!normalized) return null;

  if (normalized.length > 2000) {
    throw new ShippingUpdateError("Takip bağlantısı çok uzun.");
  }

  let url;

  try {
    url = new URL(normalized);
  } catch {
    throw new ShippingUpdateError("Geçerli bir takip bağlantısı girin.");
  }

  if (
    url.protocol !== "https:" ||
    !url.hostname ||
    url.username ||
    url.password
  ) {
    throw new ShippingUpdateError(
      "Takip bağlantısı güvenli bir HTTPS adresi olmalıdır.",
    );
  }

  return url.toString();
}

export async function PATCH(request, { params }) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "admin") {
      return errorResponse("Yetkisiz işlem.", 403);
    }

    const admin = await prisma.adminUser.findFirst({
      where: {
        id: session.user.id,
        isActive: true,
      },
      select: { id: true },
    });

    if (!admin) {
      return errorResponse("Yönetici hesabı aktif değil.", 403);
    }

    const { id } = await params;

    if (!id || typeof id !== "string") {
      return errorResponse("Geçersiz sipariş.", 400);
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return errorResponse("Geçersiz istek verisi.", 400);
    }

    const shippingCompany = normalizeText(
      body?.shippingCompany,
      100,
      "Kargo firması",
    );

    const trackingNumber = normalizeText(
      body?.trackingNumber,
      150,
      "Takip numarası",
    );

    const trackingUrl = validateTrackingUrl(body?.trackingUrl);

    if (!shippingCompany || !trackingNumber) {
      throw new ShippingUpdateError(
        "Kargo firması ve takip numarası zorunludur.",
      );
    }

    const result = await prisma.$transaction(
      async (tx) => {
        const order = await tx.order.findUnique({
          where: { id },
          select: {
            id: true,
            orderNumber: true,
            status: true,
            shippingCompany: true,
            trackingNumber: true,
            trackingUrl: true,
          },
        });

        if (!order) {
          throw new ShippingUpdateError("Sipariş bulunamadı.", 404);
        }

        if (order.status === "CANCELLED" || order.status === "DELIVERED") {
          throw new ShippingUpdateError(
            "İptal edilmiş veya teslim edilmiş siparişlerin kargo bilgileri değiştirilemez.",
            409,
          );
        }

        const unchanged =
          order.shippingCompany === shippingCompany &&
          order.trackingNumber === trackingNumber &&
          order.trackingUrl === trackingUrl;

        if (unchanged) {
          return {
            id: order.id,
            orderNumber: order.orderNumber,
            shippingCompany,
            trackingNumber,
            trackingUrl,
            unchanged: true,
          };
        }

        const updated = await tx.order.updateMany({
          where: {
            id: order.id,
            status: order.status,
            shippingCompany: order.shippingCompany,
            trackingNumber: order.trackingNumber,
            trackingUrl: order.trackingUrl,
          },
          data: {
            shippingCompany,
            trackingNumber,
            trackingUrl,
          },
        });

        if (updated.count !== 1) {
          throw new ShippingUpdateError(
            "Sipariş bilgileri değişti. Sayfayı yenileyip tekrar deneyin.",
            409,
          );
        }

        return {
          id: order.id,
          orderNumber: order.orderNumber,
          shippingCompany,
          trackingNumber,
          trackingUrl,
          unchanged: false,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 5000,
        timeout: 10000,
      },
    );

    return NextResponse.json({
      success: true,
      message: result.unchanged
        ? "Kargo bilgileri zaten güncel."
        : "Kargo bilgileri başarıyla kaydedildi.",
      order: result,
    });
  } catch (error) {
    if (error instanceof ShippingUpdateError) {
      return errorResponse(error.message, error.status);
    }

    if (error?.code === "P2034") {
      return errorResponse(
        "Eş zamanlı işlem çakışması. Lütfen tekrar deneyin.",
        409,
      );
    }

    console.error("Admin shipping update error:", error);

    return errorResponse(
      "Kargo bilgileri güncellenirken bir hata oluştu.",
      500,
    );
  }
}
