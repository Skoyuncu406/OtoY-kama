
"use client";

import { useMemo, useRef, useState, useTransition } from "react";
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
  Search,
  Save,
  AlertTriangle,
  PackageX,
} from "lucide-react";

import {
  createProductAction,
  updateProductAction,
  toggleProductAction,
  deleteProductAction,
  updateProductStockAction,
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
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [stockEditingId, setStockEditingId] = useState(null);
  const [stockDraft, setStockDraft] = useState("");

  const [pending, startTransition] = useTransition();

  const formRef = useRef(null);

  const isBusy = pending;

  const stockStats = useMemo(() => ({
    total: products.length,
    low: products.filter((product) => product.stock >= 1 && product.stock <= 5).length,
    out: products.filter((product) => product.stock === 0).length,
  }), [products]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("tr-TR");
    return products.filter((product) => {
      const matchesSearch = !query ||
        product.name.toLocaleLowerCase("tr-TR").includes(query) ||
        product.categoryName.toLocaleLowerCase("tr-TR").includes(query);
      const matchesStock = stockFilter === "all" ||
        (stockFilter === "available" && product.stock > 5) ||
        (stockFilter === "low" && product.stock >= 1 && product.stock <= 5) ||
        (stockFilter === "out" && product.stock === 0);
      return matchesSearch && matchesStock;
    });
  }, [products, search, stockFilter]);

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

  function beginStockEdit(product) {
    if (isBusy) return;
    setStockEditingId(product.id);
    setStockDraft(String(product.stock));
    setMessage(null);
  }

  function cancelStockEdit() {
    setStockEditingId(null);
    setStockDraft("");
  }

  function saveStock(product) {
    if (isBusy) return;
    const raw = stockDraft.trim();
    const value = Number(raw);
    if (!/^\d+$/.test(raw) || !Number.isSafeInteger(value) || value > 1000000) {
      setMessage({ type: "error", text: "Stok miktarı 0 ile 1.000.000 arasında tam sayı olmalıdır." });
      return;
    }
    if (value === product.stock) {
      cancelStockEdit();
      return;
    }
    const data = new FormData();
    data.set("id", product.id);
    data.set("stock", raw);
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await updateProductStockAction(data);
        if (result.success) {
          cancelStockEdit();
          setMessage({ type: "success", text: `“${product.name}” stok miktarı ${value} olarak güncellendi.` });
        } else {
          setMessage({ type: "error", text: result.error ?? "Stok güncellenemedi." });
        }
      } catch (error) {
        console.error("Stok güncelleme hatası:", error);
        setMessage({ type: "error", text: "Stok güncellenirken bir hata oluştu." });
      }
    });
  }

  function handleEdit(product) {
    if (isBusy) return;

    setEditingId(product.id);
    setImageProductId(null);
    cancelStockEdit();

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
  updateProductStockAction,
      product.id,
      "Ürün başarıyla silindi.",
      () => {
        if (editingId === product.id) {
          resetForm();
        }

        if (stockEditingId === product.id) cancelStockEdit();

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

      {/* STOK ÖZETİ */}
      <section aria-label="Stok özeti" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: "Toplam Ürün", value: stockStats.total, icon: Package, color: "text-[#191C19]" },
          { label: "Kritik Stok (1–5)", value: stockStats.low, icon: AlertTriangle, color: "text-[#A66B20]" },
          { label: "Tükenen Ürün", value: stockStats.out, icon: PackageX, color: "text-[#A61922]" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="min-w-0 border-b border-[#D9DCD6] bg-white/40 px-5 py-5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-medium text-[#747974]">{label}</span>
              <Icon size={18} className={color} strokeWidth={1.6} />
            </div>
            <p className={`mt-4 text-3xl font-semibold tracking-tight ${color}`}>{value}</p>
          </div>
        ))}
      </section>

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

        <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <label className="relative block w-full md:max-w-sm">
            <span className="mb-2 block text-xs font-semibold text-[#626862]">Ürün veya kategori ara</span>
            <Search size={17} className="pointer-events-none absolute bottom-4 left-0 text-[#898D88]" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Ürün adı veya kategori..."
              className={`${inputClass} pl-7`}
            />
          </label>
          <div className="flex flex-wrap gap-2" aria-label="Stok filtresi">
            {[
              { key: "all", label: "Tümü" },
              { key: "available", label: "Stokta (6+)" },
              { key: "low", label: "Kritik (1–5)" },
              { key: "out", label: "Tükenen (0)" },
            ].map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setStockFilter(filter.key)}
                aria-pressed={stockFilter === filter.key}
                className={`px-3 py-2 text-xs font-semibold transition-colors ${
                  stockFilter === filter.key
                    ? "bg-[#191C19] text-white"
                    : "border border-[#D9DCD6] text-[#747974] hover:border-[#A61922] hover:text-[#A61922]"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
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
        ) : filteredProducts.length === 0 ? (
          <div className="border-y border-[#D9DCD6] py-14 text-center text-sm text-[#747974]">
            Arama ve stok filtresine uygun ürün bulunamadı.
          </div>
        ) : (
          <div className="divide-y divide-[#D9DCD6] border-y border-[#D9DCD6]">
            {filteredProducts.map((product) => {
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
                        </p>

                        <p className={`mt-1 text-xs font-semibold ${
                          product.stock === 0
                            ? "text-[#A61922]"
                            : product.stock <= 5
                              ? "text-[#A66B20]"
                              : "text-[#46735C]"
                        }`}>
                          {product.stock === 0
                            ? "Stok tükendi"
                            : product.stock <= 5
                              ? `Kritik stok · ${product.stock} adet`
                              : `Stokta · ${product.stock} adet`}
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

                  {/* HIZLI STOK GÜNCELLEME */}
                  <div className="mt-4 flex flex-wrap items-center gap-3 sm:pl-24">
                    {stockEditingId === product.id ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <label htmlFor={`stock-${product.id}`} className="text-xs font-medium text-[#626862]">Yeni stok</label>
                        <input
                          id={`stock-${product.id}`}
                          type="number"
                          min="0"
                          max="1000000"
                          step="1"
                          value={stockDraft}
                          disabled={isBusy}
                          onChange={(event) => setStockDraft(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") { event.preventDefault(); saveStock(product); }
                            if (event.key === "Escape") cancelStockEdit();
                          }}
                          className="h-9 w-28 border-b border-[#C8CCC5] bg-transparent px-2 text-sm outline-none focus:border-[#A61922] focus:outline-none focus:ring-0"
                        />
                        <button type="button" disabled={isBusy} onClick={() => saveStock(product)} className="inline-flex h-9 items-center gap-1.5 bg-[#A61922] px-3 text-xs font-semibold text-white hover:bg-[#85141B] disabled:opacity-50">
                          {isBusy ? <LoaderCircle size={14} className="animate-spin" /> : <Save size={14} />}
                          Kaydet
                        </button>
                        <button type="button" disabled={isBusy} onClick={cancelStockEdit} className="inline-flex h-9 items-center gap-1 px-2 text-xs text-[#747974] hover:text-[#A61922] disabled:opacity-50">
                          <X size={14} /> Vazgeç
                        </button>
                      </div>
                    ) : (
                      <button type="button" disabled={isBusy} onClick={() => beginStockEdit(product)} className="inline-flex items-center gap-2 text-xs font-semibold text-[#747974] transition-colors hover:text-[#A61922] disabled:opacity-50">
                        <Pencil size={14} /> Stoku Hızlı Güncelle
                      </button>
                    )}
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
