import "server-only";

import prisma from "@/lib/prisma";

function serializeCategory(category) {
  return {
    id: category.id,
    slug: category.slug,
    title: category.name,
    name: category.name,
    image: category.image ?? null,
  };
}

function serializeProduct(product) {
  const images = product.images.map((image) => image.url);

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category.slug,
    categoryId: product.categoryId,
    categoryName: product.category.name,
    price: Number(product.salePrice ?? product.price),
    originalPrice: Number(product.price),
    salePrice: product.salePrice ? Number(product.salePrice) : null,
    stock: product.stock,
    description: product.description ?? "",
    details: product.details ?? "",
    image: images[0] ?? null,
    images,
    isNew: product.isNew,
    isBestSeller: product.isBestSeller,
  };
}

export async function getStoreCategories() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });

  return categories.map(serializeCategory);
}

export async function getStoreProducts() {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      category: {
        isActive: true,
      },
    },
    include: {
      category: true,
      images: {
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return products.map(serializeProduct);
}

export async function getStoreProductById(id) {
  const product = await prisma.product.findFirst({
    where: {
      id,
      isActive: true,
      category: {
        isActive: true,
      },
    },
    include: {
      category: true,
      images: {
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  return product ? serializeProduct(product) : null;
}
