
"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  LoaderCircle,
  ArrowUpDown,
  ImagePlus,
} from "lucide-react";

import {
  createCategoryAction,
  updateCategoryAction,
  toggleCategoryAction,
  deleteCategoryAction,
} from "@/app/admin/kategoriler/actions";

const initialForm = {
  name: "",
  order: "0",
};

export default function CategoryManager({ categories }) {
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [message, setMessage] = useState(null);
  const [pending, startTransition] = useTransition();

  const fileInputRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    if (!selectedFile) {
      setPreview(null);
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
    setExistingImage(null);
    setSelectedFile(null);
    setRemoveImage(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type)
    ) {
      setMessage({
        type: "error",
        text: "Yalnızca JPG, PNG veya WebP görsel seçin.",
      });
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({
        type: "error",
        text: "Görsel en fazla 5 MB olabilir.",
      });
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
    setRemoveImage(false);
    setMessage(null);
  }

  function handleRemoveImage() {
    setSelectedFile(null);
    setRemoveImage(true);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    const isEditing = Boolean(editingId);

    const data = new FormData();
    data.set("name", form.name);
    data.set("order", form.order);

    if (isEditing) {
      data.set("id", editingId);
      data.set("removeImage", String(removeImage));
    }

    if (selectedFile) {
      data.set("image", selectedFile);
    }

    setMessage(null);

    startTransition(async () => {
      try {
        const result = isEditing
          ? await updateCategoryAction(data)
          : await createCategoryAction(data);

        if (result.success) {
          resetForm();

          setMessage({
            type: "success",
            text: isEditing
              ? "Kategori başarıyla güncellendi."
              : "Kategori başarıyla oluşturuldu.",
          });
        } else {
          setMessage({
            type: "error",
            text: result.error,
          });
        }
      } catch {
        setMessage({
          type: "error",
          text: "İşlem tamamlanamadı. Tekrar deneyin.",
        });
      }
    });
  }

  function handleEdit(category) {
    setEditingId(category.id);
    setForm({
      name: category.name,
      order: String(category.order),
    });
    setExistingImage(category.image);
    setSelectedFile(null);
    setRemoveImage(false);
    setMessage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    formRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function runCategoryAction(action, id, successText) {
    const data = new FormData();
    data.set("id", id);
    setMessage(null);

    startTransition(async () => {
      try {
        const result = await action(data);

        setMessage({
          type: result.success ? "success" : "error",
          text: result.success ? successText : result.error,
        });
      } catch {
        setMessage({
          type: "error",
          text: "İşlem tamamlanamadı.",
        });
      }
    });
  }

  function handleDelete(category) {
    if (
      !window.confirm(
        `"${category.name}" kategorisini silmek istediğinize emin misiniz?`
      )
    ) {
      return;
    }

    runCategoryAction(
      deleteCategoryAction,
      category.id,
      "Kategori başarıyla silindi."
    );
  }

  const visibleImage =
    preview || (!removeImage ? existingImage : null);

  return (
    <div className="space-y-10">
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="scroll-mt-32 border-b border-[#D9DCD6] pb-10"
      >
        <div className="mb-7 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight">
            {editingId ? "Kategori Düzenle" : "Yeni Kategori"}
          </h2>

          {editingId && (
            <button
              type="button"
              disabled={pending}
              onClick={resetForm}
              className="inline-flex items-center gap-2 text-xs text-[#747974] hover:text-[#A61922]"
            >
              <X size={15} />
              Vazgeç
            </button>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_130px_auto] md:items-end">
          <div>
            <label
              htmlFor="category-name"
              className="mb-3 block text-xs font-semibold text-[#626862]"
            >
              Kategori Adı
            </label>

            <input
              id="category-name"
              type="text"
              required
              minLength={2}
              maxLength={100}
              disabled={pending}
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              placeholder="Örn. Araç İç Temizlik"
              className="h-12 w-full border-0 border-b border-[#C8CCC5] bg-transparent px-0 text-sm outline-none focus:border-[#A61922] disabled:opacity-60"
            />
          </div>

          <div>
            <label
              htmlFor="category-order"
              className="mb-3 flex items-center gap-2 text-xs font-semibold text-[#626862]"
            >
              <ArrowUpDown size={14} />
              Sıralama
            </label>

            <input
              id="category-order"
              type="number"
              min={0}
              max={100000}
              required
              disabled={pending}
              value={form.order}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  order: event.target.value,
                }))
              }
              className="h-12 w-full border-0 border-b border-[#C8CCC5] bg-transparent px-0 text-sm outline-none focus:border-[#A61922] disabled:opacity-60"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-12 items-center justify-center gap-2 bg-[#A61922] px-7 text-sm font-semibold text-white transition-colors hover:bg-[#85141B] disabled:opacity-50"
          >
            {pending ? (
              <LoaderCircle size={17} className="animate-spin" />
            ) : editingId ? (
              <Check size={17} />
            ) : (
              <Plus size={17} />
            )}

            {pending
              ? "Kaydediliyor..."
              : editingId
                ? "Güncelle"
                : "Kategori Ekle"}
          </button>
        </div>

        <p className="mt-3 text-xs text-[#898D88]">
          Kategori isimleri otomatik olarak baş harfleri büyük
          olacak şekilde kaydedilir.
        </p>

        <div className="mt-8 border-t border-[#D9DCD6] pt-7">
          <h3 className="text-sm font-semibold">
            Kategori Görseli
          </h3>

          <p className="mt-2 text-xs text-[#898D88]">
            JPG, PNG veya WebP · Maksimum 5 MB · İsteğe bağlı
          </p>

          <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-32 w-full shrink-0 items-center justify-center overflow-hidden border border-[#D9DCD6] bg-[#EAECE7] sm:w-44">
              {visibleImage ? (
                <img
                  src={visibleImage}
                  alt="Kategori görseli önizlemesi"
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImagePlus
                  size={26}
                  strokeWidth={1.4}
                  className="text-[#9A9F98]"
                />
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                disabled={pending}
                className="hidden"
                id="category-image"
              />

              <label
                htmlFor="category-image"
                className={`inline-flex cursor-pointer items-center gap-2 border border-[#C8CCC5] px-5 py-3 text-xs font-semibold transition-colors hover:border-[#A61922] hover:text-[#A61922] ${
                  pending ? "pointer-events-none opacity-50" : ""
                }`}
              >
                <ImagePlus size={16} />
                {visibleImage ? "Görsel Değiştir" : "Görsel Seç"}
              </label>

              {visibleImage && (
                <button
                  type="button"
                  disabled={pending}
                  onClick={handleRemoveImage}
                  className="inline-flex items-center gap-2 px-3 py-3 text-xs font-semibold text-[#A61922] hover:text-[#85141B] disabled:opacity-50"
                >
                  <Trash2 size={15} />
                  Görseli Kaldır
                </button>
              )}

              {selectedFile && (
                <span className="max-w-full break-all text-xs text-[#747974]">
                  {selectedFile.name}
                </span>
              )}
            </div>
          </div>

          <p className="mt-3 text-xs text-[#898D88]">
            Görsel, kategori kaydedildiğinde Cloudinary'ye yüklenir.
          </p>
        </div>
      </form>

      {message && (
        <div
          role="status"
          className={`border-l-2 px-4 py-3 text-sm ${
            message.type === "success"
              ? "border-[#46735C] bg-[#46735C]/5 text-[#46735C]"
              : "border-[#A61922] bg-[#A61922]/5 text-[#A61922]"
          }`}
        >
          {message.text}
        </div>
      )}

      <section>
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight">
            Mevcut Kategoriler
          </h2>

          <span className="text-xs text-[#898D88]">
            {categories.length} kategori
          </span>
        </div>

        {categories.length === 0 ? (
          <div className="border-y border-[#D9DCD6] py-14 text-center">
            <p className="text-sm text-[#747974]">
              Henüz kategori oluşturulmadı.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#D9DCD6] border-y border-[#D9DCD6]">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex flex-col gap-5 py-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden bg-[#EAECE7]">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImagePlus
                        size={20}
                        className="text-[#A0A59E]"
                      />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className="break-words text-sm font-semibold">
                      {category.name}
                    </h3>

                    <p className="mt-1 break-all text-xs text-[#898D88]">
                      /{category.slug}
                    </p>

                    <p className="mt-2 text-xs text-[#898D88]">
                      Sıra: {category.order} ·{" "}
                      {category.productCount} ürün
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      runCategoryAction(
                        toggleCategoryAction,
                        category.id,
                        "Kategori durumu güncellendi."
                      )
                    }
                    className={`px-3 py-2 text-xs font-semibold disabled:opacity-50 ${
                      category.isActive
                        ? "bg-[#46735C]/10 text-[#46735C]"
                        : "bg-[#A61922]/10 text-[#A61922]"
                    }`}
                  >
                    {category.isActive ? "Aktif" : "Pasif"}
                  </button>

                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => handleEdit(category)}
                    aria-label={`${category.name} düzenle`}
                    className="p-2 text-[#747974] hover:text-[#A61922] disabled:opacity-50"
                  >
                    <Pencil size={17} />
                  </button>

                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => handleDelete(category)}
                    aria-label={`${category.name} sil`}
                    className="p-2 text-[#747974] hover:text-[#A61922] disabled:opacity-50"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
