"use server";

import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { uploadProductImage, deleteProductImage } from "@/lib/product-image";

const MAX_IMAGES = 12;

function refreshImages() {
  revalidatePath("/admin/urunler");
  revalidatePath("/admin");
}

function failure(message) {
  return { success: false, error: message };
}

async function getProductImages(productId) {
  return prisma.productImage.findMany({
    where: { productId },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      order: true,
      publicId: true,
    },
  });
}

export async function uploadProductImageAction(formData) {
  await requireAdmin();

  const productId = String(formData.get("productId") ?? "");
  const file = formData.get("image");

  if (!productId) return failure("Ürün kimliği eksik.");

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });

  if (!product) return failure("Ürün bulunamadı.");

  const images = await getProductImages(productId);

  if (images.length >= MAX_IMAGES) {
    return failure("Bir ürüne en fazla 12 görsel eklenebilir.");
  }

  let uploaded = null;

  try {
    uploaded = await uploadProductImage(file);

    const nextOrder =
      images.length > 0
        ? Math.max(...images.map((image) => image.order)) + 1
        : 0;

    await prisma.productImage.create({
      data: {
        productId,
        url: uploaded.url,
        publicId: uploaded.publicId,
        order: nextOrder,
      },
    });

    refreshImages();

    return { success: true, error: null };
  } catch (error) {
    if (uploaded?.publicId) {
      try {
        await deleteProductImage(uploaded.publicId);
      } catch (cleanupError) {
        console.error("Görsel temizleme hatası:", cleanupError);
      }
    }

    console.error("Ürün görseli yükleme hatası:", error);

    const knownErrors = [
      "Geçerli bir görsel seçin.",
      "Yalnızca JPG, PNG ve WebP yüklenebilir.",
      "Görsel en fazla 5 MB olabilir.",
    ];

    return failure(
      knownErrors.includes(error?.message)
        ? error.message
        : "Görsel yüklenemedi. Tekrar deneyin.",
    );
  }
}

export async function deleteProductImageAction(formData) {
  await requireAdmin();

  const imageId = String(formData.get("imageId") ?? "");
  const productId = String(formData.get("productId") ?? "");

  const image = await prisma.productImage.findFirst({
    where: { id: imageId, productId },
  });

  if (!image) return failure("Görsel bulunamadı.");

  await prisma.productImage.delete({
    where: { id: image.id },
  });

  const remaining = await getProductImages(productId);

  if (remaining.length > 0) {
    await prisma.$transaction(
      remaining.map((item, index) =>
        prisma.productImage.update({
          where: { id: item.id },
          data: { order: index },
        }),
      ),
    );
  }

  if (image.publicId) {
    try {
      await deleteProductImage(image.publicId);
    } catch (error) {
      console.error("Cloudinary silme hatası:", error);
    }
  }

  refreshImages();

  return { success: true, error: null };
}

export async function moveProductImageAction(formData) {
  await requireAdmin();

  const productId = String(formData.get("productId") ?? "");
  const imageId = String(formData.get("imageId") ?? "");
  const direction = String(formData.get("direction") ?? "");

  if (!["up", "down"].includes(direction)) {
    return failure("Geçersiz sıralama işlemi.");
  }

  const images = await getProductImages(productId);
  const index = images.findIndex((image) => image.id === imageId);

  if (index === -1) return failure("Görsel bulunamadı.");

  const targetIndex = direction === "up" ? index - 1 : index + 1;

  if (targetIndex < 0 || targetIndex >= images.length) {
    return failure("Görsel daha fazla taşınamaz.");
  }

  const reordered = [...images];

  [reordered[index], reordered[targetIndex]] = [
    reordered[targetIndex],
    reordered[index],
  ];

  await prisma.$transaction(
    reordered.map((image, position) =>
      prisma.productImage.update({
        where: { id: image.id },
        data: { order: position },
      }),
    ),
  );

  refreshImages();

  return { success: true, error: null };
}

export async function setMainProductImageAction(formData) {
  await requireAdmin();

  const productId = String(formData.get("productId") ?? "");
  const imageId = String(formData.get("imageId") ?? "");

  const images = await getProductImages(productId);
  const selected = images.find((image) => image.id === imageId);

  if (!selected) return failure("Görsel bulunamadı.");

  const reordered = [
    selected,
    ...images.filter((image) => image.id !== imageId),
  ];

  await prisma.$transaction(
    reordered.map((image, index) =>
      prisma.productImage.update({
        where: { id: image.id },
        data: { order: index },
      }),
    ),
  );

  refreshImages();

  return { success: true, error: null };
}
