import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NEXT_STATUS = {
  PENDING: "CONFIRMED",
  CONFIRMED: "PREPARING",
  PREPARING: "SHIPPED",
  SHIPPED: "DELIVERED",
};

const CANCELLABLE = new Set(["PENDING", "CONFIRMED", "PREPARING"]);

const VALID_TARGET_STATUSES = new Set([
  "CONFIRMED",
  "PREPARING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
]);

class OrderStatusError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "OrderStatusError";
    this.status = status;
  }
}

function response(message, status) {
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
    // 1. Yönetici oturum kontrolü
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "admin") {
      return response("Yetkisiz işlem.", 403);
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
      return response("Yönetici hesabı aktif değil.", 403);
    }

    // 3. Sipariş ID kontrolü
    const { id } = await params;

    if (!id || typeof id !== "string") {
      return response("Geçersiz sipariş.", 400);
    }

    // 4. İstek verisi
    let body;

    try {
      body = await request.json();
    } catch {
      return response("Geçersiz istek verisi.", 400);
    }

    const targetStatus = body?.status;

    if (!VALID_TARGET_STATUSES.has(targetStatus)) {
      return response("Geçersiz sipariş durumu.", 400);
    }

    // 5. Sipariş ve stok işlemleri
    const result = await prisma.$transaction(
      async (tx) => {
        const order = await tx.order.findUnique({
          where: {
            id,
          },
          select: {
            id: true,
            status: true,
            paymentStatus: true,

            items: {
              select: {
                productId: true,
                quantity: true,
              },
            },

            cancellationRequest: {
              select: {
                id: true,
                status: true,
              },
            },
          },
        });

        if (!order) {
          throw new OrderStatusError("Sipariş bulunamadı.", 404);
        }

        // Aynı duruma tekrar geçiş
        if (order.status === targetStatus) {
          return {
            id: order.id,
            status: order.status,
            unchanged: true,
          };
        }

        // Tamamlanmış siparişlerin korunması
        if (order.status === "CANCELLED" || order.status === "DELIVERED") {
          throw new OrderStatusError(
            "Bu siparişin durumu artık değiştirilemez.",
            409,
          );
        }

        const cancellationRequest = order.cancellationRequest;

        const hasPendingCancellation =
          cancellationRequest?.status === "PENDING";

        // Bekleyen iptal talebi varken sipariş
        // normal süreçte ilerletilemez.
        if (hasPendingCancellation && targetStatus !== "CANCELLED") {
          throw new OrderStatusError(
            "Bu sipariş için bekleyen bir müşteri iptal talebi bulunuyor. Önce iptal talebini değerlendirin.",
            409,
          );
        }

        // 6. Sipariş iptali
        if (targetStatus === "CANCELLED") {
          if (!CANCELLABLE.has(order.status)) {
            throw new OrderStatusError(
              "Kargoya verilmiş siparişler bu panelden iptal edilemez.",
              409,
            );
          }

          if (order.paymentStatus !== "PENDING") {
            throw new OrderStatusError(
              "Ödeme durumu beklemede olmayan siparişler, ödeme veya iade süreci değerlendirilmeden iptal edilemez.",
              409,
            );
          }

          const now = new Date();

          // Durumun eş zamanlı değişmediğini kontrol et.
          const updated = await tx.order.updateMany({
            where: {
              id: order.id,
              status: order.status,
              paymentStatus: "PENDING",
            },
            data: {
              status: "CANCELLED",
              cancelledAt: now,
            },
          });

          if (updated.count !== 1) {
            throw new OrderStatusError(
              "Sipariş veya ödeme durumu değişti. Sayfayı yenileyin.",
              409,
            );
          }

          // Ürün stoklarını geri yükle.
          // İşlem aynı transaction içinde gerçekleşir.
          for (const item of order.items) {
            await tx.product.update({
              where: {
                id: item.productId,
              },
              data: {
                stock: {
                  increment: item.quantity,
                },
              },
            });
          }

          // Bekleyen müşteri iptal talebi varsa
          // aynı transaction içinde onayla.
          if (hasPendingCancellation) {
            const reviewed = await tx.cancellationRequest.updateMany({
              where: {
                id: cancellationRequest.id,
                status: "PENDING",
              },
              data: {
                status: "APPROVED",
                adminNote: "Sipariş yönetici tarafından iptal edildi.",
                reviewedAt: now,
              },
            });

            if (reviewed.count !== 1) {
              throw new OrderStatusError(
                "İptal talebinin durumu değişti. Sayfayı yenileyin.",
                409,
              );
            }
          }

          return {
            id: order.id,
            status: "CANCELLED",
            unchanged: false,
          };
        }

        // 7. Normal sipariş ilerleme süreci
        const expectedStatus = NEXT_STATUS[order.status];

        if (targetStatus !== expectedStatus) {
          throw new OrderStatusError(
            "Sipariş yalnızca bir sonraki aşamaya geçirilebilir.",
            409,
          );
        }

        const now = new Date();

        const data = {
          status: targetStatus,
        };

        if (targetStatus === "SHIPPED") {
          data.shippedAt = now;
        }

        if (targetStatus === "DELIVERED") {
          data.deliveredAt = now;
        }

        const updated = await tx.order.updateMany({
          where: {
            id: order.id,
            status: order.status,
          },
          data,
        });

        if (updated.count !== 1) {
          throw new OrderStatusError(
            "Sipariş durumu değişti. Sayfayı yenileyin.",
            409,
          );
        }

        return {
          id: order.id,
          status: targetStatus,
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
        ? "Sipariş zaten bu durumda."
        : result.status === "CANCELLED"
          ? "Sipariş iptal edildi ve stoklar geri yüklendi."
          : "Sipariş durumu güncellendi.",
      order: result,
    });
  } catch (error) {
    if (error instanceof OrderStatusError) {
      return response(error.message, error.status);
    }

    if (error?.code === "P2034") {
      return response(
        "Eş zamanlı işlem çakışması. Lütfen tekrar deneyin.",
        409,
      );
    }

    console.error("Admin order status error:", error);

    return response("Sipariş güncellenirken bir hata oluştu.", 500);
  }
}
