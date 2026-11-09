
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ImageIcon } from "lucide-react";

export default function Categories({ categories = [] }) {
  const totalCategories = categories.length;

  return (
    <section
      id="kategoriler"
      className="w-full scroll-mt-[var(--site-header-height)] overflow-hidden bg-[#F4F3EF] py-10"
    >
      <div className="revora-container">
        {/* SECTION HEADER */}
        <div className="mb-10 flex flex-col justify-between gap-6 border-b border-[#D8DBD7] pb-8 md:mb-12 md:flex-row md:items-end">
          <div>
            <p className="mb-4 flex items-center gap-3 font-[family-name:var(--font-manrope)] text-[10px] font-bold uppercase tracking-[0.2em] text-[#626A64]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#8DCC27]" />
              VICIX / KOLEKSİYONLAR
            </p>

            <h2 className="max-w-[700px] font-[family-name:var(--font-manrope)] text-[clamp(2.2rem,5vw,4.8rem)] font-semibold leading-[1.04] tracking-[-0.055em] text-[#111312]">
              Her detay için
              <span className="block text-[#858B85]">
                doğru bakım.
              </span>
            </h2>
          </div>

          <p className="max-w-[310px] text-[13px] leading-7 text-[#626A64]">
            Aracınızın her yüzeyi için özenle seçilmiş
            profesyonel bakım çözümlerini keşfedin.
          </p>
        </div>

        {/* CATEGORY GRID */}
        {totalCategories > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 lg:gap-7">
            {categories.map((category) => {
              const categoryName =
                category.title || category.name;

              return (
                <Link
                  key={category.id || category.slug}
                  href={`/urunler?kategori=${encodeURIComponent(
                    category.slug
                  )}`}
                  className="group block min-w-0 focus-visible:outline-none"
                >
                  {/* PREMIUM CATEGORY CONTAINER */}
                  <article
                    className="
                      relative
                      flex
                      h-full
                      min-w-0
                      flex-col
                      overflow-hidden
                      border
                      border-[#D8DBD7]
                      bg-[#F8F8F5]
                      transition-[border-color,box-shadow,transform]
                      duration-500
                      ease-[cubic-bezier(0.22,1,0.36,1)]
                      hover:-translate-y-1
                      hover:border-[#A61922]
                      hover:shadow-[0_18px_45px_rgba(17,19,18,0.09)]
                      group-focus-visible:border-[#A61922]
                      group-focus-visible:shadow-[0_0_0_2px_rgba(166,25,34,0.15)]
                    "
                  >
                    {/* CATEGORY IMAGE */}
                    <div className="relative aspect-video w-full overflow-hidden border-b border-[#E1E3DD] bg-[#111312]">
                      {category.image ? (
                        <Image
                          src={category.image}
                          alt={categoryName}
                          fill
                          sizes="(max-width: 639px) 50vw, (max-width: 1023px) 50vw, 33vw"
                          className="
                            object-contain
                            object-center
                            transition-transform
                            duration-700
                            ease-[cubic-bezier(0.22,1,0.36,1)]
                            group-hover:scale-[1.015]
                          "
                        />
                      ) : (
                        <div className="absolute inset-0 bg-[#242826]" />
                      )}
                    </div>

                    {/* CATEGORY INFORMATION */}
                    <div className="flex flex-1 flex-col px-3 pb-4 pt-4 sm:px-5 sm:pb-6 sm:pt-5">
                      <div className="mb-3 h-px w-7 bg-[#A61922] transition-all duration-500 group-hover:w-12" />

                      <h3 className="font-[family-name:var(--font-manrope)] text-[13px] font-semibold tracking-[-0.025em] text-[#111312] transition-colors duration-300 group-hover:text-[#A61922] sm:text-[18px] lg:text-[21px]">
                        {categoryName}
                      </h3>

                      <p className="mt-2 text-[11px] leading-5 text-[#7B817D] sm:text-[12px] sm:leading-6">
                        {category.description ||
                          `${categoryName} kategorisindeki profesyonel araç bakım ürünlerini keşfedin.`}
                      </p>

                      <div className="mt-auto pt-5">
                        <div className="flex items-center justify-between border-t border-[#E1E3DD] pt-3 transition-colors duration-300 group-hover:border-[#A61922]/30">
                          <span className="font-[family-name:var(--font-manrope)] text-[9px] font-semibold uppercase tracking-[0.12em] text-[#858B85] transition-colors duration-300 group-hover:text-[#A61922] sm:text-[10px]">
                            Koleksiyonu Keşfet
                          </span>

                          <ArrowUpRight
                            size={15}
                            strokeWidth={1.5}
                            className="text-[#858B85] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#A61922]"
                          />
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="flex min-h-[220px] flex-col items-center justify-center border-b border-[#D8DBD7] py-14 text-center">
            <ImageIcon
              size={30}
              strokeWidth={1.3}
              className="text-[#9CA39C]"
            />

            <h3 className="mt-5 font-[family-name:var(--font-manrope)] text-lg font-semibold text-[#111312]">
              Koleksiyonlarımız hazırlanıyor.
            </h3>

            <p className="mt-2 max-w-sm text-[13px] leading-6 text-[#7B817D]">
              Yeni ürün kategorilerimiz çok yakında
              burada yer alacak.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
