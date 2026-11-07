
"use client";

import { useRef, useState, useTransition } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  LoaderCircle,
  Package,
  Images,
  ImagePlus,
} from "lucide-react";

import {
  createProductAction,
  updateProductAction,
  toggleProductAction,
  deleteProductAction,
} from "@/app/admin/urunler/actions";

import ProductImageManager from "@/components/admin/ProductImageManager";

const emptyForm = {
  name: "",
  description: "",
  details: "",
  categoryId: "",
  price: "",
  salePrice: "",
  stock: "0",
  isActive: true,
  isNew: false,
  isBestSeller: false,
};

const inputClass =
  "h-12 w-full min-w-0 rounded-none border-0 border-b border-[#C8CCC5] bg-transparent px-0 text-sm text-[#191C19] outline-none ring-0 transition-colors focus:border-[#A61922] focus:outline-none focus:ring-0 disabled:opacity-50";

const currencyFormatter = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
});

function Field({ label, children }) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-xs font-semibold text-[#626862]">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function ProductManager({ products, categories }) {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [imageProductId, setImageProductId] = useState(null);
  const [message, setMessage] = useState(null);

  const [pending, startTransition] = useTransition();

  const formRef = useRef(null);

  const isBusy = pending;

  function setField(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function resetForm() {
    setForm({ ...emptyForm });
    setEditingId(null);
  }

  function handleEdit(product) {
    if (isBusy) return;

    setEditingId(product.id);
    setImageProductId(null);

    setForm({
      name: product.name,
      description: product.description ?? "",
      details: product.details ?? "",
      categoryId: product.categoryId,
      price: product.price,
      salePrice: product.salePrice ?? "",
      stock: String(product.stock),
      isActive: product.isActive,
      isNew: product.isNew,
      isBestSeller: product.isBestSeller,
    });

    setMessage(null);

    formRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (isBusy) return;

    const isEditing = Boolean(editingId);

    const data = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      data.set(key, String(value));
    });

    if (isEditing) {
      data.set("id", editingId);
    }

    setMessage(null);

    startTransition(async () => {
      try {
        const result = isEditing
          ? await updateProductAction(data)
          : await createProductAction(data);

        if (result.success) {
          resetForm();

          setMessage({
            type: "success",
            text: isEditing
              ? "Ürün başarıyla güncellendi."
              : "Ürün başarıyla oluşturuldu.",
          });
        } else {
          setMessage({
            type: "error",
            text:
              result.error ??
              "Ürün kaydedilirken bir hata oluştu.",
          });
        }
      } catch (error) {
        console.error("Ürün kaydetme hatası:", error);

        setMessage({
          type: "error",
          text: "İşlem tamamlanamadı. Tekrar deneyin.",
        });
      }
    });
  }

  function runAction(action, id, successText, onSuccess) {
    if (isBusy) return;

    const data = new FormData();
    data.set("id", id);

    setMessage(null);

    startTransition(async () => {
      try {
        const result = await action(data);

        if (result.success) {
          onSuccess?.();

          setMessage({
            type: "success",
            text: successText,
          });
        } else {
          setMessage({
            type: "error",
            text:
              result.error ??
              "İşlem gerçekleştirilemedi.",
          });
        }
      } catch (error) {
        console.error("Ürün işlemi hatası:", error);

        setMessage({
          type: "error",
          text: "İşlem tamamlanamadı. Tekrar deneyin.",
        });
      }
    });
  }

  function handleDelete(product) {
    if (isBusy) return;

    const confirmed = window.confirm(
      `"${product.name}" ürününü kalıcı olarak silmek istiyor musunuz?`
    );

    if (!confirmed) return;

    runAction(
      deleteProductAction,
      product.id,
      "Ürün başarıyla silindi.",
      () => {
        if (editingId === product.id) {
          resetForm();
        }

        if (imageProductId === product.id) {
          setImageProductId(null);
        }
      }
    );
  }

  function handleToggleImages(productId) {
    if (isBusy) return;

    setImageProductId((current) =>
      current === productId ? null : productId
    );

    setMessage(null);
  }

  return (
    <div className="min-w-0 space-y-12">
      {/* ÜRÜN FORMU */}
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="scroll-mt-32 border-b border-[#D9DCD6] pb-10"
      >
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#A61922]">
              ÜRÜN BİLGİLERİ
            </p>

            <h2 className="text-xl font-semibold tracking-tight">
              {editingId ? "Ürün Düzenle" : "Yeni Ürün"}
            </h2>
          </div>

          {editingId && (
            <button
              type="button"
              disabled={isBusy}
              onClick={resetForm}
              className="inline-flex items-center gap-2 text-xs font-medium text-[#747974] transition-colors hover:text-[#A61922] disabled:opacity-50"
            >
              <X size={16} />
              Vazgeç
            </button>
          )}
        </div>

        <div className="grid gap-x-8 gap-y-7 md:grid-cols-2">
          <Field label="Ürün Adı">
            <input
              type="text"
              className={inputClass}
              required
              minLength={2}
              maxLength={180}
              disabled={isBusy}
              value={form.name}
              onChange={(event) =>
                setField("name", event.target.value)
              }
              placeholder="Örn. VICIX Seramik Koruma"
            />
          </Field>

          <Field label="Kategori">
            <select
              className={inputClass}
              required
              disabled={isBusy}
              value={form.categoryId}
              onChange={(event) =>
                setField("categoryId", event.target.value)
              }
            >
              <option value="">Kategori seçin</option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Normal Fiyat (₺)">
            <input
              type="number"
              className={inputClass}
              min="0.01"
              max="99999999.99"
              step="0.01"
              required
              disabled={isBusy}
              value={form.price}
              onChange={(event) =>
                setField("price", event.target.value)
              }
              placeholder="499.90"
            />
          </Field>

          <Field label="İndirimli Fiyat (₺) — İsteğe bağlı">
            <input
              type="number"
              className={inputClass}
              min="0.01"
              max="99999999.99"
              step="0.01"
              disabled={isBusy}
              value={form.salePrice}
              onChange={(event) =>
                setField("salePrice", event.target.value)
              }
              placeholder="399.90"
            />
          </Field>

          <Field label="Stok Adedi">
            <input
              type="number"
              className={inputClass}
              min="0"
              max="1000000"
              step="1"
              required
              disabled={isBusy}
              value={form.stock}
              onChange={(event) =>
                setField("stock", event.target.value)
              }
            />
          </Field>

          <Field label="Ürün Durumu">
            <select
              className={inputClass}
              disabled={isBusy}
              value={String(form.isActive)}
              onChange={(event) =>
                setField(
                  "isActive",
                  event.target.value === "true"
                )
              }
            >
              <option value="true">Aktif</option>
              <option value="false">Pasif</option>
            </select>
          </Field>
        </div>

        {/* AÇIKLAMALAR */}
        <div className="mt-8 space-y-7">
          <Field label="Ürün Açıklaması">
            <textarea
              rows={4}
              maxLength={5000}
              disabled={isBusy}
              value={form.description}
              onChange={(event) =>
                setField(
                  "description",
                  event.target.value
                )
              }
              placeholder="Ürünün genel açıklaması..."
              className={`${inputClass} h-auto min-h-28 resize-y py-3`}
            />
          </Field>

          <Field label="Ürün Detayları / Kullanım Bilgileri">
            <textarea
              rows={5}
              maxLength={10000}
              disabled={isBusy}
              value={form.details}
              onChange={(event) =>
                setField("details", event.target.value)
              }
              placeholder="Teknik özellikler, kullanım talimatları..."
              className={`${inputClass} h-auto min-h-32 resize-y py-3`}
            />
          </Field>
        </div>

        {/* ÜRÜN ETİKETLERİ */}
        <div className="mt-8 flex flex-wrap gap-x-8 gap-y-4 border-y border-[#D9DCD6] py-6">
          {[
            {
              key: "isNew",
              label: "Yeni Ürün",
            },
            {
              key: "isBestSeller",
              label: "Çok Satan",
            },
          ].map((item) => (
            <label
              key={item.key}
              className="flex cursor-pointer items-center gap-3 text-sm text-[#191C19]"
            >
              <input
                type="checkbox"
                checked={form[item.key]}
                disabled={isBusy}
                onChange={(event) =>
                  setField(
                    item.key,
                    event.target.checked
                  )
                }
                className="h-4 w-4 accent-[#A61922]"
              />

              {item.label}
            </label>
          ))}
        </div>

        {/* KAYDET */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-5">
          <p className="max-w-md text-xs leading-6 text-[#898D88]">
            Ürünü kaydettikten sonra ürün listesindeki
            görsel yönetimi butonuyla Cloudinary
            üzerinden görsellerini ekleyebilirsiniz.
          </p>

          <button
            type="submit"
            disabled={isBusy || categories.length === 0}
            className="inline-flex h-12 items-center justify-center gap-2 bg-[#A61922] px-8 text-sm font-semibold text-white transition-colors hover:bg-[#85141B] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isBusy ? (
              <LoaderCircle
                size={17}
                className="animate-spin"
              />
            ) : editingId ? (
              <Check size={17} />
            ) : (
              <Plus size={17} />
            )}

            {isBusy
              ? "Kaydediliyor..."
              : editingId
                ? "Ürünü Güncelle"
                : "Ürün Ekle"}
          </button>
        </div>
      </form>

      {/* BİLDİRİM */}
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

      {/* ÜRÜN LİSTESİ */}
      <section className="min-w-0">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#A61922]">
              ENVANTER
            </p>

            <h2 className="text-xl font-semibold tracking-tight">
              Mevcut Ürünler
            </h2>
          </div>

          <span className="text-xs text-[#898D88]">
            {products.length} ürün
          </span>
        </div>

        {products.length === 0 ? (
          <div className="border-y border-[#D9DCD6] py-16 text-center">
            <Package
              size={28}
              strokeWidth={1.4}
              className="mx-auto text-[#9A9F98]"
            />

            <p className="mt-4 text-sm text-[#747974]">
              Henüz ürün oluşturulmadı.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#D9DCD6] border-y border-[#D9DCD6]">
            {products.map((product) => {
              const images = product.images ?? [];

              const isImagePanelOpen =
                imageProductId === product.id;

              const mainImage = images[0] ?? null;

              return (
                <div
                  key={product.id}
                  className="min-w-0 py-6"
                >
                  {/* ÜRÜN SATIRI */}
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      {/* ANA GÖRSEL */}
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden bg-[#EAECE7]">
                        {mainImage ? (
                          <img
                            src={mainImage.url}
                            alt={product.name}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <ImagePlus
                            size={23}
                            strokeWidth={1.4}
                            className="text-[#A0A59E]"
                          />
                        )}
                      </div>

                      {/* ÜRÜN BİLGİLERİ */}
                      <div className="min-w-0">
                        <h3 className="break-words text-sm font-semibold leading-6 text-[#191C19]">
                          {product.name}
                        </h3>

                        <p className="mt-1 text-xs leading-5 text-[#898D88]">
                          {product.categoryName}
                          {" · "}
                          Stok: {product.stock}
                        </p>

                        <p className="mt-1 text-[11px] text-[#898D88]">
                          {images.length} görsel
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          {product.salePrice ? (
                            <>
                              <span className="text-sm font-semibold text-[#A61922]">
                                {currencyFormatter.format(
                                  Number(product.salePrice)
                                )}
                              </span>

                              <span className="text-xs text-[#898D88] line-through">
                                {currencyFormatter.format(
                                  Number(product.price)
                                )}
                              </span>
                            </>
                          ) : (
                            <span className="text-sm font-semibold">
                              {currencyFormatter.format(
                                Number(product.price)
                              )}
                            </span>
                          )}

                          {product.isNew && (
                            <span className="text-[10px] font-semibold text-[#46735C]">
                              YENİ
                            </span>
                          )}

                          {product.isBestSeller && (
                            <span className="text-[10px] font-semibold text-[#A61922]">
                              ÇOK SATAN
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* İŞLEM BUTONLARI */}
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() =>
                          runAction(
                            toggleProductAction,
                            product.id,
                            "Ürün durumu güncellendi."
                          )
                        }
                        className={`px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-50 ${
                          product.isActive
                            ? "bg-[#46735C]/10 text-[#46735C] hover:bg-[#46735C]/15"
                            : "bg-[#A61922]/10 text-[#A61922] hover:bg-[#A61922]/15"
                        }`}
                      >
                        {product.isActive
                          ? "Aktif"
                          : "Pasif"}
                      </button>

                      {/* GÖRSEL YÖNETİMİ */}
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() =>
                          handleToggleImages(product.id)
                        }
                        aria-label={`${product.name} görsellerini yönet`}
                        title="Görselleri Yönet"
                        aria-expanded={isImagePanelOpen}
                        className={`inline-flex h-9 w-9 items-center justify-center transition-colors disabled:opacity-50 ${
                          isImagePanelOpen
                            ? "bg-[#A61922] text-white"
                            : "text-[#747974] hover:bg-[#A61922]/5 hover:text-[#A61922]"
                        }`}
                      >
                        <Images size={18} />
                      </button>

                      {/* DÜZENLE */}
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() =>
                          handleEdit(product)
                        }
                        aria-label={`${product.name} düzenle`}
                        title="Ürünü Düzenle"
                        className="inline-flex h-9 w-9 items-center justify-center text-[#747974] transition-colors hover:bg-[#A61922]/5 hover:text-[#A61922] disabled:opacity-50"
                      >
                        <Pencil size={17} />
                      </button>

                      {/* SİL */}
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() =>
                          handleDelete(product)
                        }
                        aria-label={`${product.name} sil`}
                        title="Ürünü Sil"
                        className="inline-flex h-9 w-9 items-center justify-center text-[#747974] transition-colors hover:bg-[#A61922]/5 hover:text-[#A61922] disabled:opacity-50"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>

                  {/* ÜRÜNE ÖZEL GÖRSEL YÖNETİMİ */}
                  {isImagePanelOpen && (
                    <ProductImageManager
                      productId={product.id}
                      productName={product.name}
                      images={images}
                      onClose={() =>
                        setImageProductId(null)
                      }
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
