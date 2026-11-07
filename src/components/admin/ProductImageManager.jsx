
"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ImagePlus,
  LoaderCircle,
  Star,
  Trash2,
  X,
} from "lucide-react";

import {
  uploadProductImageAction,
  deleteProductImageAction,
  moveProductImageAction,
  setMainProductImageAction,
} from "@/app/admin/urunler/image-actions";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;
const MAX_IMAGES = 12;

export default function ProductImageManager({
  productId,
  productName,
  images,
  onClose,
}) {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);

  const busy = pending || uploading;

  function showResult(result, successText) {
    setMessage({
      type: result.success ? "success" : "error",
      text: result.success ? successText : result.error,
    });

    if (result.success) router.refresh();
  }

  async function handleUpload(event) {
    const files = Array.from(event.target.files ?? []);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (!files.length) return;

    if (images.length + files.length > MAX_IMAGES) {
      setMessage({
        type: "error",
        text: "Bir ürüne en fazla 12 görsel eklenebilir.",
      });
      return;
    }

    const invalid = files.find(
      (file) => !ALLOWED.includes(file.type) || file.size > MAX_SIZE
    );

    if (invalid) {
      setMessage({
        type: "error",
        text: "Görseller JPG, PNG veya WebP olmalı ve 5 MB'ı geçmemelidir.",
      });
      return;
    }

    setUploading(true);
    setMessage(null);

    let uploadedCount = 0;

    try {
      for (const file of files) {
        const data = new FormData();
        data.set("productId", productId);
        data.set("image", file);

        const result = await uploadProductImageAction(data);

        if (!result.success) {
          setMessage({
            type: "error",
            text: `${uploadedCount} görsel yüklendi. ${result.error}`,
          });
          break;
        }

        uploadedCount += 1;
      }

      if (uploadedCount === files.length) {
        setMessage({
          type: "success",
          text: `${uploadedCount} görsel başarıyla yüklendi.`,
        });
      }

      if (uploadedCount > 0) router.refresh();
    } catch {
      setMessage({
        type: "error",
        text: `${uploadedCount} görsel yüklendi. İşlem kesildi.`,
      });

      if (uploadedCount > 0) router.refresh();
    } finally {
      setUploading(false);
    }
  }

  function runAction(action, imageId, successText, direction) {
    const data = new FormData();
    data.set("productId", productId);
    data.set("imageId", imageId);

    if (direction) data.set("direction", direction);

    setMessage(null);

    startTransition(async () => {
      try {
        const result = await action(data);
        showResult(result, successText);
      } catch {
        setMessage({
          type: "error",
          text: "İşlem tamamlanamadı.",
        });
      }
    });
  }

  function handleDelete(image) {
    if (!window.confirm("Bu ürün görseli silinsin mi?")) return;

    runAction(
      deleteProductImageAction,
      image.id,
      "Görsel silindi."
    );
  }

  return (
    <section className="mt-8 border-t border-[#D9DCD6] pt-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A61922]">
            ÜRÜN GÖRSELLERİ
          </p>

          <h3 className="mt-2 break-words text-lg font-semibold">
            {productName}
          </h3>

          <p className="mt-2 text-xs text-[#898D88]">
            {images.length}/{MAX_IMAGES} görsel · İlk görsel ana görseldir
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          className="inline-flex items-center gap-2 text-xs text-[#747974] hover:text-[#A61922]"
        >
          <X size={16} />
          Kapat
        </button>
      </div>

      <div className="mt-6">
        <input
          ref={fileInputRef}
          id={`product-images-${productId}`}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={busy || images.length >= MAX_IMAGES}
          onChange={handleUpload}
          className="sr-only"
        />

        <label
          htmlFor={`product-images-${productId}`}
          className={`inline-flex min-h-12 items-center justify-center gap-2 bg-[#A61922] px-6 text-xs font-semibold text-white transition-colors hover:bg-[#85141B] ${
            busy || images.length >= MAX_IMAGES
              ? "pointer-events-none opacity-50"
              : "cursor-pointer"
          }`}
        >
          {busy ? (
            <LoaderCircle size={17} className="animate-spin" />
          ) : (
            <ImagePlus size={17} />
          )}

          {uploading ? "Görseller Yükleniyor..." : "Görsel Ekle"}
        </label>

        <p className="mt-3 text-xs text-[#898D88]">
          Birden fazla görsel seçebilirsiniz. Her biri en fazla 5 MB.
        </p>
      </div>

      {message && (
        <div
          role="status"
          className={`mt-5 border-l-2 px-4 py-3 text-sm ${
            message.type === "success"
              ? "border-[#46735C] bg-[#46735C]/5 text-[#46735C]"
              : "border-[#A61922] bg-[#A61922]/5 text-[#A61922]"
          }`}
        >
          {message.text}
        </div>
      )}

      {images.length === 0 ? (
        <div className="mt-8 border-y border-[#D9DCD6] py-10 text-center">
          <ImagePlus
            size={26}
            strokeWidth={1.4}
            className="mx-auto text-[#A0A59E]"
          />
          <p className="mt-3 text-sm text-[#747974]">
            Bu ürüne henüz görsel eklenmedi.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image, index) => (
            <div key={image.id} className="min-w-0">
              <div className="relative aspect-square overflow-hidden bg-[#EAECE7]">
                <img
                  src={image.url}
                  alt={`${productName} - Görsel ${index + 1}`}
                  className="h-full w-full object-contain"
                />

                {index === 0 && (
                  <span className="absolute left-2 top-2 bg-[#A61922] px-2 py-1 text-[10px] font-semibold text-white">
                    Ana Görsel
                  </span>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between gap-1">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={busy || index === 0}
                    onClick={() =>
                      runAction(
                        moveProductImageAction,
                        image.id,
                        "Görsel sırası güncellendi.",
                        "up"
                      )
                    }
                    aria-label="Görseli sola taşı"
                    className="p-2 text-[#747974] hover:text-[#A61922] disabled:opacity-25"
                  >
                    <ArrowLeft size={16} />
                  </button>

                  <button
                    type="button"
                    disabled={busy || index === images.length - 1}
                    onClick={() =>
                      runAction(
                        moveProductImageAction,
                        image.id,
                        "Görsel sırası güncellendi.",
                        "down"
                      )
                    }
                    aria-label="Görseli sağa taşı"
                    className="p-2 text-[#747974] hover:text-[#A61922] disabled:opacity-25"
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={busy || index === 0}
                    onClick={() =>
                      runAction(
                        setMainProductImageAction,
                        image.id,
                        "Ana görsel değiştirildi."
                      )
                    }
                    aria-label="Ana görsel yap"
                    title="Ana görsel yap"
                    className="p-2 text-[#747974] hover:text-[#A61922] disabled:opacity-25"
                  >
                    <Star size={16} />
                  </button>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleDelete(image)}
                    aria-label="Görseli sil"
                    className="p-2 text-[#747974] hover:text-[#A61922] disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <p className="mt-1 text-center text-[11px] text-[#898D88]">
                Görsel {index + 1}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
