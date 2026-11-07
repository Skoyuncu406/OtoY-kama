import "server-only";

import cloudinary from "@/lib/cloudinary";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function uploadCategoryImage(file) {
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Geçerli bir görsel seçin.");
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Yalnızca JPG, PNG ve WebP yüklenebilir.");
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("Görsel boyutu en fazla 5 MB olabilir.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "vicix/categories",
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        overwrite: false,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      },
    );

    stream.end(buffer);
  });

  if (!result?.secure_url || !result?.public_id) {
    throw new Error("Görsel yüklenemedi.");
  }

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

export function getCategoryImagePublicId(url) {
  if (!url || typeof url !== "string") return null;

  try {
    const parsed = new URL(url);

    if (
      parsed.protocol !== "https:" ||
      parsed.hostname !== "res.cloudinary.com"
    ) {
      return null;
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

    const prefix = `/${cloudName}/image/upload/`;

    if (!parsed.pathname.startsWith(prefix)) {
      return null;
    }

    const path = parsed.pathname.slice(prefix.length);

    const match = path.match(
      /^(?:v\d+\/)?(vicix\/categories\/[a-zA-Z0-9_/-]+)\.(?:jpg|jpeg|png|webp)$/,
    );

    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

export async function deleteCategoryImage(url) {
  const publicId = getCategoryImagePublicId(url);

  if (!publicId) return;

  await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
  });
}
