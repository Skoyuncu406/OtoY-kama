import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

class PaymentUpdateError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "PaymentUpdateError";
    this.status = status;
  }
}

function errorResponse(message, status) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status },
  );
}

export async function PATCH(request, { params }) {
  try {
    // 1. Yönetici oturumu
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "admin") {
      return errorResponse("Yetkisiz işlem.", 403);
    }

    // 2. Aktif yönetici kontrolü
    const admin = await prisma.adminUser.findFirst({
      where: {
        id: session.user.id,
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    if (!admin) {
      return errorResponse("Yönetici hesabı aktif değil.", 403);
    }

    // 3. Sipariş ID
    const { id } = await params;

    if (!id || typeof id !== "string") {
      return errorResponse("Geçersiz sipariş.", 400);
    }

    // 4. İstek verisi
    let body;

    try {
      body = await request.json();
    } catch {
      return errorResponse("Geçersiz istek verisi.", 400);
    }

    const targetStatus = body?.paymentStatus;

    // Bu endpoint yalnızca ödeme onaylar.
    if (targetStatus !== "PAID") {
      return errorResponse("Bu işlem için geçersiz ödeme durumu.", 400);
    }

    // 5. Atomik ödeme güncellemesi
    const result = await prisma.$transaction(
      async (tx) => {
        const order = await tx.order.findUnique({
          where: {
            id,
          },
          select: {
            id: true,
            orderNumber: true,
            status: true,
            paymentMethod: true,
            paymentStatus: true,
            paidAt: true,

            // Müşteri iptal talebini kontrol et.
            cancellationRequest: {
              select: {
                id: true,
                status: true,
              },
            },
          },
        });

        if (!order) {
          throw new PaymentUpdateError("Sipariş bulunamadı.", 404);
        }

        // Yalnızca kapıda ödeme.
        if (order.paymentMethod !== "CASH_ON_DELIVERY") {
          throw new PaymentUpdateError(
            "Online ödemeler bu panel üzerinden manuel olarak onaylanamaz.",
            409,
          );
        }

        // İptal edilmiş siparişler.
        if (order.status === "CANCELLED") {
          throw new PaymentUpdateError(
            "İptal edilmiş sipariş için ödeme onaylanamaz.",
            409,
          );
        }

        // Zaten ödenmiş.
        if (order.paymentStatus === "PAID") {
          return {
            id: order.id,
            orderNumber: order.orderNumber,
            paymentStatus: "PAID",
            paidAt: order.paidAt,
            unchanged: true,
          };
        }

        // Yalnızca PENDING -> PAID.
        if (order.paymentStatus !== "PENDING") {
          throw new PaymentUpdateError(
            "Bu ödeme durumu manuel olarak onaylanamaz.",
            409,
          );
        }

        // Bekleyen müşteri iptal talebi.
        if (order.cancellationRequest?.status === "PENDING") {
          throw new PaymentUpdateError(
            "Bu sipariş için bekleyen bir müşteri iptal talebi bulunuyor. Ödemeyi onaylamadan önce iptal talebini değerlendirin.",
            409,
          );
        }

        const now = new Date();

        // Sipariş durumunu ve ödeme durumunu
        // koşullu olarak güncelle.
        const updated = await tx.order.updateMany({
          where: {
            id: order.id,
            paymentMethod: "CASH_ON_DELIVERY",
            paymentStatus: "PENDING",
            status: {
              not: "CANCELLED",
            },

            // Eş zamanlı işlemlerde bekleyen
            // iptal talebini de kontrol et.
            cancellationRequest: {
              isNot: {
                status: "PENDING",
              },
            },
          },
          data: {
            paymentStatus: "PAID",
            paidAt: now,
          },
        });

        if (updated.count !== 1) {
          throw new PaymentUpdateError(
            "Sipariş, ödeme veya iptal talebi durumu değişti. Sayfayı yenileyin.",
            409,
          );
        }

        return {
          id: order.id,
          orderNumber: order.orderNumber,
          paymentStatus: "PAID",
          paidAt: now,
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
        ? "Bu siparişin ödemesi zaten onaylanmış."
        : "Kapıda ödeme başarıyla tahsil edildi olarak işaretlendi.",
      order: result,
    });
  } catch (error) {
    if (error instanceof PaymentUpdateError) {
      return errorResponse(error.message, error.status);
    }

    if (error?.code === "P2034") {
      return errorResponse(
        "Eş zamanlı işlem çakışması. Lütfen tekrar deneyin.",
        409,
      );
    }

    console.error("Admin payment status update error:", error);

    return errorResponse("Ödeme durumu güncellenirken bir hata oluştu.", 500);
  }
}
