
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, MoveRight } from "lucide-react";


const categories = [
  {
    number: "01",
    title: "Yıkama & Ön Yıkama",
    description: "Kusursuz temizliğin ilk adımı.",
    image: "/images/categories/washing.jpg",
    href: "/urunler?kategori=yikama-on-yikama",
  },
  {
    number: "02",
    title: "Jant & Lastik",
    description: "Her ayrıntıda güçlü görünüm.",
    image: "/images/categories/wheels.jpg",
    href: "/urunler?kategori=jant-lastik",
  },
  {
    number: "03",
    title: "Dış Yüzey",
    description: "Parlaklık ve yüzey bakımı.",
    image: "/images/categories/exterior.jpg",
    href: "/urunler?kategori=dis-yuzey",
  },
  {
    number: "04",
    title: "İç Temizlik",
    description: "İç mekânda premium bakım.",
    image: "/images/categories/interior.jpg",
    href: "/urunler?kategori=ic-temizlik",
  },
  {
    number: "05",
    title: "Pasta & Polisaj",
    description: "Profesyonel yüzey yenileme.",
    image: "/images/categories/polishing.jpg",
    href: "/urunler?kategori=pasta-polisaj",
  },
  {
    number: "06",
    title: "Seramik & Koruma",
    description: "Uzun süreli yüzey koruması.",
    image: "/images/categories/ceramic.jpg",
    href: "/urunler?kategori=seramik-koruma",
  },
];


export default function Categories() {
  return (
    <section
      id="kategoriler"
        className="
    w-full
    scroll-mt-[var(--site-header-height)]
    overflow-hidden
    bg-[#F4F3EF]
    py-10
    sm:py-10
    lg:py-10
  "
    >
      <div className="revora-container">
        {/* SECTION HEADER */}
        <div className="mb-10 flex flex-col justify-between gap-6 border-b border-[#D8DBD7] pb-8 md:mb-12 md:flex-row md:items-end">
          <div>
            <p className="mb-4 flex items-center gap-3 font-[family-name:var(--font-manrope)] text-[10px] font-bold uppercase tracking-[0.2em] text-[#626A64]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#8DCC27]" />
              REVORA / KOLEKSİYONLAR
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
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-3 lg:gap-x-7 lg:gap-y-12">
          {categories.map((category) => (
            <Link
              key={category.number}
              href={category.href}
              className="group block min-w-0"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-[#242826] sm:aspect-[5/5] lg:aspect-[5/4]">
                <Image
                  src={category.image}
                  alt={category.title}
                  fill
                  sizes="(max-width: 1023px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.055]"
                />

                <div className="absolute inset-0 bg-black/10 transition-colors duration-500 group-hover:bg-black/25" />

                <span className="absolute left-3 top-3 font-[family-name:var(--font-manrope)] text-[10px] font-semibold tracking-[0.12em] text-white/90 sm:left-5 sm:top-5">
                  {category.number} / 06
                </span>

                <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center bg-white/95 text-[#111312] transition-all duration-500 group-hover:-translate-y-1 group-hover:bg-[#B7FF3C] sm:bottom-5 sm:right-5 sm:h-11 sm:w-11">
                  <ArrowUpRight size={18} strokeWidth={1.7} />
                </span>
              </div>

              <div className="mt-4 border-b border-[#D8DBD7] pb-5 sm:mt-5">
                <h3 className="font-[family-name:var(--font-manrope)] text-[13px] font-semibold tracking-[-0.025em] text-[#111312] sm:text-[18px] lg:text-[21px]">
                  {category.title}
                </h3>

                <p className="mt-1.5 text-[11px] leading-5 text-[#7B817D] sm:text-[12px]">
                  {category.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
