import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CANCELLABLE_STATUSES = new Set(["PENDING", "CONFIRMED", "PREPARING"]);

class CancellationReviewError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "CancellationReviewError";
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
    // 1. Yönetici oturum kontrolü
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

    const decision = body?.decision;
    const rawAdminNote = body?.adminNote;

    if (decision !== "APPROVED" && decision !== "REJECTED") {
      return errorResponse("Geçersiz değerlendirme kararı.", 400);
    }

    if (rawAdminNote !== undefined && typeof rawAdminNote !== "string") {
      return errorResponse("Yönetici açıklaması geçersiz.", 400);
    }

    const adminNote =
      typeof rawAdminNote === "string" ? rawAdminNote.trim() : "";

    if (adminNote.length > 1000) {
      return errorResponse(
        "Yönetici açıklaması en fazla 1000 karakter olabilir.",
        400,
      );
    }

    // Ret kararında açıklama zorunlu
    if (decision === "REJECTED" && adminNote.length < 10) {
      return errorResponse("Ret gerekçesi en az 10 karakter olmalıdır.", 400);
    }

    // 5. Atomik değerlendirme işlemi
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
          throw new CancellationReviewError("Sipariş bulunamadı.", 404);
        }

        const cancellationRequest = order.cancellationRequest;

        if (!cancellationRequest) {
          throw new CancellationReviewError(
            "Bu sipariş için iptal talebi bulunamadı.",
            404,
          );
        }

        if (cancellationRequest.status !== "PENDING") {
          throw new CancellationReviewError(
            "Bu iptal talebi daha önce değerlendirilmiş.",
            409,
          );
        }

        if (decision === "APPROVED") {
          // İptal edilebilen sipariş aşamaları
          if (!CANCELLABLE_STATUSES.has(order.status)) {
            throw new CancellationReviewError(
              "Siparişin mevcut durumu iptal için uygun değil.",
              409,
            );
          }

          // Ödeme veya iade süreci gerektiren
          // siparişler otomatik iptal edilemez.
          if (order.paymentStatus !== "PENDING") {
            throw new CancellationReviewError(
              "Ödeme durumu beklemede olmayan siparişler için iptal onayı verilemez.",
              409,
            );
          }

          const now = new Date();

          // Sipariş yalnızca bir kez iptal edilir.
          const updatedOrder = await tx.order.updateMany({
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

          if (updatedOrder.count !== 1) {
            throw new CancellationReviewError(
              "Sipariş veya ödeme durumu değişti. Sayfayı yenileyin.",
              409,
            );
          }

          // Stok iadesi aynı transaction içinde.
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

          // İptal talebini onayla.
          const reviewed = await tx.cancellationRequest.updateMany({
            where: {
              id: cancellationRequest.id,
              status: "PENDING",
            },
            data: {
              status: "APPROVED",
              adminNote: adminNote || "Sipariş iptal talebiniz onaylandı.",
              reviewedAt: now,
            },
          });

          if (reviewed.count !== 1) {
            throw new CancellationReviewError(
              "İptal talebi başka bir işlemde güncellendi.",
              409,
            );
          }

          return {
            orderId: order.id,
            orderNumber: order.orderNumber,
            orderStatus: "CANCELLED",
            cancellationStatus: "APPROVED",
          };
        }

        // 6. Talebi reddet
        const reviewed = await tx.cancellationRequest.updateMany({
          where: {
            id: cancellationRequest.id,
            status: "PENDING",
          },
          data: {
            status: "REJECTED",
            adminNote,
            reviewedAt: new Date(),
          },
        });

        if (reviewed.count !== 1) {
          throw new CancellationReviewError(
            "İptal talebi başka bir işlemde güncellendi.",
            409,
          );
        }

        return {
          orderId: order.id,
          orderNumber: order.orderNumber,
          orderStatus: order.status,
          cancellationStatus: "REJECTED",
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
      message:
        result.cancellationStatus === "APPROVED"
          ? "İptal talebi onaylandı. Sipariş iptal edildi ve stoklar geri yüklendi."
          : "İptal talebi reddedildi. Sipariş mevcut durumunda kaldı.",
      result,
    });
  } catch (error) {
    if (error instanceof CancellationReviewError) {
      return errorResponse(error.message, error.status);
    }

    if (error?.code === "P2034") {
      return errorResponse(
        "Eş zamanlı işlem çakışması. Lütfen tekrar deneyin.",
        409,
      );
    }

    console.error("Admin cancellation review error:", error);

    return errorResponse(
      "İptal talebi değerlendirilirken bir hata oluştu.",
      500,
    );
  }
}
