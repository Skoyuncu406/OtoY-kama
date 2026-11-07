"use server";

import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { formatCategoryName, createCategorySlug } from "@/lib/category-utils";
import { uploadCategoryImage, deleteCategoryImage } from "@/lib/category-image";

function parseInput(formData) {
  const name = formatCategoryName(String(formData.get("name") ?? ""));

  const rawOrder = String(formData.get("order") ?? "0").trim();
  const order = Number(rawOrder);
  const slug = createCategorySlug(name);

  if (name.length < 2 || name.length > 100) {
    return {
      error: "Kategori adı 2–100 karakter arasında olmalıdır.",
    };
  }

  if (!slug) {
    return { error: "Geçerli bir kategori adı girin." };
  }

  if (
    rawOrder === "" ||
    !Number.isSafeInteger(order) ||
    order < 0 ||
    order > 100000
  ) {
    return { error: "Geçerli bir sıralama değeri girin." };
  }

  return { name, slug, order };
}

function getImageFile(formData) {
  const file = formData.get("image");

  return file instanceof File && file.size > 0 ? file : null;
}

function refreshCategories() {
  revalidatePath("/admin");
  revalidatePath("/admin/kategoriler");
}

async function safelyDeleteImage(url) {
  if (!url) return;

  try {
    await deleteCategoryImage(url);
  } catch (error) {
    console.error("Cloudinary görsel silme hatası:", error);
  }
}

function getErrorMessage(error) {
  if (error?.code === "P2002") {
    return "Bu kategori adı zaten kullanılıyor.";
  }

  if (
    typeof error?.message === "string" &&
    (error.message.startsWith("Geçerli bir görsel") ||
      error.message.startsWith("Yalnızca JPG") ||
      error.message.startsWith("Görsel boyutu"))
  ) {
    return error.message;
  }

  console.error("Kategori işlem hatası:", error);

  return "İşlem sırasında bir hata oluştu. Tekrar deneyin.";
}

export async function createCategoryAction(formData) {
  await requireAdmin();

  const input = parseInput(formData);

  if (input.error) {
    return { success: false, error: input.error };
  }

  let uploadedImage = null;

  try {
    const existing = await prisma.category.findUnique({
      where: { slug: input.slug },
      select: { id: true },
    });

    if (existing) {
      return {
        success: false,
        error: "Bu kategori zaten mevcut.",
      };
    }

    const file = getImageFile(formData);

    if (file) {
      uploadedImage = await uploadCategoryImage(file);
    }

    await prisma.category.create({
      data: {
        ...input,
        image: uploadedImage?.url ?? null,
        isActive: true,
      },
    });

    refreshCategories();

    return { success: true, error: null };
  } catch (error) {
    if (uploadedImage) {
      await safelyDeleteImage(uploadedImage.url);
    }

    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

export async function updateCategoryAction(formData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const input = parseInput(formData);

  if (input.error) {
    return { success: false, error: input.error };
  }

  const existing = await prisma.category.findUnique({
    where: { id },
  });

  if (!existing) {
    return {
      success: false,
      error: "Kategori bulunamadı.",
    };
  }

  const removeImage = formData.get("removeImage") === "true";

  const file = getImageFile(formData);
  let uploadedImage = null;

  try {
    if (file) {
      uploadedImage = await uploadCategoryImage(file);
    }

    const nextImage = uploadedImage
      ? uploadedImage.url
      : removeImage
        ? null
        : existing.image;

    await prisma.category.update({
      where: { id },
      data: {
        ...input,
        image: nextImage,
      },
    });

    if (existing.image && existing.image !== nextImage) {
      await safelyDeleteImage(existing.image);
    }

    refreshCategories();

    return { success: true, error: null };
  } catch (error) {
    if (uploadedImage) {
      await safelyDeleteImage(uploadedImage.url);
    }

    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

export async function toggleCategoryAction(formData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");

  const category = await prisma.category.findUnique({
    where: { id },
    select: { id: true, isActive: true },
  });

  if (!category) {
    return {
      success: false,
      error: "Kategori bulunamadı.",
    };
  }

  await prisma.category.update({
    where: { id },
    data: { isActive: !category.isActive },
  });

  refreshCategories();

  return { success: true, error: null };
}

export async function deleteCategoryAction(formData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");

  const category = await prisma.category.findUnique({
    where: { id },
    select: {
      id: true,
      image: true,
      _count: {
        select: { products: true },
      },
    },
  });

  if (!category) {
    return {
      success: false,
      error: "Kategori bulunamadı.",
    };
  }

  if (category._count.products > 0) {
    return {
      success: false,
      error: "Bu kategoriye bağlı ürünler bulunduğu için silinemez.",
    };
  }

  try {
    await prisma.category.delete({
      where: { id },
    });
  } catch (error) {
    if (error?.code === "P2003") {
      return {
        success: false,
        error: "Bu kategoriye bağlı ürünler bulunduğu için silinemez.",
      };
    }

    throw error;
  }

  await safelyDeleteImage(category.image);

  refreshCategories();

  return { success: true, error: null };
}
