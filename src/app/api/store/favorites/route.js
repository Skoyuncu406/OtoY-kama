import { NextResponse } from "next/server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

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

function unauthorized() {
  return NextResponse.json(
    {
      error: "Bu işlem için üye girişi yapılması gerekmektedir.",
      code: "LOGIN_REQUIRED",
    },
    { status: 401 },
  );
}

// FAVORİLERİ LİSTELE
export async function GET() {
  try {
    const customer = await getCustomer();

    if (!customer) {
      return unauthorized();
    }

    const favorites = await prisma.favorite.findMany({
      where: {
        customerId: customer.id,
        product: {
          isActive: true,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        productId: true,
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            price: true,
            salePrice: true,
            stock: true,
            isNew: true,
            isBestSeller: true,
            category: {
              select: {
                name: true,
                slug: true,
              },
            },
            images: {
              orderBy: {
                order: "asc",
              },
              select: {
                url: true,
              },
            },
          },
        },
      },
    });

    const products = favorites.map(({ product }) => {
      const price = Number(product.price);
      const salePrice =
        product.salePrice != null ? Number(product.salePrice) : null;

      const hasDiscount = salePrice != null && salePrice < price;

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: hasDiscount ? salePrice : price,
        originalPrice: hasDiscount ? price : null,
        salePrice: hasDiscount ? salePrice : null,
        stock: product.stock,
        isNew: product.isNew,
        isBestSeller: product.isBestSeller,
        category: product.category.slug,
        categoryName: product.category.name,
        image: product.images[0]?.url || null,
        images: product.images.map((image) => image.url),
      };
    });

    return NextResponse.json(
      {
        productIds: favorites.map((item) => item.productId),
        products,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("VICIX favorileri okuma hatası:", error);

    return NextResponse.json(
      { error: "Favoriler yüklenemedi." },
      { status: 500 },
    );
  }
}

// FAVORİLERE EKLE
export async function POST(request) {
  try {
    const customer = await getCustomer();

    if (!customer) {
      return unauthorized();
    }

    const body = await request.json().catch(() => null);
    const productId = body?.productId;

    if (
      typeof productId !== "string" ||
      !productId.trim() ||
      productId.length > 100
    ) {
      return NextResponse.json(
        { error: "Geçersiz ürün bilgisi." },
        { status: 400 },
      );
    }

    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Ürün bulunamadı." }, { status: 404 });
    }

    await prisma.favorite.upsert({
      where: {
        customerId_productId: {
          customerId: customer.id,
          productId: product.id,
        },
      },
      update: {},
      create: {
        customerId: customer.id,
        productId: product.id,
      },
    });

    return NextResponse.json({
      success: true,
      isFavorite: true,
    });
  } catch (error) {
    console.error("VICIX favori ekleme hatası:", error);

    return NextResponse.json(
      { error: "Ürün favorilere eklenemedi." },
      { status: 500 },
    );
  }
}

// FAVORİLERDEN ÇIKAR
export async function DELETE(request) {
  try {
    const customer = await getCustomer();

    if (!customer) {
      return unauthorized();
    }

    const body = await request.json().catch(() => null);
    const productId = body?.productId;

    if (
      typeof productId !== "string" ||
      !productId.trim() ||
      productId.length > 100
    ) {
      return NextResponse.json(
        { error: "Geçersiz ürün bilgisi." },
        { status: 400 },
      );
    }

    await prisma.favorite.deleteMany({
      where: {
        customerId: customer.id,
        productId,
      },
    });

    return NextResponse.json({
      success: true,
      isFavorite: false,
    });
  } catch (error) {
    console.error("VICIX favori silme hatası:", error);

    return NextResponse.json(
      { error: "Ürün favorilerden çıkarılamadı." },
      { status: 500 },
    );
  }
}
