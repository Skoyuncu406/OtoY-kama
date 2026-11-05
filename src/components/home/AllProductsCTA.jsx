
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function AllProductsCTA() {
  return (
    <section className="w-full overflow-hidden bg-[#151A17] py-16 text-white sm:py-20 lg:py-28">
      <div className="revora-container">
        <div className="flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-end lg:gap-16">
          <div className="min-w-0">
            <p className="mb-6 flex items-center gap-3 font-[family-name:var(--font-manrope)] text-[10px] font-bold uppercase tracking-[0.2em] text-[#A5B0A7]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#B7FF3C]" />
              REVORA / TÜM KOLEKSİYON
            </p>

            <h2 className="max-w-[900px] font-[family-name:var(--font-manrope)] text-[clamp(2.7rem,6.5vw,6.8rem)] font-semibold leading-[1.02] tracking-[-0.065em]">
              Her detayda
              <span className="block text-[#B7FF3C]">
                fark yarat.
              </span>
            </h2>

            <p className="mt-7 max-w-[460px] text-[13px] leading-7 text-[#A5B0A7] sm:text-[14px]">
              Yıkamadan seramik korumaya, aracınız için
              ihtiyaç duyduğunuz tüm profesyonel bakım
              ürünleri tek koleksiyonda.
            </p>
          </div>

          <Link
            href="/urunler"
            className="group inline-flex min-h-[58px] shrink-0 items-center justify-between gap-10 bg-[#B7FF3C] px-6 py-4 font-[family-name:var(--font-manrope)] text-[11px] font-bold uppercase tracking-[0.12em] text-[#111312] transition-colors duration-300 hover:bg-white sm:min-w-[245px]"
          >
            Tüm Ürünleri Gör

            <ArrowUpRight
              size={20}
              strokeWidth={1.7}
              className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
            />
          </Link>
        </div>

        <div className="mt-14 border-t border-white/15 pt-6 sm:mt-20">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="font-[family-name:var(--font-manrope)] text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
              REVORA DETAILING
            </span>

            <span className="font-[family-name:var(--font-manrope)] text-[10px] font-semibold uppercase tracking-[0.12em] text-white/45">
              Profesyonel Araç Bakımı
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
