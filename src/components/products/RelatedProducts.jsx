import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ImageIcon } from "lucide-react";

const formatPrice = new Intl.NumberFormat("tr-TR", {
  style: "currency", currency: "TRY", maximumFractionDigits: 2,
});

export default function RelatedProducts({ product, products = [] }) {
  if (!product) return null;

  const relatedProducts = products
    .filter((item) => item.category === product.category && String(item.id) !== String(product.id))
    .slice(0, 4);

  if (relatedProducts.length === 0) return null;

  const categoryTitle = product.categoryName || "Aynı Kategori";

  return (
    <section aria-labelledby="related-products-title"
      className="w-full min-w-0 overflow-hidden bg-[#F4F3EF] py-12 sm:py-16 lg:py-20">
      <div className="revora-container">
        <div className="mb-8 flex flex-col gap-4 border-b border-[#D8DBD7] pb-6 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#858B85]">{categoryTitle} / KOLEKSİYON</p>
            <h2 id="related-products-title" className="font-[family-name:var(--font-manrope)] text-[clamp(1.6rem,3vw,2.7rem)] font-semibold leading-tight tracking-[-0.045em] text-[#111312]">
              Aynı kategorideki <span className="block text-[#858B85]">diğer ürünler.</span>
            </h2>
          </div>
          <Link href={`/urunler?kategori=${encodeURIComponent(product.category)}`}
            className="group inline-flex w-fit items-center gap-2 border-b border-[#111312] pb-2 text-[11px] font-semibold text-[#111312] transition-opacity duration-300 hover:opacity-60">
            Kategoriyi Keşfet
            <ArrowUpRight size={16} strokeWidth={1.6} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6">
          {relatedProducts.map((item) => (
            <Link key={item.id} href={`/urunler/${item.id}`} className="group block min-w-0">
              <div className="relative aspect-[4/5] overflow-hidden bg-[#EAECE7] sm:aspect-[5/5]">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill
                    sizes="(max-width: 639px) 50vw, (max-width: 1023px) 50vw, 25vw"
                    className="object-contain p-4 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.055]" />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-[#858B85]">
                    <ImageIcon size={25} strokeWidth={1.2} /><span className="text-[11px]">Görsel hazırlanıyor</span>
                  </div>
                )}
                <span className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center bg-white text-[#111312] transition-all duration-300 group-hover:-translate-y-1 group-hover:bg-[#A61922] group-hover:text-white sm:h-10 sm:w-10">
                  <ArrowUpRight size={17} strokeWidth={1.6} />
                </span>
              </div>
              <div className="mt-4 border-b border-[#D8DBD7] pb-5">
                <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#858B85]">{item.categoryName || categoryTitle}</p>
                <h3 className="font-[family-name:var(--font-manrope)] text-[12px] font-semibold leading-5 tracking-[-0.02em] text-[#111312] sm:text-[15px]">{item.name}</h3>
                <p className="mt-2 text-[13px] font-bold text-[#111312] sm:text-[15px]">
                  {item.salePrice != null && item.salePrice < item.originalPrice && (
                    <span className="mr-2 text-[11px] font-normal text-[#858B85] line-through">{formatPrice.format(item.originalPrice)}</span>
                  )}
                  {formatPrice.format(item.price)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
