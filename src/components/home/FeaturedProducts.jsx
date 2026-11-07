import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ImageIcon } from "lucide-react";

const priceFormatter = new Intl.NumberFormat("tr-TR", {
  style: "currency", currency: "TRY", maximumFractionDigits: 2,
});

export default function FeaturedProducts({ products = [] }) {
  const collections = [
    {
      id: "yeni-gelenler", eyebrow: "VICIX / YENİ KOLEKSİYON",
      title: "Yeni", accent: "gelenler.",
      description: "Detailing dünyasının yeni ürünleriyle tanışın. Araç bakımında yenilikçi çözümleri keşfedin.",
      href: "/urunler?koleksiyon=yeni-gelenler",
      products: products.filter((item) => item.isNew).slice(0, 4),
    },
    {
      id: "cok-satanlar", eyebrow: "VICIX / EN ÇOK TERCİH EDİLENLER",
      title: "Çok", accent: "satanlar.",
      description: "En çok tercih edilen bakım ürünlerini keşfedin. Profesyonel sonuçlar için özenle seçilmiş ürünler.",
      href: "/urunler?koleksiyon=cok-satanlar",
      products: products.filter((item) => item.isBestSeller).slice(0, 4),
    },
  ];

  return (
    <div className="w-full overflow-x-clip bg-[#F4F3EF]">
      {collections.map((collection, index) => (
        <section key={collection.id} id={collection.id}
          className={`w-full scroll-mt-[var(--site-header-height)] py-12 sm:py-16 lg:py-20 ${index > 0 ? "border-t border-[#D8DBD7]" : ""}`}>
          <div className="revora-container">
            <div className="mb-9 flex flex-col justify-between gap-6 border-b border-[#D8DBD7] pb-8 md:mb-11 md:flex-row md:items-end">
              <div>
                <p className="mb-4 flex items-center gap-3 font-[family-name:var(--font-manrope)] text-[10px] font-bold uppercase tracking-[0.2em] text-[#626A64]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8DCC27]" />{collection.eyebrow}
                </p>
                <h2 className="font-[family-name:var(--font-manrope)] text-[clamp(2.3rem,5vw,4.8rem)] font-semibold leading-[1.04] tracking-[-0.055em] text-[#111312]">
                  {collection.title}<span className="ml-3 text-[#858B85]">{collection.accent}</span>
                </h2>
              </div>
              <div className="flex max-w-[340px] flex-col items-start gap-5 md:items-end">
                <p className="text-[12px] leading-7 text-[#626A64] md:text-right">{collection.description}</p>
                <Link href={collection.href} scroll={true}
                  className="group inline-flex items-center gap-3 border-b border-[#111312] pb-2 font-[family-name:var(--font-manrope)] text-[11px] font-bold uppercase tracking-[0.09em] text-[#111312] transition-colors duration-300 hover:text-[#719C26]">
                  Tüm Ürünler
                  <ArrowUpRight size={16} strokeWidth={1.7} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
            {collection.products.length > 0 ? (
              <div className="grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-5 sm:gap-y-11 lg:grid-cols-4 lg:gap-x-6">
                {collection.products.map((product) => <FeaturedProductCard key={product.id} product={product} />)}
              </div>
            ) : (
              <div className="py-14 text-center text-[13px] text-[#626A64]">Bu koleksiyonda henüz ürün bulunmuyor.</div>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

function FeaturedProductCard({ product }) {
  return (
    <Link href={`/urunler/${product.id}`} className="group block min-w-0">
      <article>
        <div className="relative aspect-[4/5] overflow-hidden bg-[#E6E8E3]">
          {product.image ? (
            <Image src={product.image} alt={product.name} fill
              sizes="(max-width: 639px) 50vw, (max-width: 1023px) 50vw, 25vw"
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045]" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-[#858B85]">
              <ImageIcon size={25} strokeWidth={1.2} /><span className="text-[11px]">Görsel hazırlanıyor</span>
            </div>
          )}
          {product.isNew ? (
            <span className="absolute left-3 top-3 bg-[#B7FF3C] px-2.5 py-1.5 font-[family-name:var(--font-manrope)] text-[9px] font-bold uppercase tracking-[0.08em] text-[#111312]">Yeni</span>
          ) : product.isBestSeller ? (
            <span className="absolute left-3 top-3 bg-[#111312] px-2.5 py-1.5 font-[family-name:var(--font-manrope)] text-[9px] font-bold uppercase tracking-[0.08em] text-white">Çok Satan</span>
          ) : null}
        </div>
        <div className="mt-4 flex items-start justify-between gap-2 border-b border-[#D8DBD7] pb-5 sm:mt-5">
          <div className="min-w-0">
            <p className="font-[family-name:var(--font-manrope)] text-[9px] font-semibold uppercase tracking-[0.12em] text-[#858B85]">{product.categoryName}</p>
            <h3 className="mt-2 font-[family-name:var(--font-manrope)] text-[12px] font-semibold leading-5 tracking-[-0.02em] text-[#111312] sm:text-[15px]">{product.name}</h3>
            <p className="mt-3 font-[family-name:var(--font-manrope)] text-[12px] font-bold text-[#111312] sm:text-[15px]">
              {product.salePrice != null && product.salePrice < product.originalPrice && (
                <span className="mr-2 text-[11px] font-normal text-[#858B85] line-through">{priceFormatter.format(product.originalPrice)}</span>
              )}
              {priceFormatter.format(product.price)}
            </p>
          </div>
          <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#D8DBD7] text-[#111312] transition-colors duration-300 group-hover:border-[#111312] sm:h-9 sm:w-9">
            <ArrowUpRight size={16} strokeWidth={1.6} />
          </span>
        </div>
      </article>
    </Link>
  );
}
