"use server";

import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { createCategorySlug } from "@/lib/category-utils";

// FİYAT DOĞRULAMA

function parsePrice(value, required = false) {
  const raw = String(value ?? "")
    .trim()
    .replace(",", ".");

  if (!raw) {
    if (required) {
      throw new Error("Ürün fiyatı zorunludur.");
    }

    return null;
  }

  if (!/^\d{1,8}(\.\d{1,2})?$/.test(raw)) {
    throw new Error("Fiyat en fazla iki ondalık basamak içermelidir.");
  }

  const [whole, fraction = ""] = raw.split(".");

  const cents = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"));

  if (cents <= 0n || cents > 9999999999n) {
    throw new Error("Geçerli bir fiyat girin.");
  }

  return {
    value: `${whole}.${fraction.padEnd(2, "0")}`,
    cents,
  };
}

// STOK DOĞRULAMA

function parseStock(value) {
  const raw = String(value ?? "").trim();

  if (!/^\d+$/.test(raw)) {
    throw new Error("Geçerli bir stok miktarı girin.");
  }

  const stock = Number(raw);

  if (!Number.isSafeInteger(stock) || stock < 0 || stock > 1000000) {
    throw new Error("Geçerli bir stok miktarı girin.");
  }

  return stock;
}

// ÜRÜN FORMU DOĞRULAMA

function parseProduct(formData) {
  const name = String(formData.get("name") ?? "")
    .trim()
    .replace(/\s+/g, " ");

  const description = String(formData.get("description") ?? "").trim();

  const details = String(formData.get("details") ?? "").trim();

  const categoryId = String(formData.get("categoryId") ?? "").trim();

  if (name.length < 2 || name.length > 180) {
    throw new Error("Ürün adı 2–180 karakter olmalıdır.");
  }

  if (description.length > 5000 || details.length > 10000) {
    throw new Error("Açıklama veya detay metni çok uzun.");
  }

  if (!categoryId) {
    throw new Error("Bir kategori seçin.");
  }

  const stock = parseStock(formData.get("stock"));

  const price = parsePrice(formData.get("price"), true);

  const salePrice = parsePrice(formData.get("salePrice"));

  if (salePrice && salePrice.cents >= price.cents) {
    throw new Error("İndirimli fiyat normal fiyattan düşük olmalıdır.");
  }

  const slug = createCategorySlug(name);

  if (!slug) {
    throw new Error("Ürün adı geçerli bir URL oluşturmalıdır.");
  }

  return {
    name,
    slug,
    description: description || null,
    details: details || null,
    categoryId,
    price: price.value,
    salePrice: salePrice?.value ?? null,
    stock,
    isActive: formData.get("isActive") === "true",
    isNew: formData.get("isNew") === "true",
    isBestSeller: formData.get("isBestSeller") === "true",
  };
}

// KATEGORİ KONTROLÜ

async function validateCategory(categoryId) {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true },
  });

  if (!category) {
    throw new Error("Seçilen kategori bulunamadı.");
  }
}

// SAYFALARI YENİLE

function refreshProducts() {
  revalidatePath("/admin");
  revalidatePath("/admin/urunler");
}

// HATA YÖNETİMİ

function actionError(error) {
  if (error?.code === "P2002") {
    return {
      success: false,
      error: "Bu isimden oluşturulan ürün adresi zaten kullanılıyor.",
    };
  }

  if (error?.code === "P2003") {
    return {
      success: false,
      error: "İlişkili kayıt bulunamadı.",
    };
  }

  const knownMessages = [
    "Ürün fiyatı zorunludur.",
    "Fiyat en fazla iki ondalık basamak içermelidir.",
    "Geçerli bir fiyat girin.",
    "Ürün adı 2–180 karakter olmalıdır.",
    "Açıklama veya detay metni çok uzun.",
    "Bir kategori seçin.",
    "Geçerli bir stok miktarı girin.",
    "İndirimli fiyat normal fiyattan düşük olmalıdır.",
    "Ürün adı geçerli bir URL oluşturmalıdır.",
    "Seçilen kategori bulunamadı.",
  ];

  if (knownMessages.includes(error?.message)) {
    return {
      success: false,
      error: error.message,
    };
  }

  console.error("Ürün işlemi hatası:", error);

  return {
    success: false,
    error: "İşlem gerçekleştirilemedi. Tekrar deneyin.",
  };
}

// YENİ ÜRÜN OLUŞTUR

export async function createProductAction(formData) {
  await requireAdmin();

  try {
    const input = parseProduct(formData);

    await validateCategory(input.categoryId);

    await prisma.product.create({
      data: input,
    });

    refreshProducts();

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    return actionError(error);
  }
}

// ÜRÜN GÜNCELLE

export async function updateProductAction(formData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    return {
      success: false,
      error: "Ürün kimliği eksik.",
    };
  }

  try {
    const input = parseProduct(formData);

    await validateCategory(input.categoryId);

    const result = await prisma.product.updateMany({
      where: { id },
      data: input,
    });

    if (result.count === 0) {
      return {
        success: false,
        error: "Ürün bulunamadı.",
      };
    }

    refreshProducts();

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    return actionError(error);
  }
}

// HIZLI STOK GÜNCELLEME

export async function updateProductStockAction(formData) {
  await requireAdmin();

  try {
    const id = String(formData.get("id") ?? "").trim();

    if (!id) {
      return {
        success: false,
        error: "Ürün kimliği eksik.",
      };
    }

    const stock = parseStock(formData.get("stock"));

    const result = await prisma.product.updateMany({
      where: { id },
      data: { stock },
    });

    if (result.count === 0) {
      return {
        success: false,
        error: "Ürün bulunamadı.",
      };
    }

    refreshProducts();

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    return actionError(error);
  }
}

// ÜRÜN AKTİF / PASİF

export async function toggleProductAction(formData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();

  const product = await prisma.product.findUnique({
    where: { id },
    select: { isActive: true },
  });

  if (!product) {
    return {
      success: false,
      error: "Ürün bulunamadı.",
    };
  }

  await prisma.product.update({
    where: { id },
    data: {
      isActive: !product.isActive,
    },
  });

  refreshProducts();

  return {
    success: true,
    error: null,
  };
}

// ÜRÜN SİL

export async function deleteProductAction(formData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();

  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      _count: {
        select: {
          images: true,
        },
      },
    },
  });

  if (!product) {
    return {
      success: false,
      error: "Ürün bulunamadı.",
    };
  }

  // Cloudinary görsellerini sahipsiz bırakmamak
  // için görseli olan ürünlerin silinmesini engelle.

  if (product._count.images > 0) {
    return {
      success: false,
      error: "Görselleri olan ürünü silmeden önce görsellerini kaldırın.",
    };
  }

  await prisma.product.delete({
    where: { id },
  });

  refreshProducts();

  return {
    success: true,
    error: null,
  };
}
