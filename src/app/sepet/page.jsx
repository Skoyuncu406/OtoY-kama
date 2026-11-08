
"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  ShieldCheck,
} from "lucide-react";

import { useCart } from "@/context/CartContext";

const formatPrice = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 2,
});

export default function CartPage() {
  const {
    items,
    hydrated,
    cartCount,
    cartTotal,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();

  if (!hydrated) {
    return (
      <main className="min-h-[65vh] bg-[#F4F3EF] px-5 py-24 text-center text-[#626A64]">
        Sepetiniz yükleniyor...
      </main>
    );
  }

  return (
    <main className="min-h-[75vh] w-full overflow-x-clip bg-[#F4F3EF] text-[#111312]">
      <div className="revora-container py-10 sm:py-16 lg:py-20">
        <div className="border-b border-[#D8DBD7] pb-8 sm:pb-12">
          <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.22em] text-[#A61922]">
            VICIX / ALIŞVERİŞ
          </p>

          <div className="flex flex-wrap items-end justify-between gap-5">
            <h1 className="font-[family-name:var(--font-manrope)] text-[clamp(2.5rem,6vw,5.5rem)] font-semibold leading-none tracking-[-0.06em]">
              Alışveriş <span className="text-[#858B85]">sepeti.</span>
            </h1>

            <span className="text-[12px] text-[#626A64]">
              {cartCount} ürün
            </span>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="flex min-h-[48vh] flex-col items-center justify-center py-16 text-center">
            <ShoppingBag
              size={45}
              strokeWidth={1.1}
              className="mb-7 text-[#858B85]"
            />

            <h2 className="font-[family-name:var(--font-manrope)] text-[25px] font-semibold tracking-[-0.04em]">
              Sepetiniz henüz boş.
            </h2>

            <p className="mt-3 max-w-[350px] text-[13px] leading-7 text-[#626A64]">
              Aracınız için özenle seçilmiş bakım ürünlerini
              keşfederek alışverişe başlayabilirsiniz.
            </p>

      
<Link
  href="/urunler"
  className="
    group mt-9 inline-flex min-h-[52px]
    items-center justify-center gap-4
    border border-[#111312]
    !bg-[#111312] px-7
    font-[family-name:var(--font-manrope)]
    text-[11px] font-bold uppercase
    tracking-[0.1em] !text-[#FFFFFF]
    transition-all duration-300
    hover:!border-[#A61922]
    hover:!bg-[#A61922]
    hover:!text-[#FFFFFF]
  "
>
  <span className="!text-inherit">
    Ürünleri Keşfet
  </span>

  <ArrowRight
    size={17}
    strokeWidth={1.6}
    className="transition-transform duration-300 group-hover:translate-x-1"
  />
</Link>

          </div>
        ) : (
          <div className="grid gap-12 pt-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-16 lg:pt-14">
            <section className="min-w-0">
              <div className="mb-7 flex items-center justify-between">
                <h2 className="text-[12px] font-bold uppercase tracking-[0.12em]">
                  Sepetteki Ürünler
                </h2>

                <button
                  type="button"
                  onClick={clearCart}
                  className="text-[11px] text-[#858B85] underline underline-offset-4 transition-colors hover:text-[#A61922]"
                >
                  Sepeti Temizle
                </button>
              </div>

              <div className="border-t border-[#D8DBD7]">
                {items.map((item) => (
                  <article
                    key={item.id}
                    className="flex min-w-0 gap-4 border-b border-[#D8DBD7] py-6 sm:gap-6 sm:py-8"
                  >
                    <Link
                      href={`/urunler/${item.id}`}
                      className="relative aspect-[4/5] w-[95px] shrink-0 overflow-hidden bg-[#E6E8E3] sm:w-[135px]"
                    >
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="(max-width: 640px) 95px, 135px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ShoppingBag
                            size={24}
                            className="text-[#858B85]"
                          />
                        </div>
                      )}
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col justify-between gap-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#858B85]">
                            {item.category}
                          </p>

                          <Link
                            href={`/urunler/${item.id}`}
                            className="font-[family-name:var(--font-manrope)] text-[13px] font-semibold leading-5 transition-colors hover:text-[#A61922] sm:text-[16px]"
                          >
                            {item.name}
                          </Link>

                          <p className="mt-3 text-[12px] font-semibold sm:text-[14px]">
                            {formatPrice.format(item.price)}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          aria-label={`${item.name} ürününü sepetten kaldır`}
                          className="shrink-0 text-[#858B85] transition-colors hover:text-[#A61922]"
                        >
                          <Trash2 size={17} strokeWidth={1.5} />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-end justify-between gap-3">
                        <div className="flex h-10 items-center border border-[#D8DBD7]">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            aria-label="Adedi azalt"
                            className="flex h-full w-9 items-center justify-center transition-colors hover:bg-[#E6E8E3]"
                          >
                            <Minus size={14} />
                          </button>

                          <span className="min-w-8 text-center text-[12px] font-semibold tabular-nums">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            aria-label="Adedi artır"
                            className="flex h-full w-9 items-center justify-center transition-colors hover:bg-[#E6E8E3]"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <p className="text-[13px] font-bold tabular-nums sm:text-[16px]">
                          {formatPrice.format(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <Link
                href="/urunler"
                className="mt-8 inline-flex items-center gap-3 border-b border-[#111312] pb-2 text-[11px] font-bold uppercase tracking-[0.09em] transition-colors hover:text-[#A61922]"
              >
                <ArrowLeft size={16} strokeWidth={1.5} />
                Alışverişe Devam Et
              </Link>
            </section>

            <aside className="min-w-0 lg:sticky lg:top-32 lg:self-start">
              <div className="border-t-2 border-[#111312] pt-6">
                <h2 className="font-[family-name:var(--font-manrope)] text-[21px] font-semibold tracking-[-0.04em]">
                  Sipariş Özeti
                </h2>

                <div className="mt-8 flex justify-between gap-4 border-b border-[#D8DBD7] pb-5 text-[12px]">
                  <span className="text-[#626A64]">
                    Ara Toplam ({cartCount} ürün)
                  </span>
                  <span className="font-semibold">
                    {formatPrice.format(cartTotal)}
                  </span>
                </div>

                <div className="flex justify-between gap-4 border-b border-[#D8DBD7] py-5 text-[12px]">
                  <span className="text-[#626A64]">Kargo</span>
                  <span className="text-right text-[#626A64]">
                    Ödeme aşamasında hesaplanır
                  </span>
                </div>

                <div className="mt-7 flex items-center justify-between gap-4">
                  <span className="text-[13px] font-semibold">
                    Toplam
                  </span>
                  <span className="font-[family-name:var(--font-manrope)] text-[23px] font-bold tracking-[-0.04em]">
                    {formatPrice.format(cartTotal)}
                  </span>
                </div>

                <button
                  type="button"
                  disabled
                  title="Ödeme altyapısı henüz hazırlanıyor"
                  className="mt-8 flex min-h-[52px] w-full cursor-not-allowed items-center justify-between bg-[#111312] px-5 text-[11px] font-bold uppercase tracking-[0.08em] text-white opacity-60"
                >
                  Ödemeye Geç
                  <ArrowRight size={18} strokeWidth={1.5} />
                </button>

                <p className="mt-4 text-center text-[11px] leading-6 text-[#858B85]">
                  Online ödeme ve sipariş oluşturma altyapısı
                  henüz aktif değil.
                </p>

                <div className="mt-8 flex items-start gap-3 border-t border-[#D8DBD7] pt-6">
                  <ShieldCheck
                    size={19}
                    strokeWidth={1.4}
                    className="shrink-0 text-[#626A64]"
                  />
                  <p className="text-[11px] leading-6 text-[#626A64]">
                    VICIX alışveriş deneyimi için güvenli ödeme
                    altyapısı hazırlanıyor.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
