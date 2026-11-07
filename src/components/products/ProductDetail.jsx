
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RotateCcw,
  ChevronDown,
  ImageOff,
} from "lucide-react";

const formatPrice = (price) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(price);

export default function ProductDetail({ product }) {
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [activeImage, setActiveImage] = useState(0);

  const galleryImages = [
    ...new Set(
      (
        Array.isArray(product.images) && product.images.length > 0
          ? product.images
          : [product.image]
      ).filter(Boolean)
    ),
  ];

  const stock = Math.max(0, Number(product.stock ?? 0));
  const maxQuantity = Math.min(99, stock);
  const outOfStock = stock === 0;

  const hasDiscount =
    product.salePrice != null &&
    Number(product.salePrice) < Number(product.originalPrice);

  useEffect(() => {
    setActiveImage(0);
    setQuantity(1);
    setIsFavorite(false);
    setActiveAccordion(null);
  }, [product.id]);

  const changeQuantity = (amount) => {
    setQuantity((current) =>
      Math.max(1, Math.min(maxQuantity || 1, current + amount))
    );
  };

  const accordionItems = [
    {
      id: "description",
      title: "Ürün Açıklaması",
      content:
        product.description ||
        "Bu ürün için henüz açıklama eklenmemiş.",
    },
    {
      id: "usage",
      title: "Kullanım Bilgileri",
      content:
        product.details ||
        "Bu ürün için henüz kullanım bilgisi eklenmemiş.",
    },
    {
      id: "shipping",
      title: "Teslimat & İade",
      content:
        "Kargo süreleri, teslimat koşulları ve iade bilgileri mağaza politikaları belirlendiğinde burada gösterilecektir.",
    },
  ];

  return (
    <main
      className="
        w-full min-w-0 overflow-x-clip
        bg-[var(--background)]
        text-[var(--foreground)]
        lg:h-[calc(100dvh-var(--site-header-height,0px)-var(--header-height,80px))]
        lg:overflow-hidden
      "
    >
      <div
        className="
          mx-auto flex h-full w-full max-w-[1440px]
          flex-col px-5 pb-24 pt-5
          sm:px-8
          lg:px-12 lg:pb-5 lg:pt-5
          xl:px-16
        "
      >
        {/* BREADCRUMB */}
        <div className="flex shrink-0 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2 text-[10px] font-medium tracking-[0.08em] text-[#858B85]">
            <Link href="/" className="transition-colors hover:text-[#111312]">
              Ana Sayfa
            </Link>

            <span>/</span>

            <Link
              href="/urunler"
              className="transition-colors hover:text-[#111312]"
            >
              Ürünler
            </Link>

            <span>/</span>

            <span className="truncate text-[#111312]">
              {product.name}
            </span>
          </div>

          <Link
            href="/urunler"
            className="hidden shrink-0 items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] transition-opacity hover:opacity-60 sm:inline-flex"
          >
            <ArrowLeft size={14} strokeWidth={1.5} />
            Ürünlere Dön
          </Link>
        </div>

        {/* PRODUCT LAYOUT */}
        <div
          className="
            grid min-h-0 flex-1 grid-cols-1
            items-center gap-8 pt-6
            lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]
            lg:gap-12 lg:pt-3
            xl:gap-16
          "
        >
          {/* PRODUCT GALLERY */}
          <div
            className="
              flex min-h-0 min-w-0 w-full
              flex-col gap-3
              lg:h-full lg:max-h-[650px]
              lg:flex-row lg:gap-4
            "
          >
            {/* MAIN IMAGE */}
            <div
              className="
                relative min-h-[350px] w-full min-w-0
                flex-1 overflow-hidden
                bg-[var(--background)]
                sm:min-h-[450px]
                lg:h-full lg:min-h-0
              "
            >
              {galleryImages.length > 0 ? (
                <Image
                  key={galleryImages[activeImage]}
                  src={galleryImages[activeImage]}
                  alt={`${product.name} - Görsel ${activeImage + 1}`}
                  fill
                  priority={activeImage === 0}
                  sizes="(max-width: 1023px) 100vw, 55vw"
                  className="
                    object-cover object-center
                    animate-[vicixImageFade_350ms_ease-out]
                  "
                />
              ) : (
                <div className="flex h-full min-h-[350px] flex-col items-center justify-center gap-3 text-[#858B85]">
                  <ImageOff size={28} strokeWidth={1.2} />
                  <span className="text-xs">
                    Görsel hazırlanıyor
                  </span>
                </div>
              )}

              {product.isNew && (
                <span
                  className="
                    absolute left-4 top-4 z-10
                    bg-[#B7FF3C] px-3 py-2
                    text-[9px] font-bold uppercase
                    tracking-[0.12em] text-[#111312]
                  "
                >
                  Yeni Ürün
                </span>
              )}

              <span
                className="
                  absolute bottom-4 left-4 z-10
                  bg-[var(--background)]/85
                  px-2 py-1 text-[9px]
                  font-medium uppercase tracking-[0.18em]
                  text-[#858B85]
                "
              >
                VICIX CAR CARE
              </span>
            </div>

            {/* THUMBNAILS */}
            {galleryImages.length > 1 && (
              <div
                aria-label="Ürün görselleri"
                className="
                  flex w-full shrink-0 flex-row
                  justify-center gap-2 overflow-x-auto pb-1
                  lg:w-[76px] lg:flex-col
                  lg:justify-start lg:overflow-x-hidden
                  lg:overflow-y-auto lg:pb-0
                  xl:w-[86px]
                "
              >
                {galleryImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    aria-label={`${product.name} - Görsel ${index + 1}`}
                    aria-pressed={activeImage === index}
                    className={`
                      relative aspect-square h-[65px] w-[65px]
                      shrink-0 overflow-hidden border
                      bg-[#F0EEE9]
                      transition-all duration-300
                      hover:border-[#111312]
                      sm:h-[72px] sm:w-[72px]
                      lg:h-[76px] lg:w-full
                      xl:h-[86px]
                      ${
                        activeImage === index
                          ? "border-[#111312]"
                          : "border-transparent"
                      }
                    `}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} küçük görsel ${index + 1}`}
                      fill
                      sizes="86px"
                      className="object-contain p-2 transition-transform duration-300 hover:scale-[1.06]"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* PRODUCT INFORMATION */}
          <div
            className="
              flex min-h-0 w-full min-w-0
              flex-col justify-center
              lg:max-h-full lg:overflow-y-auto
              lg:py-2
              [scrollbar-width:thin]
            "
          >
            {/* CATEGORY */}
            <div className="mb-4 flex items-center justify-between gap-4">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#858B85]">
                {product.categoryName || "Araç Bakım"}
              </span>

              <span className="max-w-[50%] truncate text-right text-[9px] font-medium uppercase tracking-[0.12em] text-[#858B85]">
                VICIX / {product.slug || String(product.id).slice(-8).toUpperCase()}
              </span>
            </div>

            {/* TITLE */}
            <h1
              className="
                max-w-[540px]
                font-[family-name:var(--font-manrope)]
                text-[clamp(25px,3vw,43px)]
                font-semibold leading-[1.13]
                tracking-[-0.045em]
              "
            >
              {product.name}
            </h1>

            {/* BADGES */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {product.isBestSeller && (
                <span className="border border-[#D8DBD7] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.1em]">
                  Çok Satan
                </span>
              )}

              <span className="text-[10px] font-medium text-[#858B85]">
                VICIX ürün koleksiyonu
              </span>
            </div>

            {/* PRICE */}
            <div className="mt-7">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                {hasDiscount && (
                  <span className="text-base font-normal text-[#858B85] line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}

                <span
                  className="
                    font-[family-name:var(--font-manrope)]
                    text-[clamp(27px,2.7vw,37px)]
                    font-semibold tracking-[-0.045em]
                  "
                >
                  {formatPrice(product.price)}
                </span>
              </div>

              <p className="mt-1 text-[10px] text-[#858B85]">
                {outOfStock
                  ? "Ürün stokta bulunmuyor"
                  : "Ürün fiyatı"}
              </p>
            </div>

            <div className="my-6 h-px w-full bg-[#D8DBD7]" />

            {/* QUANTITY / CART / FAVORITES */}
            <div className="flex min-w-0 items-stretch gap-3">
              <div className="flex h-[52px] shrink-0 items-center border border-[#D8DBD7]">
                <button
                  type="button"
                  aria-label="Adedi azalt"
                  onClick={() => changeQuantity(-1)}
                  disabled={quantity <= 1 || outOfStock}
                  className="flex h-full w-10 items-center justify-center transition-opacity hover:opacity-50 disabled:opacity-30"
                >
                  <Minus size={14} />
                </button>

                <span className="min-w-7 text-center text-[12px] font-semibold tabular-nums">
                  {quantity}
                </span>

                <button
                  type="button"
                  aria-label="Adedi artır"
                  onClick={() => changeQuantity(1)}
                  disabled={outOfStock || quantity >= maxQuantity}
                  className="flex h-full w-10 items-center justify-center transition-opacity hover:opacity-50 disabled:opacity-30"
                >
                  <Plus size={14} />
                </button>
              </div>

              <button
                type="button"
                disabled
                title={
                  outOfStock
                    ? "Ürün stokta bulunmuyor"
                    : "Sepet entegrasyonu hazırlanıyor"
                }
                className="
                  flex h-[52px] min-w-0 flex-1
                  items-center justify-center gap-2
                  bg-[#111312] px-3
                  text-[10px] font-semibold
                  uppercase tracking-[0.08em]
                  text-[#F4F3EF]
                  opacity-65
                  cursor-not-allowed
                  sm:gap-3 sm:px-4 sm:tracking-[0.12em]
                "
              >
                <ShoppingBag size={17} strokeWidth={1.5} />
                {outOfStock ? "Stokta Yok" : "Sepete Ekle"}
              </button>

              <button
                type="button"
                onClick={() => setIsFavorite((current) => !current)}
                aria-label={
                  isFavorite
                    ? "Favori işaretini kaldır"
                    : "Favori olarak işaretle"
                }
                aria-pressed={isFavorite}
                className="
                  flex h-[52px] w-[52px]
                  shrink-0 items-center justify-center
                  border border-[#D8DBD7]
                  transition-colors duration-300
                  hover:border-[#111312]
                "
              >
                <Heart
                  size={19}
                  strokeWidth={1.5}
                  fill={isFavorite ? "currentColor" : "none"}
                />
              </button>
            </div>

            {/* BENEFITS */}
            <div className="mt-6 grid grid-cols-3 gap-3 border-b border-[#D8DBD7] pb-6">
              <Benefit
                icon={Truck}
                title="Teslimat"
                description="Kargo bilgisi"
              />
              <Benefit
                icon={ShieldCheck}
                title="Güvenli"
                description="Alışveriş"
              />
              <Benefit
                icon={RotateCcw}
                title="İade"
                description="Koşulları"
              />
            </div>

            {/* ACCORDION */}
            <div className="mt-2">
              {accordionItems.map((item) => {
                const isOpen = activeAccordion === item.id;

                return (
                  <div
                    key={item.id}
                    className="border-b border-[#D8DBD7]"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setActiveAccordion(isOpen ? null : item.id)
                      }
                      aria-expanded={isOpen}
                      className="
                        flex w-full items-center
                        justify-between gap-4 py-4
                        text-left text-[11px]
                        font-semibold tracking-[0.02em]
                        transition-opacity hover:opacity-60
                      "
                    >
                      {item.title}

                      <ChevronDown
                        size={15}
                        strokeWidth={1.5}
                        className={`shrink-0 transition-transform duration-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="whitespace-pre-line pb-4 pr-5 text-[11px] leading-6 text-[#858B85]">
                        {item.content}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Benefit({ icon: Icon, title, description }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Icon size={17} strokeWidth={1.4} />

      <span className="text-[10px] font-semibold">
        {title}
      </span>

      <span className="text-[9px] leading-4 text-[#858B85]">
        {description}
      </span>
    </div>
  );
}
