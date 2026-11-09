
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  ArrowUpRight,
  ImageIcon,
  ShoppingBag,
  Heart,
  LoaderCircle,
  Check,
} from "lucide-react";

import { useCart } from "@/context/CartContext";
import FavoriteLoginModal from "@/components/products/FavoriteLoginModal";

const priceFormatter = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 2,
});

export default function FeaturedProducts({ products = [] }) {
  const { addToCart } = useCart();

  const [favoriteIds, setFavoriteIds] = useState([]);
  const [favoriteLoading, setFavoriteLoading] = useState(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [favoriteError, setFavoriteError] = useState("");

  const [addedProductId, setAddedProductId] = useState(null);
  const [cartError, setCartError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadFavorites() {
      try {
        const response = await fetch("/api/store/favorites", {
          cache: "no-store",
          credentials: "same-origin",
        });

        if (!response.ok) {
          if (!cancelled) setFavoriteIds([]);
          return;
        }

        const data = await response.json();

        if (!cancelled) {
          setFavoriteIds(
            Array.isArray(data.productIds) ? data.productIds : []
          );
        }
      } catch (error) {
        console.error("Favoriler yüklenemedi:", error);
      }
    }

    loadFavorites();

    const onUpdated = () => loadFavorites();

    window.addEventListener(
      "vicix:favorites-updated",
      onUpdated
    );

    return () => {
      cancelled = true;

      window.removeEventListener(
        "vicix:favorites-updated",
        onUpdated
      );
    };
  }, []);

  async function toggleFavorite(productId) {
    if (favoriteLoading !== null) return;

    setFavoriteLoading(productId);
    setFavoriteError("");

    try {
      const response = await fetch("/api/store/favorites", {
        method: favoriteIds.includes(productId)
          ? "DELETE"
          : "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });

      if (response.status === 401) {
        setFavoriteIds([]);
        setLoginModalOpen(true);
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        setFavoriteError(
          data.error || "Favori işlemi gerçekleştirilemedi."
        );
        return;
      }

      setFavoriteIds((previous) =>
        data.isFavorite
          ? previous.includes(productId)
            ? previous
            : [...previous, productId]
          : previous.filter((id) => id !== productId)
      );

      window.dispatchEvent(
        new Event("vicix:favorites-updated")
      );
    } catch (error) {
      console.error("Favori işlemi:", error);

      setFavoriteError(
        "Bağlantı hatası oluştu. Lütfen tekrar deneyin."
      );
    } finally {
      setFavoriteLoading(null);
    }
  }

  function handleAddToCart(product) {
    setCartError("");

    const success = addToCart(product, 1);

    if (!success) {
      setCartError(
        `${product.name} şu anda sepete eklenemiyor.`
      );
      return;
    }

    setAddedProductId(product.id);

    window.setTimeout(() => {
      setAddedProductId((current) =>
        current === product.id ? null : current
      );
    }, 1800);
  }

  const collections = [
    {
      id: "yeni-gelenler",
      eyebrow: "VICIX / YENİ KOLEKSİYON",
      title: "Yeni",
      accent: "gelenler.",
      description:
        "Detailing dünyasının yeni ürünleriyle tanışın. Araç bakımında yenilikçi çözümleri keşfedin.",
      href: "/urunler?koleksiyon=yeni-gelenler",
      products: products
        .filter((item) => item.isNew)
        .slice(0, 4),
    },
    {
      id: "cok-satanlar",
      eyebrow: "VICIX / EN ÇOK TERCİH EDİLENLER",
      title: "Çok",
      accent: "satanlar.",
      description:
        "En çok tercih edilen bakım ürünlerini keşfedin. Profesyonel sonuçlar için özenle seçilmiş ürünler.",
      href: "/urunler?koleksiyon=cok-satanlar",
      products: products
        .filter((item) => item.isBestSeller)
        .slice(0, 4),
    },
  ];

  return (
    <div className="w-full overflow-x-clip bg-[#F4F3EF]">
      {collections.map((collection, index) => (
        <section
          key={collection.id}
          id={collection.id}
          className={`
            w-full
            scroll-mt-[var(--site-header-height)]
            py-12 sm:py-16 lg:py-20
            ${
              index > 0
                ? "border-t border-[#D8DBD7]"
                : ""
            }
          `}
        >
          <div className="revora-container">
            {/* COLLECTION HEADER */}
            <div className="mb-9 flex flex-col justify-between gap-6 border-b border-[#D8DBD7] pb-8 md:mb-11 md:flex-row md:items-end">
              <div>
                <p className="mb-4 flex items-center gap-3 font-[family-name:var(--font-manrope)] text-[10px] font-bold uppercase tracking-[0.2em] text-[#626A64]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8DCC27]" />
                  {collection.eyebrow}
                </p>

                <h2 className="font-[family-name:var(--font-manrope)] text-[clamp(2.3rem,5vw,4.8rem)] font-semibold leading-[1.04] tracking-[-0.055em] text-[#111312]">
                  {collection.title}

                  <span className="ml-3 text-[#858B85]">
                    {collection.accent}
                  </span>
                </h2>
              </div>

              <div className="flex max-w-[340px] flex-col items-start gap-5 md:items-end">
                <p className="text-[12px] leading-7 text-[#626A64] md:text-right">
                  {collection.description}
                </p>

                <Link
                  href={collection.href}
                  scroll
                  className="group inline-flex items-center gap-3 border-b border-[#111312] pb-2 font-[family-name:var(--font-manrope)] text-[11px] font-bold uppercase tracking-[0.09em] text-[#111312] transition-colors duration-300 hover:text-[#719C26]"
                >
                  Tüm Ürünler

                  <ArrowUpRight
                    size={16}
                    strokeWidth={1.7}
                    className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </Link>
              </div>
            </div>

            {/* PRODUCTS */}
            {collection.products.length > 0 ? (
              <div className="grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-5 sm:gap-y-11 lg:grid-cols-4 lg:gap-x-6">
                {collection.products.map((product) => (
                  <FeaturedProductCard
                    key={product.id}
                    product={product}
                    isFavorite={favoriteIds.includes(
                      product.id
                    )}
                    favoriteLoading={
                      favoriteLoading === product.id
                    }
                    onToggleFavorite={toggleFavorite}
                    onAddToCart={handleAddToCart}
                    addedToCart={
                      addedProductId === product.id
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="py-14 text-center text-[13px] text-[#626A64]">
                Bu koleksiyonda henüz ürün bulunmuyor.
              </div>
            )}
          </div>
        </section>
      ))}

      {/* ERROR MESSAGES */}
      {(favoriteError || cartError) && (
        <div
          role="alert"
          className="fixed bottom-20 left-1/2 z-[250] w-[min(90vw,440px)] -translate-x-1/2 bg-[#111312] px-5 py-4 text-center text-[12px] text-white shadow-lg"
        >
          {favoriteError || cartError}

          <button
            type="button"
            onClick={() => {
              setFavoriteError("");
              setCartError("");
            }}
            className="ml-3 underline"
          >
            Kapat
          </button>
        </div>
      )}

      <FavoriteLoginModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </div>
  );
}

function FeaturedProductCard({
  product,
  isFavorite,
  favoriteLoading,
  onToggleFavorite,
  onAddToCart,
  addedToCart,
}) {
  const href = `/urunler/${product.id}`;

  const hasDiscount =
    product.salePrice != null &&
    product.originalPrice != null &&
    product.salePrice < product.originalPrice;

  const outOfStock =
    product.stock != null &&
    Number(product.stock) <= 0;

  return (
    <article className="group flex min-w-0 flex-col">
      {/* PRODUCT IMAGE */}
      <div className="relative aspect-[4/5] overflow-hidden bg-[#E6E8E3]">
        <Link
          href={href}
          aria-label={`${product.name} ürününü incele`}
          className="absolute inset-0 block"
        >
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 639px) 50vw, (max-width: 1023px) 50vw, 25vw"
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045]"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-[#858B85]">
              <ImageIcon
                size={25}
                strokeWidth={1.2}
              />

              <span className="text-[11px]">
                Görsel hazırlanıyor
              </span>
            </div>
          )}
        </Link>

        {/* PRODUCT BADGES */}
        {product.isNew ? (
          <span className="pointer-events-none absolute left-3 top-3 bg-[#B7FF3C] px-2.5 py-1.5 font-[family-name:var(--font-manrope)] text-[9px] font-bold uppercase tracking-[0.08em] text-[#111312]">
            Yeni
          </span>
        ) : product.isBestSeller ? (
          <span className="pointer-events-none absolute left-3 top-3 bg-[#111312] px-2.5 py-1.5 font-[family-name:var(--font-manrope)] text-[9px] font-bold uppercase tracking-[0.08em] text-white">
            Çok Satan
          </span>
        ) : null}
      </div>

      {/* PRODUCT INFORMATION */}
      <div className="mt-4 flex flex-1 flex-col border-b border-[#D8DBD7] pb-5 sm:mt-5">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={href}
            className="min-w-0 flex-1"
          >
            <p className="font-[family-name:var(--font-manrope)] text-[9px] font-semibold uppercase tracking-[0.12em] text-[#858B85]">
              {product.categoryName}
            </p>

            <h3 className="mt-2 font-[family-name:var(--font-manrope)] text-[12px] font-semibold leading-5 tracking-[-0.02em] text-[#111312] transition-colors hover:text-[#A61922] sm:text-[15px]">
              {product.name}
            </h3>
          </Link>

          <Link
            href={href}
            aria-label={`${product.name} detaylarını görüntüle`}
            className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#D8DBD7] text-[#111312] transition-colors duration-300 hover:border-[#111312] sm:h-9 sm:w-9"
          >
            <ArrowUpRight
              size={16}
              strokeWidth={1.6}
            />
          </Link>
        </div>

        {/* PRICE */}
        <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          {hasDiscount && (
            <span className="text-[11px] font-normal text-[#858B85] line-through">
              {priceFormatter.format(
                product.originalPrice
              )}
            </span>
          )}

          <span className="font-[family-name:var(--font-manrope)] text-[12px] font-bold text-[#111312] sm:text-[15px]">
            {priceFormatter.format(product.price)}
          </span>
        </div>

        {/* ACTION BUTTONS */}
        <div className="mt-auto space-y-2 pt-5">
          {/* ADD TO CART */}
          <button
            type="button"
            disabled={outOfStock}
            onClick={() => onAddToCart(product)}
            aria-label={
              outOfStock
                ? `${product.name} stokta yok`
                : `${product.name} ürününü sepete ekle`
            }
            className={`
              group/cart flex min-h-[46px] w-full
              items-center justify-center gap-2
              border px-2
              font-[family-name:var(--font-manrope)]
              text-[9px] font-bold uppercase
              tracking-[0.04em]
              transition-all duration-300
              sm:min-h-[48px] sm:gap-3
              sm:px-4 sm:text-[11px]
              sm:tracking-[0.08em]
              ${
                outOfStock
                  ? "cursor-not-allowed border-[#D8DBD7] bg-[#E6E8E3] text-[#858B85]"
                  : addedToCart
                    ? "border-[#2E6B3F] !bg-[#2E6B3F] !text-white"
                    : "border-[#111312] !bg-[#111312] !text-white hover:!border-[#A61922] hover:!bg-[#A61922]"
              }
            `}
          >
            {addedToCart ? (
              <Check
                size={16}
                strokeWidth={1.8}
              />
            ) : (
              <ShoppingBag
                size={16}
                strokeWidth={1.6}
              />
            )}

            <span className="!text-inherit">
              {outOfStock
                ? "Stokta Yok"
                : addedToCart
                  ? "Sepete Eklendi"
                  : "Sepete Ekle"}
            </span>
          </button>

          {/* FAVORITE */}
          <button
            type="button"
            disabled={favoriteLoading}
            onClick={() =>
              onToggleFavorite(product.id)
            }
            aria-pressed={isFavorite}
            aria-label={
              isFavorite
                ? `${product.name} ürününü favorilerden çıkar`
                : `${product.name} ürününü favorilere ekle`
            }
            className={`
              group/favorite flex min-h-[44px] w-full
              items-center justify-center gap-2
              border px-2
              font-[family-name:var(--font-manrope)]
              text-[9px] font-semibold uppercase
              tracking-[0.04em]
              transition-all duration-300
              disabled:cursor-wait
              disabled:opacity-60
              sm:min-h-[46px] sm:gap-3
              sm:px-4 sm:text-[10px]
              sm:tracking-[0.07em]
              ${
                isFavorite
                  ? "border-[#A61922] bg-[#F4F3EF] text-[#A61922] hover:bg-[#FBEAEC]"
                  : "border-[#C8CDC7] bg-transparent text-[#111312] hover:border-[#A61922] hover:text-[#A61922]"
              }
            `}
          >
            {favoriteLoading ? (
              <LoaderCircle
                size={16}
                strokeWidth={1.7}
                className="animate-spin"
              />
            ) : (
              <Heart
                size={16}
                strokeWidth={1.7}
                className={`
                  transition-[fill,transform,color]
                  duration-[250ms]
                  ease-out
                  motion-reduce:transition-none
                  group-hover/favorite:scale-110
                  ${
                    isFavorite
                      ? "fill-current text-[#A61922]"
                      : "fill-none group-hover/favorite:fill-[#A61922] group-hover/favorite:text-[#A61922]"
                  }
                `}
              />
            )}

            <span>
              {isFavorite
                ? "Favorilerden Çıkar"
                : "Favorilere Ekle"}
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}
