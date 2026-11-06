
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  Search,
  UserRound,
  Heart,
  ShoppingBag,
} from "lucide-react";

const navigation = [
  {
    label: "Ürünler",
    href: "/urunler",
  },
  {
    label: "Kategoriler",
    href: "/#kategoriler",
  },
];

function isNormalClick(event) {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

function smoothScrollTo(top) {
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  window.scrollTo({
    top,
    behavior: reducedMotion ? "auto" : "smooth",
  });
}

function scrollToCategories() {
  const section = document.getElementById("kategoriler");

  if (!section) return false;

  const header = document.querySelector(
    "[data-revora-sticky-header]"
  );

  const headerHeight = header
    ? header.getBoundingClientRect().height
    : 0;

  const sectionTop =
    section.getBoundingClientRect().top +
    window.scrollY;

  smoothScrollTo(
    Math.max(0, sectionTop - headerHeight)
  );

  return true;
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  const handleLogoClick = (event) => {
    if (!isNormalClick(event)) return;
    if (pathname !== "/") return;

    event.preventDefault();

    if (window.location.hash) {
      window.history.replaceState(
        window.history.state,
        "",
        "/"
      );
    }

    smoothScrollTo(0);
  };

  const handleNavigationClick = (event, item) => {
    if (!isNormalClick(event)) return;
    if (item.href !== "/#kategoriler") return;
    if (pathname !== "/") return;

    event.preventDefault();

    const found = scrollToCategories();

    if (found && window.location.hash !== "#kategoriler") {
      window.history.replaceState(
        window.history.state,
        "",
        "/#kategoriler"
      );
    }
  };

  return (
    <>
      {/* MAIN HEADER */}
      <header
        className={`
          relative
          z-40
          h-[var(--header-height)]
          w-full
          min-w-0
          border-b
          transition-all
          duration-500
          ease-[var(--ease-premium)]
          ${
            scrolled
              ? `
                border-[var(--border)]
                bg-[rgba(244,243,239,0.95)]
                shadow-[0_8px_30px_rgba(17,19,18,0.04)]
                backdrop-blur-xl
              `
              : `
                border-transparent
                bg-[var(--background)]
              `
          }
        `}
      >
        <div className="h-full w-full px-3 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <div
            className="
              relative
              grid
              h-full
              w-full
              min-w-0
              grid-cols-[minmax(0,1fr)_auto]
              items-center
              gap-2
              lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]
              lg:gap-5
            "
          >
            {/* LEFT - SEARCH */}
            <div className="flex min-w-0 items-center justify-start">
              <HeaderSearch router={router} />
            </div>

            {/* CENTER - DESKTOP NAVIGATION */}
            <nav
              aria-label="Ana navigasyon"
              className="hidden h-full items-center justify-center lg:flex"
            >
              <div className="flex h-full items-center gap-7 xl:gap-10">
                <NavigationLink
                  item={navigation[0]}
                  onClick={handleNavigationClick}
                />

                <Logo onClick={handleLogoClick} />

                <NavigationLink
                  item={navigation[1]}
                  onClick={handleNavigationClick}
                />
              </div>
            </nav>

            {/* CENTER - MOBILE LOGO */}
            <div
              className="
                pointer-events-none
                absolute
                inset-y-0
                left-1/2
                flex
                -translate-x-1/2
                items-center
                justify-center
                lg:hidden
              "
            >
              <div className="pointer-events-auto">
                <Logo onClick={handleLogoClick} />
              </div>
            </div>

            {/* RIGHT - USER / FAVORITES / CART */}
            <div
              className="
                flex
                min-w-0
                items-center
                justify-end
                gap-0
                sm:gap-1
                lg:gap-2
              "
            >
              <HeaderAction
                label="Hesabım"
                href="/hesabim"
                icon={
                  <UserRound
                    size={18}
                    strokeWidth={1.5}
                  />
                }
              />

              <HeaderAction
                label="Favoriler"
                href="/favoriler"
                icon={
                  <Heart
                    size={18}
                    strokeWidth={1.5}
                  />
                }
              />

              <HeaderAction
                label="Sepet"
                href="/sepet"
                icon={
                  <ShoppingBag
                    size={18}
                    strokeWidth={1.5}
                  />
                }
                count={0}
              />
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE FIXED BOTTOM NAVIGATION */}
      <nav
        aria-label="Mobil hızlı navigasyon"
        className="
          fixed
          inset-x-0
          bottom-0
          z-[90]
          border-t
          border-[var(--border)]
          bg-[rgba(244,243,239,0.97)]
          pb-[env(safe-area-inset-bottom)]
          shadow-[0_-8px_30px_rgba(17,19,18,0.04)]
          backdrop-blur-xl
          lg:hidden
        "
      >
        <div className="w-full px-4 sm:px-6">
          <div className="grid h-[58px] grid-cols-2 items-center">
            <Link
              href="/#kategoriler"
              onClick={(event) =>
                handleNavigationClick(
                  event,
                  navigation[1]
                )
              }
              className="
                flex
                h-full
                items-center
                justify-start
                font-[family-name:var(--font-manrope)]
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.1em]
                text-[var(--foreground)]
                transition-opacity
                duration-300
                hover:opacity-60
              "
            >
              Kategoriler
            </Link>

            <Link
              href="/urunler"
              className="
                flex
                h-full
                items-center
                justify-end
                font-[family-name:var(--font-manrope)]
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.1em]
                text-[var(--foreground)]
                transition-opacity
                duration-300
                hover:opacity-60
              "
            >
              Ürünler
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}

/* PREMIUM SEARCH */
function HeaderSearch({ router }) {
  const [query, setQuery] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const searchValue = query.trim();

    if (!searchValue) return;

    router.push(
      `/arama?q=${encodeURIComponent(searchValue)}`
    );
  };

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="
        group
        flex
        h-10
        w-full
        min-w-0
        max-w-[100px]
        items-center
        gap-1
        border-b
        border-[#C7CCC5]
        transition-colors
        duration-300
        focus-within:border-[#111312]
        min-[380px]:max-w-[125px]
        sm:max-w-[190px]
        sm:gap-2
        lg:max-w-[240px]
      "
    >
      <button
        type="submit"
        aria-label="Ürün ara"
        className="
          flex
          h-9
          w-5
          shrink-0
          items-center
          justify-start
          text-[#111312]
          transition-opacity
          duration-300
          hover:opacity-60
          sm:w-6
        "
      >
        <Search
          size={17}
          strokeWidth={1.6}
        />
      </button>

      <input
        type="search"
        name="q"
        value={query}
        onChange={(event) =>
          setQuery(event.target.value)
        }
        placeholder="Ürün ara..."
        aria-label="Ürün ara"
        autoComplete="off"
        enterKeyHint="search"
        className="
          h-full
          w-full
          min-w-0
          border-0
          bg-transparent
          p-0
          font-[family-name:var(--font-manrope)]
          text-[10px]
          font-medium
          text-[#111312]
          outline-none
          ring-0
          placeholder:text-[#9AA19A]
          focus:border-0
          focus:bg-transparent
          focus:outline-none
          focus:ring-0
          sm:text-[12px]
        "
      />
    </form>
  );
}

/* DESKTOP NAVIGATION LINK */
function NavigationLink({ item, onClick }) {
  return (
    <Link
      href={item.href}
      onClick={(event) => onClick(event, item)}
      className="
        group
        relative
        flex
        h-full
        shrink-0
        items-center
        font-[family-name:var(--font-manrope)]
        text-[11px]
        font-semibold
        uppercase
        tracking-[0.1em]
        text-[var(--foreground)]
      "
    >
      <span className="transition-opacity duration-300 group-hover:opacity-60">
        {item.label}
      </span>

      <span
        aria-hidden="true"
        className="
          absolute
          bottom-[18px]
          left-0
          h-px
          w-full
          origin-right
          scale-x-0
          bg-[var(--foreground)]
          transition-transform
          duration-500
          ease-[var(--ease-premium)]
          group-hover:origin-left
          group-hover:scale-x-100
        "
      />
    </Link>
  );
}

/* VICIX LOGO */
function Logo({ onClick }) {
  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label="VICIX Ana Sayfa"
      className="
        group
        inline-flex
        h-[var(--header-height)]
        shrink-0
        items-center
        justify-center
      "
    >
      <Image
        src="/images/vicix-logo.png"
        alt="VICIX Car Care"
        width={160}
        height={160}
        priority
        sizes="(max-width: 639px) 55px, (max-width: 1023px) 62px, 68px"
        className="
          h-[55px]
          w-[55px]
          object-contain
          transition-transform
          duration-500
          ease-[var(--ease-premium)]
          group-hover:scale-[1.04]
          sm:h-[62px]
          sm:w-[62px]
          lg:h-[68px]
          lg:w-[68px]
        "
      />
    </Link>
  );
}

/* HEADER ACTION */
function HeaderAction({
  label,
  href,
  icon,
  count = 0,
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className="
        group
        relative
        flex
        h-10
        w-8
        shrink-0
        items-center
        justify-center
        text-[var(--foreground)]
        transition-opacity
        duration-300
        hover:opacity-60
        sm:w-10
      "
    >
      {icon}

      {count > 0 && (
        <span
          className="
            absolute
            right-0
            top-0
            flex
            h-4
            min-w-4
            items-center
            justify-center
            rounded-full
            bg-[var(--accent)]
            px-1
            font-[family-name:var(--font-manrope)]
            text-[8px]
            font-extrabold
            leading-none
            text-[var(--carbon)]
          "
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
