
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  ChevronDown,
  SlidersHorizontal,
  X,
  Package,
} from "lucide-react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  products,
  productCategories,
} from "@/data/products";

const collections = [
  { label: "Tüm Ürünler", value: "all" },
  { label: "Yeni Gelenler", value: "yeni-gelenler" },
  { label: "Çok Satanlar", value: "cok-satanlar" },
];

const formatPrice = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

export default function ProductsCatalog() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "instant",
  });
}, []);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [sort, setSort] = useState("default");

  const categoryParam = searchParams.get("kategori");
  const collectionParam = searchParams.get("koleksiyon");

  const activeCategory = productCategories.find(
    (item) => item.slug === categoryParam
  );

  const activeCollection = collections.find(
    (item) => item.value === collectionParam
  );

  const pageTitle = activeCategory
    ? activeCategory.title
    : activeCollection
      ? activeCollection.label
      : "Tüm Ürünler";

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (activeCategory) {
      result = result.filter(
        (item) => item.category === activeCategory.slug
      );
    } else if (collectionParam === "yeni-gelenler") {
      result = result.filter((item) => item.isNew);
    } else if (collectionParam === "cok-satanlar") {
      result = result.filter((item) => item.isBestSeller);
    }

    switch (sort) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name":
        result.sort((a, b) =>
          a.name.localeCompare(b.name, "tr")
        );
        break;
      default:
        break;
    }

    return result;
  }, [activeCategory, collectionParam, sort]);

  const getCount = (type, value) => {
    if (type === "category") {
      return products.filter(
        (item) => item.category === value
      ).length;
    }

    if (value === "yeni-gelenler") {
      return products.filter((item) => item.isNew).length;
    }

    if (value === "cok-satanlar") {
      return products.filter(
        (item) => item.isBestSeller
      ).length;
    }

    return products.length;
  };

  const changeFilter = (type, value) => {
    const params = new URLSearchParams();

    if (type === "category") {
      params.set("kategori", value);
    }

    if (type === "collection" && value !== "all") {
      params.set("koleksiyon", value);
    }

    const query = params.toString();

    router.push(
      query ? `${pathname}?${query}` : pathname,
      { scroll: false }
    );

    setMobileOpen(false);
  };

  const isCollectionActive = (value) => {
    if (value === "all") {
      return !activeCategory && !activeCollection;
    }

    return (
      !activeCategory &&
      activeCollection?.value === value
    );
  };

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [mobileOpen]);

  const filterProps = {
    activeCategory,
    isCollectionActive,
    changeFilter,
    getCount,
  };

  return (
    <main className="min-h-screen w-full min-w-0 overflow-x-clip bg-[#F4F3EF] text-[#111312]">
      <div className="revora-container">
        {/* PAGE INTRO */}
        <header className="border-b border-[#D8DBD7] pb-8 pt-10 sm:pb-10 sm:pt-14 lg:pb-12 lg:pt-16">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="min-w-0">
              <p className="mb-5 flex items-center gap-3 font-[family-name:var(--font-manrope)] text-[10px] font-bold uppercase tracking-[0.2em] text-[#69716A]">
                <span className="h-[6px] w-[6px] rounded-full bg-[#8DCC27]" />
                VICIX / KOLEKSİYON
              </p>

              <h1 className="max-w-[900px] font-[family-name:var(--font-manrope)] text-[clamp(2.5rem,6vw,5.5rem)] font-semibold leading-[1.04] tracking-[-0.06em]">
                {pageTitle}
                <span className="text-[#9AA09A]">.</span>
              </h1>
            </div>

            <p className="max-w-[320px] text-[12px] leading-7 text-[#69716A] sm:text-[13px]">
              Profesyonel detailing deneyimi için özenle
              seçilmiş araç bakım ürünleri.
            </p>
          </div>
        </header>

        {/* CATALOG LAYOUT */}
        <div className="grid min-w-0 grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[290px_minmax(0,1fr)]">
          {/* DESKTOP SIDEBAR */}
          <aside className="hidden border-r border-[#D8DBD7] lg:block">
            <div className="sticky top-[calc(var(--site-header-height,100px)+16px)] max-h-[calc(100vh-var(--site-header-height,100px)-32px)] overflow-y-auto py-10 pr-7 xl:pr-9">
              <div className="mb-10">
                <p className="mb-2 font-[family-name:var(--font-manrope)] text-[10px] font-bold uppercase tracking-[0.2em] text-[#858B85]">
                  VICIX / SHOP
                </p>

                <h2 className="font-[family-name:var(--font-manrope)] text-[23px] font-semibold tracking-[-0.05em]">
                  Koleksiyonu keşfet.
                </h2>

                <p className="mt-3 text-[12px] leading-6 text-[#858B85]">
                  Aracınız için doğru bakım ürününü bulun.
                </p>
              </div>

              <FilterContent {...filterProps} />
            </div>
          </aside>

          {/* MAIN PRODUCTS */}
          <section className="min-w-0 py-7 lg:py-10 lg:pl-9 xl:pl-12">
            {/* TOOLBAR */}
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[#D8DBD7] pb-5">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setMobileOpen(true)}
                  className="inline-flex items-center gap-2 border border-[#C8CDC7] px-4 py-3 text-[11px] font-semibold transition-colors hover:border-[#111312] lg:hidden"
                >
                  <SlidersHorizontal
                    size={15}
                    strokeWidth={1.7}
                  />
                  Filtrele
                </button>

                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8DCC27]" />
                  <span className="text-[11px] font-medium text-[#69716A]">
                    {filteredProducts.length} ürün listeleniyor
                  </span>
                </div>
              </div>

              <div className="relative flex items-center gap-3">
                <span className="hidden text-[10px] font-semibold uppercase tracking-[0.12em] text-[#858B85] sm:block">
                  Sıralama
                </span>

                <select
                  aria-label="Ürünleri sırala"
                  value={sort}
                  onChange={(event) =>
                    setSort(event.target.value)
                  }
                  className="max-w-[180px] appearance-none cursor-pointer border-0 border-b border-[#AAB0AA] bg-transparent py-2 pl-1 pr-6 font-[family-name:var(--font-manrope)] text-[11px] font-semibold text-[#111312] outline-none focus:border-[#111312] focus:ring-0"
                >
                  <option value="default">
                    Önerilen
                  </option>
                  <option value="price-asc">
                    Fiyat: Artan
                  </option>
                  <option value="price-desc">
                    Fiyat: Azalan
                  </option>
                  <option value="name">
                    İsme Göre
                  </option>
                </select>

                <ChevronDown
                  size={13}
                  className="pointer-events-none absolute right-1 text-[#69716A]"
                />
              </div>
            </div>

            {/* ACTIVE FILTER */}
            {(activeCategory || activeCollection) && (
              <div className="mb-7 flex flex-wrap items-center gap-3">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#858B85]">
                  Aktif filtre
                </span>

                <button
                  type="button"
                  onClick={() =>
                    changeFilter("collection", "all")
                  }
                  className="inline-flex items-center gap-3 border border-[#D8DBD7] px-3 py-2 text-[11px] font-semibold transition-colors hover:border-[#111312]"
                >
                  {pageTitle}
                  <X size={13} />
                </button>
              </div>
            )}

            {/* PRODUCT GRID */}
            {filteredProducts.length > 0 ? (
              <div className="grid min-w-0 grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-6 sm:gap-y-12 xl:grid-cols-3 xl:gap-x-7">
                {filteredProducts.map((product) => (
                  <ProductItem
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>
            ) : (
              <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
                <Package
                  size={34}
                  strokeWidth={1.2}
                  className="text-[#858B85]"
                />

                <h2 className="mt-5 font-[family-name:var(--font-manrope)] text-xl font-semibold">
                  Ürün bulunamadı
                </h2>

                <p className="mt-3 text-[12px] text-[#69716A]">
                  Başka bir koleksiyonu keşfedebilirsiniz.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    changeFilter("collection", "all")
                  }
                  className="mt-7 border-b border-[#111312] pb-2 text-[11px] font-bold uppercase tracking-[0.1em]"
                >
                  Tüm ürünleri görüntüle
                </button>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* MOBILE FILTER DRAWER */}
      <div
        className={`fixed inset-0 z-[200] lg:hidden ${
          mobileOpen
            ? "visible"
            : "pointer-events-none invisible"
        }`}
      >
        <button
          type="button"
          aria-label="Filtreleri kapat"
          onClick={() => setMobileOpen(false)}
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Ürün filtreleri"
          className={`absolute right-0 top-0 flex h-full w-[min(88vw,390px)] flex-col bg-[#F4F3EF] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            mobileOpen
              ? "translate-x-0"
              : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-[#D8DBD7] px-6 py-6">
            <div>
              <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.18em] text-[#858B85]">
                VICIX / SHOP
              </p>
              <h2 className="font-[family-name:var(--font-manrope)] text-xl font-semibold">
                Filtreler
              </h2>
            </div>

            <button
              type="button"
              aria-label="Filtreleri kapat"
              onClick={() => setMobileOpen(false)}
              className="flex h-9 w-9 items-center justify-center border border-[#D8DBD7]"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-8">
            <FilterContent {...filterProps} />
          </div>

          <div className="border-t border-[#D8DBD7] p-5">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="w-full bg-[#111312] px-5 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#303831]"
            >
              {filteredProducts.length} Ürünü Göster
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}

/* FILTER SIDEBAR */
function FilterContent({
  activeCategory,
  isCollectionActive,
  changeFilter,
  getCount,
}) {
  return (
    <nav aria-label="Ürün filtreleri">
      <FilterGroup title="Koleksiyonlar" number="01">
        {collections.map((item) => (
          <FilterOption
            key={item.value}
            label={item.label}
            count={getCount("collection", item.value)}
            active={isCollectionActive(item.value)}
            onClick={() =>
              changeFilter("collection", item.value)
            }
          />
        ))}
      </FilterGroup>

      <div className="my-9 border-t border-[#D8DBD7]" />

      <FilterGroup title="Kategoriler" number="02">
        {productCategories.map((item) => (
          <FilterOption
            key={item.slug}
            label={item.title}
            count={getCount("category", item.slug)}
            active={activeCategory?.slug === item.slug}
            onClick={() =>
              changeFilter("category", item.slug)
            }
          />
        ))}
      </FilterGroup>

      <div className="mt-10 border-t border-[#D8DBD7] pt-6">
        <p className="font-[family-name:var(--font-manrope)] text-[10px] font-bold uppercase tracking-[0.12em] text-[#858B85]">
          VICIX CAR CARE
        </p>

        <p className="mt-3 text-[12px] leading-6 text-[#69716A]">
          Her yüzeyde profesyonel bakım.
          Her detayda VICIX kalitesi.
        </p>
      </div>
    </nav>
  );
}

function FilterGroup({ title, number, children }) {
  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h3 className="font-[family-name:var(--font-manrope)] text-[11px] font-bold uppercase tracking-[0.13em]">
          {title}
        </h3>

        <span className="font-[family-name:var(--font-manrope)] text-[10px] font-semibold text-[#9AA09A]">
          {number}
        </span>
      </div>

      <div className="space-y-1">{children}</div>
    </div>
  );
}

function FilterOption({
  label,
  count,
  active,
  onClick,
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`group relative flex w-full items-center justify-between gap-3 py-[11px] pl-4 pr-1 text-left transition-colors duration-300 ${
        active
          ? "text-[#111312]"
          : "text-[#737B74] hover:text-[#111312]"
      }`}
    >
      <span
        className={`absolute bottom-[7px] left-0 top-[7px] w-[2px] transition-colors duration-300 ${
          active
            ? "bg-[#8DCC27]"
            : "bg-transparent group-hover:bg-[#C7D9A6]"
        }`}
      />

      <span
        className={`min-w-0 font-[family-name:var(--font-manrope)] text-[12px] leading-5 tracking-[-0.015em] ${
          active ? "font-bold" : "font-medium"
        }`}
      >
        {label}
      </span>

      <span
        className={`shrink-0 text-[10px] tabular-nums ${
          active
            ? "font-semibold text-[#111312]"
            : "text-[#A0A7A0]"
        }`}
      >
        {String(count).padStart(2, "0")}
      </span>
    </button>
  );
}

/* PRODUCT ITEM */
function ProductItem({ product }) {
  const category = productCategories.find(
    (item) => item.slug === product.category
  );

  return (
    <article className="group min-w-0">
      <Link
        href={`/urunler/${product.id}`}
        aria-label={`${product.name} ürün detayını görüntüle`}
        className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#111312]"
      >
      <div className="relative aspect-[4/5] overflow-hidden bg-[#E6E8E3]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, (max-width: 1279px) 40vw, 25vw"
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045]"
        />

        {product.isNew && (
          <span className="absolute left-3 top-3 bg-[#B7FF3C] px-2.5 py-1.5 font-[family-name:var(--font-manrope)] text-[9px] font-bold uppercase tracking-[0.1em] text-[#111312]">
            Yeni
          </span>
        )}

        {product.isBestSeller && !product.isNew && (
          <span className="absolute left-3 top-3 bg-[#111312] px-2.5 py-1.5 font-[family-name:var(--font-manrope)] text-[9px] font-bold uppercase tracking-[0.1em] text-white">
            Çok Satan
          </span>
        )}
      </div>

      <div className="mt-4 flex items-start justify-between gap-2 border-b border-[#D8DBD7] pb-5 sm:mt-5">
        <div className="min-w-0">
          <p className="font-[family-name:var(--font-manrope)] text-[9px] font-semibold uppercase tracking-[0.12em] text-[#858B85]">
            {category?.title}
          </p>

          <h3 className="mt-2 font-[family-name:var(--font-manrope)] text-[12px] font-semibold leading-5 tracking-[-0.02em] sm:text-[15px]">
            {product.name}
          </h3>

          <p className="mt-3 font-[family-name:var(--font-manrope)] text-[12px] font-bold sm:text-[15px]">
            {formatPrice.format(product.price)}
          </p>
        </div>

        <span
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#D8DBD7] text-[#111312] transition-colors duration-300 group-hover:border-[#111312] sm:h-9 sm:w-9"
        >
          <ArrowUpRight size={16} strokeWidth={1.6} />
        </span>
      </div>
      </Link>
    </article>
  );
}
