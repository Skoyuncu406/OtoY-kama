"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, UserRound, Heart, ShoppingBag, Grid2X2, ChevronDown, ArrowUpRight } from "lucide-react";

const navigation = [
  { label: "Ürünler", href: "/urunler" },
  { label: "Kategoriler", href: "/#kategoriler" },
];

function isNormalClick(event) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

function smoothScrollTo(top) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top, behavior: reducedMotion ? "auto" : "smooth" });
}

function scrollToCategories() {
  const section = document.getElementById("kategoriler");
  if (!section) return false;
  const header = document.querySelector("[data-revora-sticky-header]");
  const headerHeight = header ? header.getBoundingClientRect().height : 0;
  const sectionTop = section.getBoundingClientRect().top + window.scrollY;
  smoothScrollTo(Math.max(0, sectionTop - headerHeight));
  return true;
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [categoriesActive, setCategoriesActive] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState(false);
  const requestIdRef = useRef(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const closeTimerRef = useRef(null);

  // Header, sayfa geçişlerinde korunabildiği için kategorileri yalnızca
  // ilk açılışta değil, menü açıldığında da güncelliyoruz.
  const loadCategories = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setCategoriesLoading(true);
    setCategoriesError(false);

    try {
      const response = await fetch("/api/store/categories", {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Kategoriler alınamadı");
      const data = await response.json();
      if (requestId !== requestIdRef.current) return;
      setCategories(Array.isArray(data.categories) ? data.categories : []);
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      console.error("VICIX kategori menüsü:", error);
      setCategoriesError(true);
      // Geçici ağ hatasında son başarılı listeyi koru.
    } finally {
      if (requestId === requestIdRef.current) setCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
    return () => { requestIdRef.current += 1; };
  }, [loadCategories, pathname]);

  useEffect(() => {
    setDropdownOpen(false);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
      if (pathname !== "/") {
        setCategoriesActive(false);
        return;
      }
      const section = document.getElementById("kategoriler");
      if (!section) {
        setCategoriesActive(false);
        return;
      }
      const header = document.querySelector("[data-revora-sticky-header]");
      const headerHeight = header ? header.getBoundingClientRect().height : 0;
      const sectionTop = section.getBoundingClientRect().top - headerHeight;
      const sectionBottom = section.getBoundingClientRect().bottom - headerHeight;
      setCategoriesActive(sectionTop <= 100 && sectionBottom > 100);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [pathname]);

  useEffect(() => {
    function handlePointerDown(event) {
      if (!dropdownRef.current?.contains(event.target)) setDropdownOpen(false);
    }
    function handleEscape(event) {
      if (event.key === "Escape") setDropdownOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const openDropdown = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    if (!dropdownOpen) {
      setDropdownOpen(true);
      loadCategories();
    }
  };

  const scheduleClose = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => setDropdownOpen(false), 130);
  };

  const handleLogoClick = (event) => {
    if (!isNormalClick(event) || pathname !== "/") return;
    event.preventDefault();
    if (window.location.hash) window.history.replaceState(window.history.state, "", "/");
    smoothScrollTo(0);
    setDropdownOpen(false);
  };

  const handleCategoryClick = (event) => {
    setDropdownOpen(false);
    if (!isNormalClick(event) || pathname !== "/") return;
    event.preventDefault();
    if (scrollToCategories() && window.location.hash !== "#kategoriler") {
      window.history.replaceState(window.history.state, "", "/#kategoriler");
    }
  };

  const productsActive = pathname === "/urunler" || pathname.startsWith("/urunler/");

  return (
    <>
      <header
        className={`relative z-40 h-[var(--header-height)] w-full min-w-0 border-b transition-all duration-500 ease-[var(--ease-premium)] ${
          scrolled
            ? "border-[var(--border)] bg-[rgba(244,243,239,0.95)] shadow-[0_8px_30px_rgba(17,19,18,0.04)] backdrop-blur-xl"
            : "border-transparent bg-[var(--background)]"
        }`}
      >
        <div className="h-full w-full px-3 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <div className="relative grid h-full w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-5">
            <div className="flex min-w-0 items-center justify-start">
              <HeaderSearch router={router} />
            </div>

            <nav aria-label="Ana navigasyon" className="hidden h-full items-center justify-center lg:flex">
              <div className="flex h-full items-center gap-7 xl:gap-10">
                <NavigationLink item={navigation[0]} />
                <Logo onClick={handleLogoClick} />

                <div
                  ref={dropdownRef}
                  className="relative flex h-full shrink-0 items-center"
                  onMouseEnter={openDropdown}
                  onMouseLeave={scheduleClose}
                  onFocus={openDropdown}
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) scheduleClose();
                  }}
                >
                  <Link
                    href="/#kategoriler"
                    onClick={handleCategoryClick}
                    aria-haspopup="true"
                    aria-expanded={dropdownOpen}
                    aria-controls="vicix-category-dropdown"
                    className="group relative flex h-full shrink-0 items-center gap-1.5 font-[family-name:var(--font-manrope)] text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--foreground)]"
                  >
                    <span className="transition-opacity duration-300 group-hover:opacity-60">Kategoriler</span>
                    <ChevronDown size={13} strokeWidth={1.6} className={`transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`} />
                    <span
                      aria-hidden="true"
                      className={`absolute bottom-[18px] left-0 h-px w-full bg-[var(--foreground)] transition-transform duration-500 ease-[var(--ease-premium)] ${dropdownOpen ? "scale-x-100" : "origin-right scale-x-0 group-hover:origin-left group-hover:scale-x-100"}`}
                    />
                  </Link>

                  <div
                    id="vicix-category-dropdown"
                    aria-hidden={!dropdownOpen}
                    className={`absolute right-0 top-full z-[70] w-[320px] origin-top-right pt-2 transition-all duration-200 ease-out xl:w-[350px] ${dropdownOpen ? "visible translate-y-0 opacity-100" : "invisible pointer-events-none -translate-y-2 opacity-0"}`}
                  >
                    <div className="overflow-hidden border border-[#E0E0D9] bg-[#F4F3EF] shadow-[0_24px_60px_rgba(17,19,18,0.13)]">
                      <div className="flex items-center justify-between border-b border-[#E0E0D9] px-6 py-5">
                        <div>
                          <span className="block text-[9px] font-semibold uppercase tracking-[0.2em] text-[#9A9E98]">VICIX CAR CARE</span>
                          <span className="mt-1 block font-[family-name:var(--font-manrope)] text-[17px] font-semibold tracking-[-0.035em] text-[#111312]">Koleksiyonlar</span>
                        </div>
                        <Grid2X2 size={18} strokeWidth={1.25} className="text-[#8D938C]" />
                      </div>

                      <div className="max-h-[min(55vh,440px)] overflow-y-auto py-2 [scrollbar-width:thin]">
                        {categories.length > 0 ? (
                          categories.map((category, index) => (
                            <Link
                              key={category.id}
                              href={`/urunler?kategori=${encodeURIComponent(category.slug)}`}
                              onClick={() => setDropdownOpen(false)}
                              tabIndex={dropdownOpen ? 0 : -1}
                              className="group/item flex items-center justify-between gap-3 px-6 py-3.5 transition-colors duration-200 hover:bg-[#EAECE7] focus-visible:bg-[#EAECE7] focus-visible:outline-none"
                            >
                              <span className="flex min-w-0 items-center gap-4">
                                <span className="w-5 shrink-0 text-[9px] tabular-nums text-[#A1A69F]">{String(index + 1).padStart(2, "0")}</span>
                                <span className="truncate font-[family-name:var(--font-manrope)] text-[12px] font-medium text-[#303530] transition-colors group-hover/item:text-[#A61922]">{category.name}</span>
                              </span>
                              <ArrowUpRight size={15} strokeWidth={1.4} className="shrink-0 text-[#A1A69F] transition-all duration-200 group-hover/item:-translate-y-0.5 group-hover/item:translate-x-0.5 group-hover/item:text-[#A61922]" />
                            </Link>
                          ))
                        ) : (
                          <p className="px-6 py-6 text-[12px] text-[#858B85]">
                            {categoriesLoading
                              ? "Kategoriler yükleniyor..."
                              : categoriesError
                                ? "Kategoriler alınamadı. Menüyü yeniden açarak tekrar deneyin."
                                : "Henüz aktif kategori bulunmuyor."}
                          </p>
                        )}
                      </div>

                      <Link
                        href="/#kategoriler"
                        onClick={handleCategoryClick}
                        tabIndex={dropdownOpen ? 0 : -1}
                        className="flex items-center justify-between border-t border-[#E0E0D9] px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#111312] transition-colors hover:bg-[#EAECE7]"
                      >
                        Tüm Kategorileri Keşfet
                        <ArrowUpRight size={15} strokeWidth={1.5} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </nav>

            <div className="pointer-events-none absolute inset-y-0 left-1/2 flex -translate-x-1/2 items-center justify-center lg:hidden">
              <div className="pointer-events-auto"><Logo onClick={handleLogoClick} /></div>
            </div>

            <div className="flex min-w-0 items-center justify-end gap-0 sm:gap-1 lg:gap-2">
              <HeaderAction label="Hesabım" href="/hesabim" icon={<UserRound size={18} strokeWidth={1.5} />} />
              <HeaderAction label="Favoriler" href="/favoriler" icon={<Heart size={18} strokeWidth={1.5} />} />
              <HeaderAction label="Sepet" href="/sepet" icon={<ShoppingBag size={18} strokeWidth={1.5} />} count={0} />
            </div>
          </div>
        </div>
      </header>

      <nav
        aria-label="Mobil hızlı navigasyon"
        className="fixed inset-x-0 bottom-0 z-[90] border-t border-[#D8DBD7] bg-[rgba(244,243,239,0.97)] pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(17,19,18,0.04)] backdrop-blur-xl lg:hidden"
      >
        <div className="relative grid h-[62px] w-full grid-cols-2">
          <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-7 w-px -translate-x-1/2 -translate-y-1/2 bg-[#D8DBD7]" />
          <MobileNavigationLink href="/#kategoriler" label="Kategoriler" active={categoriesActive} onClick={handleCategoryClick} icon={<Grid2X2 size={17} strokeWidth={1.6} />} />
          <MobileNavigationLink href="/urunler" label="Ürünler" active={productsActive} icon={<ShoppingBag size={17} strokeWidth={1.6} />} />
        </div>
      </nav>
    </>
  );
}

function MobileNavigationLink({ href, label, icon, active = false, onClick }) {
  return (
    <Link href={href} onClick={onClick} aria-current={active ? "page" : undefined} className="group relative flex h-full min-w-0 items-center justify-center px-2 font-[family-name:var(--font-manrope)] transition-colors duration-300 hover:bg-[#EAECE7]/60">
      <span className={`flex items-center justify-center gap-2 text-[11px] font-semibold tracking-[0.035em] transition-colors duration-300 ${active ? "text-[#A61922]" : "text-[#333733] group-hover:text-[#A61922]"}`}>
        <span className="flex shrink-0 items-center justify-center">{icon}</span>
        <span className="whitespace-nowrap">{label}</span>
      </span>
      <span aria-hidden="true" className={`absolute bottom-[8px] left-1/2 h-[2px] w-[28px] -translate-x-1/2 rounded-full bg-[#A61922] transition-all duration-300 ${active ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-60"}`} />
    </Link>
  );
}

function HeaderSearch({ router }) {
  const [query, setQuery] = useState("");
  const handleSubmit = (event) => {
    event.preventDefault();
    const searchValue = query.trim();
    if (searchValue) router.push(`/arama?q=${encodeURIComponent(searchValue)}`);
  };
  return (
    <form role="search" onSubmit={handleSubmit} className="group flex h-10 w-full min-w-0 max-w-[100px] items-center gap-1 border-b border-[#C7CCC5] transition-colors duration-300 focus-within:border-[#111312] min-[380px]:max-w-[125px] sm:max-w-[190px] sm:gap-2 lg:max-w-[240px]">
      <button type="submit" aria-label="Ürün ara" className="flex h-9 w-5 shrink-0 items-center justify-start text-[#111312] transition-opacity duration-300 hover:opacity-60 sm:w-6">
        <Search size={17} strokeWidth={1.6} />
      </button>
      <input type="search" name="q" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ürün ara..." aria-label="Ürün ara" autoComplete="off" enterKeyHint="search" className="h-full w-full min-w-0 border-0 bg-transparent p-0 font-[family-name:var(--font-manrope)] text-[10px] font-medium text-[#111312] outline-none ring-0 placeholder:text-[#9AA19A] focus:border-0 focus:bg-transparent focus:outline-none focus:ring-0 sm:text-[12px]" />
    </form>
  );
}

function NavigationLink({ item }) {
  return (
    <Link href={item.href} className="group relative flex h-full shrink-0 items-center font-[family-name:var(--font-manrope)] text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--foreground)]">
      <span className="transition-opacity duration-300 group-hover:opacity-60">{item.label}</span>
      <span aria-hidden="true" className="absolute bottom-[18px] left-0 h-px w-full origin-right scale-x-0 bg-[var(--foreground)] transition-transform duration-500 ease-[var(--ease-premium)] group-hover:origin-left group-hover:scale-x-100" />
    </Link>
  );
}

function Logo({ onClick }) {
  return (
    <Link href="/" onClick={onClick} aria-label="VICIX Ana Sayfa" className="group inline-flex h-[var(--header-height)] shrink-0 items-center justify-center">
      <Image src="/images/vicix-logo.png" alt="VICIX Car Care" width={160} height={160} priority sizes="(max-width: 639px) 55px, (max-width: 1023px) 62px, 68px" className="h-[55px] w-[55px] object-contain transition-transform duration-500 ease-[var(--ease-premium)] group-hover:scale-[1.04] sm:h-[62px] sm:w-[62px] lg:h-[68px] lg:w-[68px]" />
    </Link>
  );
}

function HeaderAction({ label, href, icon, count = 0 }) {
  return (
    <Link href={href} aria-label={label} title={label} className="group relative flex h-10 w-8 shrink-0 items-center justify-center text-[var(--foreground)] transition-opacity duration-300 hover:opacity-60 sm:w-10">
      {icon}
      {count > 0 && (
        <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--accent)] px-1 font-[family-name:var(--font-manrope)] text-[8px] font-extrabold leading-none text-[var(--carbon)]">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
