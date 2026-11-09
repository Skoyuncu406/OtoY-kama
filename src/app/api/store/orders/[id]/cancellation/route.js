import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CANCELLABLE_STATUSES = new Set(["PENDING", "CONFIRMED", "PREPARING"]);

class CancellationError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "CancellationError";
    this.status = status;
  }
}

function errorResponse(message, status) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function POST(request, { params }) {
  try {
    // Müşteri oturumu
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "customer") {
      return errorResponse("Bu işlem için müşteri girişi yapmalısınız.", 401);
    }

    // Aktif müşteri kontrolü
    const customer = await prisma.customer.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        isActive: true,
      },
    });

    if (!customer?.isActive) {
      return errorResponse("Müşteri hesabı aktif değil.", 403);
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

    if (!body || typeof body.reason !== "string") {
      return errorResponse("İptal gerekçesi zorunludur.", 400);
    }

    const reason = body.reason.trim();

    if (reason.length < 10) {
      return errorResponse("İptal gerekçesi en az 10 karakter olmalıdır.", 400);
    }

    if (reason.length > 1000) {
      return errorResponse(
        "İptal gerekçesi en fazla 1000 karakter olabilir.",
        400,
      );
    }

    const result = await prisma.$transaction(
      async (tx) => {
        // Sipariş yalnızca oturumdaki müşteriye
        // aitse bulunabilir.
        const order = await tx.order.findFirst({
          where: {
            id,
            customerId: customer.id,
          },
          select: {
            id: true,
            orderNumber: true,
            status: true,
            paymentStatus: true,
            cancellationRequest: {
              select: {
                id: true,
              },
            },
          },
        });

        if (!order) {
          throw new CancellationError("Sipariş bulunamadı.", 404);
        }

        if (order.cancellationRequest) {
          throw new CancellationError(
            "Bu sipariş için daha önce iptal talebi oluşturulmuş.",
            409,
          );
        }

        if (!CANCELLABLE_STATUSES.has(order.status)) {
          throw new CancellationError(
            "Bu sipariş için artık iptal talebi oluşturulamaz.",
            409,
          );
        }

        if (order.paymentStatus !== "PENDING") {
          throw new CancellationError(
            "Ödemesi alınmış veya ödeme işlemi tamamlanmış siparişler için bu bölümden iptal talebi oluşturulamaz.",
            409,
          );
        }

        const cancellationRequest = await tx.cancellationRequest.create({
          data: {
            orderId: order.id,
            reason,
            status: "PENDING",
          },
          select: {
            id: true,
            orderId: true,
            status: true,
            reason: true,
            createdAt: true,
          },
        });

        return {
          orderNumber: order.orderNumber,
          cancellationRequest,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 5000,
        timeout: 10000,
      },
    );

    return NextResponse.json(
      {
        success: true,
        message:
          "Sipariş iptal talebiniz alındı. Talebiniz yönetici tarafından değerlendirilecektir.",
        orderNumber: result.orderNumber,
        cancellationRequest: {
          ...result.cancellationRequest,
          createdAt: result.cancellationRequest.createdAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof CancellationError) {
      return errorResponse(error.message, error.status);
    }

    // Aynı sipariş için eş zamanlı talepler
    if (error?.code === "P2002") {
      return errorResponse(
        "Bu sipariş için zaten bir iptal talebi bulunuyor.",
        409,
      );
    }

    if (error?.code === "P2034") {
      return errorResponse(
        "Eş zamanlı işlem çakışması. Lütfen tekrar deneyin.",
        409,
      );
    }

    console.error("Customer cancellation request error:", error);

    return errorResponse("İptal talebi oluşturulurken bir hata oluştu.", 500);
  }
}
