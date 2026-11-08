"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  Heart,
  ImageOff,
  LoaderCircle,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import FavoriteLoginModal from "@/components/products/FavoriteLoginModal";

const formatPrice = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 2,
});

export default function FavoritesPage() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loginRequired, setLoginRequired] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [addedId, setAddedId] = useState(null);
  const [error, setError] = useState("");

  const loadFavorites = useCallback(async (signal) => {
    try {
      const response = await fetch("/api/store/favorites", {
        cache: "no-store",
        credentials: "same-origin",
        signal,
      });
      if (signal?.aborted) return;
      if (response.status === 401) {
        setLoginRequired(true);
        setProducts([]);
        setError("");
        return;
      }
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Favoriler yüklenemedi.");
      setLoginRequired(false);
      setProducts(Array.isArray(data.products) ? data.products : []);
      setError("");
    } catch (err) {
      if (err.name !== "AbortError") setError(err.message || "Favoriler yüklenemedi.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadFavorites(controller.signal);
    const handleUpdate = () => loadFavorites(controller.signal);
    window.addEventListener("vicix:favorites-updated", handleUpdate);
    return () => {
      controller.abort();
      window.removeEventListener("vicix:favorites-updated", handleUpdate);
    };
  }, [loadFavorites]);

  async function removeFavorite(productId) {
    if (removingId !== null) return;
    setRemovingId(productId);
    setError("");
    try {
      const response = await fetch("/api/store/favorites", {
        method: "DELETE",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (response.status === 401) {
        setLoginRequired(true);
        setLoginModalOpen(true);
        return;
      }
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Ürün favorilerden çıkarılamadı.");
      setProducts((current) => current.filter((product) => product.id !== productId));
      window.dispatchEvent(new Event("vicix:favorites-updated"));
    } catch (err) {
      setError(err.message || "Bir bağlantı hatası oluştu.");
    } finally {
      setRemovingId(null);
    }
  }

  function handleAddToCart(product) {
    setError("");
    const added = addToCart(product, 1);
    if (!added) {
      setError("Bu ürün şu anda sepete eklenemiyor.");
      return;
    }
    setAddedId(product.id);
    window.setTimeout(() => {
      setAddedId((current) => (current === product.id ? null : current));
    }, 1800);
  }

  return (
    <main className="min-h-screen w-full min-w-0 overflow-x-clip bg-[#F4F3EF] text-[#111312]">
      <div className="revora-container pb-20 sm:pb-24">
        <header className="border-b border-[#D8DBD7] pb-8 pt-10 sm:pb-10 sm:pt-14 lg:pb-12 lg:pt-16">
          <p className="mb-5 flex items-center gap-3 font-[family-name:var(--font-manrope)] text-[10px] font-bold uppercase tracking-[0.2em] text-[#69716A]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#8DCC27]" />
            VICIX / HESABIM
          </p>
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <h1 className="font-[family-name:var(--font-manrope)] text-[clamp(2.5rem,6vw,5.5rem)] font-semibold leading-[1.04] tracking-[-0.06em]">
                Favorilerim<span className="text-[#9AA09A]">.</span>
              </h1>
              <p className="mt-4 text-[12px] leading-6 text-[#69716A] sm:text-[13px]">
                Beğendiğiniz ürünler, tek bir yerde.
              </p>
            </div>
            {!loading && !loginRequired && (
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#69716A]">
                {products.length} ürün
              </span>
            )}
          </div>
        </header>

        {error && (
          <div role="alert" className="mt-6 flex flex-wrap items-center justify-between gap-3 border border-[#A61922]/30 px-4 py-3 text-[12px] text-[#A61922]">
            <span>{error}</span>
            <button type="button" onClick={() => { setLoading(true); loadFavorites(); }} className="font-bold underline">Yeniden dene</button>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[350px] items-center justify-center gap-3 text-[12px] text-[#69716A]" role="status">
            <LoaderCircle size={19} className="animate-spin" /> Favoriler yükleniyor...
          </div>
        ) : loginRequired ? (
          <EmptyState
            icon={Heart}
            title="Favorilerinizi görmek için giriş yapın."
            description="Beğendiğiniz ürünleri hesabınızda saklayabilir, dilediğiniz zaman yeniden inceleyebilirsiniz."
            actionLabel="Giriş Yap"
            onAction={() => setLoginModalOpen(true)}
          />
        ) : products.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Henüz favori ürününüz yok."
            description="Beğendiğiniz ürünleri favorilerinize ekleyerek burada biriktirebilirsiniz."
            actionLabel="Ürünleri Keşfet"
            href="/urunler"
          />
        ) : (
          <section aria-label="Favori ürünler" className="grid min-w-0 grid-cols-2 gap-x-3 gap-y-10 pt-9 sm:gap-x-6 sm:gap-y-12 sm:pt-12 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => {
              const href = `/urunler/${product.id}`;
              const outOfStock = Number(product.stock) <= 0;
              const hasDiscount = product.salePrice != null && Number(product.salePrice) < Number(product.originalPrice);
              const justAdded = addedId === product.id;
              const isRemoving = removingId === product.id;
              return (
                <article key={product.id} className="group flex min-w-0 flex-col">
                  <div className="relative aspect-[4/5] overflow-hidden bg-[#E6E8E3]">
                    <Link href={href} aria-label={`${product.name} ürününü incele`} className="absolute inset-0 block">
                      {product.image ? (
                        <Image src={product.image} alt={product.name} fill sizes="(max-width: 639px) 50vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 25vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.045]" />
                      ) : (
                        <span className="flex h-full flex-col items-center justify-center gap-2 text-[11px] text-[#858B85]"><ImageOff size={24} />Görsel hazırlanıyor</span>
                      )}
                    </Link>
                    {product.isNew ? (
                      <span className="pointer-events-none absolute left-3 top-3 bg-[#B7FF3C] px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-[#111312]">Yeni</span>
                    ) : product.isBestSeller ? (
                      <span className="pointer-events-none absolute left-3 top-3 bg-[#111312] px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-white">Çok Satan</span>
                    ) : null}
                  </div>
                  <div className="mt-4 flex flex-1 flex-col border-b border-[#D8DBD7] pb-5 sm:mt-5">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={href} className="min-w-0 flex-1">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#858B85]">{product.categoryName}</p>
                        <h2 className="mt-2 font-[family-name:var(--font-manrope)] text-[12px] font-semibold leading-5 tracking-[-0.02em] transition-colors hover:text-[#A61922] sm:text-[15px]">{product.name}</h2>
                      </Link>
                      <Link href={href} aria-label="Ürün detayına git" className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#D8DBD7] transition-colors hover:border-[#111312] sm:h-9 sm:w-9"><ArrowUpRight size={16} /></Link>
                    </div>
                    <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      {hasDiscount && <span className="text-[11px] text-[#858B85] line-through">{formatPrice.format(product.originalPrice)}</span>}
                      <span className="font-[family-name:var(--font-manrope)] text-[12px] font-bold sm:text-[15px]">{formatPrice.format(product.price)}</span>
                    </div>
                    <div className="mt-auto space-y-2 pt-5">
                      <button type="button" disabled={outOfStock} onClick={() => handleAddToCart(product)} className={`flex min-h-[46px] w-full items-center justify-center gap-2 border px-2 font-[family-name:var(--font-manrope)] text-[9px] font-bold uppercase tracking-[0.04em] transition-colors duration-300 sm:min-h-[48px] sm:text-[11px] ${outOfStock ? "cursor-not-allowed border-[#D8DBD7] bg-[#E6E8E3] text-[#858B85]" : justAdded ? "border-[#2E6B3F] !bg-[#2E6B3F] !text-white" : "border-[#111312] !bg-[#111312] !text-white hover:!border-[#A61922] hover:!bg-[#A61922]"}`}>
                        {justAdded ? <Check size={16} /> : <ShoppingBag size={16} />}
                        <span className="!text-inherit">{outOfStock ? "Stokta Yok" : justAdded ? "Sepete Eklendi" : "Sepete Ekle"}</span>
                      </button>
                      <button type="button" disabled={isRemoving} onClick={() => removeFavorite(product.id)} className="flex min-h-[44px] w-full items-center justify-center gap-2 border border-[#C8CDC7] bg-transparent px-2 text-[9px] font-semibold uppercase tracking-[0.04em] text-[#A61922] transition-colors hover:border-[#A61922] hover:bg-[#FBEAEC] disabled:opacity-50 sm:min-h-[46px] sm:text-[10px]">
                        {isRemoving ? <LoaderCircle size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        Favorilerden Çıkar
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
      <FavoriteLoginModal open={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </main>
  );
}

function EmptyState({ icon: Icon, title, description, actionLabel, href, onAction }) {
  return (
    <div className="flex min-h-[390px] flex-col items-center justify-center px-4 py-16 text-center">
      <Icon size={34} strokeWidth={1.2} className="text-[#858B85]" />
      <h2 className="mt-6 max-w-[420px] font-[family-name:var(--font-manrope)] text-xl font-semibold tracking-[-0.04em] sm:text-2xl">{title}</h2>
      <p className="mt-3 max-w-[400px] text-[12px] leading-7 text-[#69716A]">{description}</p>
      {href ? (
        <Link href={href} className="mt-8 inline-flex min-h-[50px] items-center justify-center border border-[#111312] !bg-[#111312] px-7 text-[11px] font-bold uppercase tracking-[0.1em] !text-white transition-colors hover:!border-[#A61922] hover:!bg-[#A61922]">{actionLabel}</Link>
      ) : (
        <button type="button" onClick={onAction} className="mt-8 min-h-[50px] border border-[#111312] !bg-[#111312] px-7 text-[11px] font-bold uppercase tracking-[0.1em] !text-white transition-colors hover:!border-[#A61922] hover:!bg-[#A61922]">{actionLabel}</button>
      )}
    </div>
  );
}
