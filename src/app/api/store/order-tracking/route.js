import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TRACKING_CODE_PATTERN = /^VTX-[A-F0-9]{48}$/;

function jsonResponse(body, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, private",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body.trackingCode !== "string") {
      return jsonResponse(
        {
          success: false,
          error: "Geçerli bir sipariş takip kodu girin.",
        },
        400,
      );
    }

    const trackingCode = body.trackingCode.trim().toUpperCase();

    if (!TRACKING_CODE_PATTERN.test(trackingCode)) {
      return jsonResponse(
        {
          success: false,
          error: "Sipariş bulunamadı. Takip kodunuzu kontrol edin.",
        },
        404,
      );
    }

    const order = await prisma.order.findUnique({
      where: {
        trackingCode,
      },
      select: {
        orderNumber: true,
        status: true,
        paymentMethod: true,
        paymentStatus: true,
        shippingCompany: true,
        trackingNumber: true,
        trackingUrl: true,
        shippedAt: true,
        deliveredAt: true,
        createdAt: true,
        items: {
          select: {
            productName: true,
            productImage: true,
            quantity: true,
          },
        },
      },
    });

    if (!order) {
      return jsonResponse(
        {
          success: false,
          error: "Sipariş bulunamadı. Takip kodunuzu kontrol edin.",
        },
        404,
      );
    }

    return jsonResponse({
      success: true,
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        shippingCompany: order.shippingCompany,
        trackingNumber: order.trackingNumber,
        trackingUrl: order.trackingUrl,
        shippedAt: order.shippedAt,
        deliveredAt: order.deliveredAt,
        createdAt: order.createdAt,
        items: order.items,
      },
    });
  } catch (error) {
    console.error("VICIX sipariş takip hatası:", error);

    return jsonResponse(
      {
        success: false,
        error: "Sipariş sorgulanırken bir hata oluştu. Lütfen tekrar deneyin.",
      },
      500,
    );
  }
}
