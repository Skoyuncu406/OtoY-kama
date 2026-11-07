import "server-only";

import cloudinary from "@/lib/cloudinary";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function uploadProductImage(file) {
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Geçerli bir görsel seçin.");
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Yalnızca JPG, PNG ve WebP yüklenebilir.");
  }

  if (file.size > MAX_SIZE) {
    throw new Error("Görsel en fazla 5 MB olabilir.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "vicix/products",
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        overwrite: false,
      },
      (error, result) => {
        if (error) return reject(error);
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

export async function deleteProductImage(publicId) {
  if (
    typeof publicId !== "string" ||
    !/^vicix\/products\/[a-zA-Z0-9_/-]+$/.test(publicId)
  ) {
    return;
  }

  await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
  });
}
