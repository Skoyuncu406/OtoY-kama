import { NextResponse } from "next/server";
import { randomBytes, randomUUID } from "node:crypto";

import { Prisma } from "@/generated/prisma/client";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_ITEMS = 50;
const MAX_QUANTITY = 99;

class OrderError extends Error {
  constructor(message, status = 400, code = "ORDER_ERROR") {
    super(message);
    this.name = "OrderError";
    this.status = status;
    this.code = code;
  }
}

function jsonError(message, status, code) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code,
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

function cleanText(value, maxLength = 200) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function validateAddress(body) {
  const address = {
    fullName: cleanText(body.fullName, 120),
    email: cleanText(body.email, 254).toLowerCase(),
    phone: cleanText(body.phone, 30),
    city: cleanText(body.city, 100),
    district: cleanText(body.district, 100),
    address: cleanText(body.address, 1000),
    postalCode: cleanText(body.postalCode, 20) || null,
    orderNote: cleanText(body.orderNote, 1000) || null,
  };

  if (
    !address.fullName ||
    !address.email ||
    !address.phone ||
    !address.city ||
    !address.district ||
    !address.address
  ) {
    throw new OrderError(
      "Teslimat bilgilerindeki zorunlu alanları doldurun.",
      400,
      "INVALID_ADDRESS",
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email)) {
    throw new OrderError(
      "Geçerli bir e-posta adresi girin.",
      400,
      "INVALID_EMAIL",
    );
  }

  if (!/^[0-9+()\s-]{10,30}$/.test(address.phone)) {
    throw new OrderError(
      "Geçerli bir telefon numarası girin.",
      400,
      "INVALID_PHONE",
    );
  }

  return address;
}

function validateItems(items) {
  if (!Array.isArray(items) || items.length === 0 || items.length > MAX_ITEMS) {
    throw new OrderError(
      "Sepetinizde geçerli ürün bulunmuyor.",
      400,
      "INVALID_CART",
    );
  }

  const quantities = new Map();

  for (const item of items) {
    const productId = item?.productId ?? item?.id;
    const quantity = item?.quantity;

    if (
      typeof productId !== "string" ||
      !productId.trim() ||
      productId.length > 100 ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > MAX_QUANTITY
    ) {
      throw new OrderError(
        "Sepette geçersiz ürün veya adet bilgisi var.",
        400,
        "INVALID_CART_ITEM",
      );
    }

    const nextQuantity = (quantities.get(productId) ?? 0) + quantity;

    if (nextQuantity > MAX_QUANTITY) {
      throw new OrderError(
        "Bir ürün için en fazla 99 adet sipariş verebilirsiniz.",
        400,
        "QUANTITY_LIMIT",
      );
    }

    quantities.set(productId, nextQuantity);
  }

  return [...quantities.entries()]
    .map(([productId, quantity]) => ({
      productId,
      quantity,
    }))
    .sort((a, b) => a.productId.localeCompare(b.productId));
}

function validateKey(value) {
  if (
    typeof value !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  ) {
    throw new OrderError(
      "Sipariş işlem anahtarı geçersiz.",
      400,
      "INVALID_IDEMPOTENCY_KEY",
    );
  }

  return value.toLowerCase();
}

// Takip kodu tahmin edilmesi zor,
// kriptografik olarak rastgele üretilir.
function generateTrackingCode() {
  return `VTX-${randomBytes(24).toString("hex").toUpperCase()}`;
}

function generateOrderNumber() {
  return `VICIX-${randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase()}`;
}

// Giriş yapmış aktif müşteri varsa döndür.
// Misafir müşteriler için null döner.
async function getCustomer() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "customer") {
    return null;
  }

  return prisma.customer.findFirst({
    where: {
      id: session.user.id,
      isActive: true,
    },
    select: {
      id: true,
    },
  });
}

const orderSelect = {
  id: true,
  orderNumber: true,
  trackingCode: true,
  customerId: true,
  idempotencyKey: true,
  fullName: true,
  email: true,
  phone: true,
  city: true,
  district: true,
  address: true,
  postalCode: true,
  orderNote: true,
  status: true,
  paymentMethod: true,
  paymentStatus: true,
  subtotal: true,
  shippingFee: true,
  paymentFee: true,
  total: true,
  createdAt: true,
  items: {
    select: {
      productId: true,
      quantity: true,
    },
  },
};

function matchesExistingOrder(
  order,
  customerId,
  address,
  cartItems,
  paymentMethod,
) {
  if (
    order.customerId !== customerId ||
    order.paymentMethod !== paymentMethod
  ) {
    return false;
  }

  for (const field of Object.keys(address)) {
    if (order[field] !== address[field]) {
      return false;
    }
  }

  if (order.items.length !== cartItems.length) {
    return false;
  }

  const savedItems = new Map(
    order.items.map((item) => [item.productId, item.quantity]),
  );

  return cartItems.every(
    (item) => savedItems.get(item.productId) === item.quantity,
  );
}

function orderResponse(order, reused = false) {
  return NextResponse.json(
    {
      success: true,
      reused,
      message: reused
        ? "Daha önce oluşturulan siparişiniz bulundu."
        : "Siparişiniz başarıyla oluşturuldu.",
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        trackingCode: order.trackingCode,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        subtotal: Number(order.subtotal),
        shippingFee: Number(order.shippingFee),
        paymentFee: Number(order.paymentFee),
        total: Number(order.total),
        createdAt: order.createdAt,
      },
    },
    {
      status: reused ? 200 : 201,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

async function findExistingOrder(
  key,
  customerId,
  address,
  cartItems,
  paymentMethod,
) {
  const existing = await prisma.order.findUnique({
    where: {
      idempotencyKey: key,
    },
    select: orderSelect,
  });

  if (!existing) {
    return null;
  }

  if (
    !matchesExistingOrder(
      existing,
      customerId,
      address,
      cartItems,
      paymentMethod,
    )
  ) {
    throw new OrderError(
      "Bu işlem anahtarı farklı bir sipariş için kullanılmış. Lütfen ödeme sayfasından yeni bir işlem başlatın.",
      409,
      "IDEMPOTENCY_CONFLICT",
    );
  }

  return existing;
}

export async function POST(request) {
  try {
    // Üye veya misafir müşteri.
    const customer = await getCustomer();
    const customerId = customer?.id ?? null;

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return jsonError("Geçersiz sipariş bilgisi.", 400, "INVALID_REQUEST");
    }

    // Ödeme yöntemi.
    const paymentMethod = body.paymentMethod;

    if (
      paymentMethod !== "CASH_ON_DELIVERY" &&
      paymentMethod !== "ONLINE_PAYMENT"
    ) {
      return jsonError(
        "Geçerli bir ödeme yöntemi seçin.",
        400,
        "INVALID_PAYMENT_METHOD",
      );
    }

    // Online ödeme henüz aktif değil.
    if (paymentMethod === "ONLINE_PAYMENT") {
      return jsonError(
        "Online ödeme henüz aktif değil. Kapıda ödeme seçebilirsiniz.",
        503,
        "ONLINE_PAYMENT_NOT_AVAILABLE",
      );
    }

    const idempotencyKey = validateKey(body.idempotencyKey);

    const address = validateAddress(body);
    const cartItems = validateItems(body.items);

    // Aynı işlem anahtarıyla oluşturulmuş
    // sipariş varsa stok tekrar düşürülmez.
    const existing = await findExistingOrder(
      idempotencyKey,
      customerId,
      address,
      cartItems,
      paymentMethod,
    );

    if (existing) {
      return orderResponse(existing, true);
    }

    // Atomik sipariş oluşturma işlemi.
    const order = await prisma.$transaction(
      async (tx) => {
        const productIds = cartItems.map((item) => item.productId);

        const products = await tx.product.findMany({
          where: {
            id: {
              in: productIds,
            },
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            price: true,
            salePrice: true,
            images: {
              orderBy: {
                order: "asc",
              },
              take: 1,
              select: {
                url: true,
              },
            },
          },
        });

        const productMap = new Map(
          products.map((product) => [product.id, product]),
        );

        let subtotal = new Prisma.Decimal(0);
        const orderItems = [];

        for (const item of cartItems) {
          const product = productMap.get(item.productId);

          if (!product) {
            throw new OrderError(
              "Sepetinizde satışta olmayan bir ürün var.",
              400,
              "PRODUCT_NOT_AVAILABLE",
            );
          }

          const regularPrice = new Prisma.Decimal(product.price);

          const salePrice =
            product.salePrice != null
              ? new Prisma.Decimal(product.salePrice)
              : null;

          const unitPrice =
            salePrice !== null && salePrice.lessThan(regularPrice)
              ? salePrice
              : regularPrice;

          if (unitPrice.lessThan(0)) {
            throw new OrderError(
              "Ürün fiyatı geçersiz.",
              400,
              "INVALID_PRODUCT_PRICE",
            );
          }

          // Atomik stok düşürme.
          const stockUpdate = await tx.product.updateMany({
            where: {
              id: product.id,
              isActive: true,
              stock: {
                gte: item.quantity,
              },
            },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });

          if (stockUpdate.count !== 1) {
            throw new OrderError(
              `${product.name} için yeterli stok bulunmuyor.`,
              409,
              "INSUFFICIENT_STOCK",
            );
          }

          const lineTotal = unitPrice.mul(item.quantity);

          subtotal = subtotal.add(lineTotal);

          orderItems.push({
            productId: product.id,
            productName: product.name,
            productImage: product.images[0]?.url ?? null,
            unitPrice,
            quantity: item.quantity,
            totalPrice: lineTotal,
          });
        }

        // Mevcut ücretlendirme korunuyor.
        const shippingFee = new Prisma.Decimal(0);
        const paymentFee = new Prisma.Decimal(0);

        const total = subtotal.add(shippingFee).add(paymentFee);

        const orderNumber = generateOrderNumber();
        const trackingCode = generateTrackingCode();

        // Misafir siparişinde customerId null.
        return tx.order.create({
          data: {
            orderNumber,
            trackingCode,
            idempotencyKey,
            customerId,
            ...address,
            subtotal,
            shippingFee,
            paymentFee,
            total,
            status: "PENDING",
            paymentMethod: "CASH_ON_DELIVERY",
            paymentStatus: "PENDING",
            items: {
              create: orderItems,
            },
          },
          select: orderSelect,
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 5000,
        timeout: 15000,
      },
    );

    return orderResponse(order);
  } catch (error) {
    if (error instanceof OrderError) {
      return jsonError(error.message, error.status, error.code);
    }

    // Aynı işlem anahtarı veya benzersiz
    // kod çakışmasında tekrar kayıt yapılmaz.
    if (error?.code === "P2002") {
      return jsonError(
        "Bu sipariş işlemi zaten işleniyor veya oluşturuldu. Sipariş durumunuzu kontrol ederek tekrar deneyin.",
        409,
        "DUPLICATE_ORDER_REQUEST",
      );
    }

    // Eş zamanlı transaction çakışması.
    if (error?.code === "P2034") {
      return jsonError(
        "Sipariş sırasında yoğunluk oluştu. Lütfen tekrar deneyin.",
        409,
        "TRANSACTION_CONFLICT",
      );
    }

    console.error("VICIX sipariş oluşturma hatası:", error);

    return jsonError(
      "Sipariş oluşturulamadı. Lütfen tekrar deneyin.",
      500,
      "ORDER_CREATE_FAILED",
    );
  }
}
