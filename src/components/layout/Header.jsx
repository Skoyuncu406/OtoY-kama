"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  Menu,
  Search,
  UserRound,
  Heart,
  ShoppingBag,
  X,
  ChevronRight,
} from "lucide-react";

const navigation = [
  { label: "Ürünler", href: "/urunler" },
  { label: "Kategoriler", href: "/kategoriler" },
  { label: "Markalar", href: "/markalar" },
  { label: "Yeni Gelenler", href: "/yeni-gelenler" },
  { label: "Çok Satanlar", href: "/cok-satanlar" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <>
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header
        className={`
          relative
          h-[var(--header-height)]
          w-full
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
        <div className="revora-container h-full">
          <div
            className="
              grid
              h-full
              grid-cols-[1fr_auto_1fr]
              items-center
            "
          >
            {/* MOBILE MENU BUTTON */}

            <div className="flex items-center lg:hidden">
              <button
                type="button"
                aria-label="Menüyü aç"
                aria-expanded={mobileMenuOpen}
                onClick={() => setMobileMenuOpen(true)}
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-start
                  transition-opacity
                  duration-300
                  hover:opacity-60
                "
              >
                <Menu size={21} strokeWidth={1.6} />
              </button>
            </div>

            {/* DESKTOP LOGO */}

            <div className="hidden items-center lg:flex">
              <Logo />
            </div>

            {/* MOBILE LOGO */}

            <div className="flex justify-center lg:hidden">
              <Logo />
            </div>

            {/* DESKTOP NAVIGATION */}

            <nav
              aria-label="Ana navigasyon"
              className="
                hidden
                h-full
                items-center
                justify-center
                lg:flex
              "
            >
              <div
                className="
                  flex
                  h-full
                  items-center
                  gap-7
                  xl:gap-9
                "
              >
                {navigation.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="
                      group
                      relative
                      flex
                      h-full
                      items-center

                      font-[family-name:var(--font-manrope)]
                      text-[11px]
                      font-semibold
                      uppercase
                      tracking-[0.1em]

                      text-[var(--foreground)]
                    "
                  >
                    <span
                      className="
                        transition-opacity
                        duration-300
                        group-hover:opacity-60
                      "
                    >
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
                ))}
              </div>
            </nav>

            {/* ACTIONS */}

            <div
              className="
                flex
                items-center
                justify-end
                gap-1
                sm:gap-2
              "
            >
              <HeaderAction
                label="Ara"
                href="/arama"
                icon={<Search size={19} strokeWidth={1.5} />}
              />

              <div className="hidden sm:block">
                <HeaderAction
                  label="Hesabım"
                  href="/hesabim"
                  icon={<UserRound size={19} strokeWidth={1.5} />}
                />
              </div>

              <div className="hidden sm:block">
                <HeaderAction
                  label="Favoriler"
                  href="/favoriler"
                  icon={<Heart size={19} strokeWidth={1.5} />}
                />
              </div>

              <HeaderAction
                label="Sepet"
                href="/sepet"
                icon={<ShoppingBag size={19} strokeWidth={1.5} />}
                count={0}
              />
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================
          MOBILE MENU
      ====================================================== */}

      <div
        className={`
          fixed
          inset-0
          z-[100]

          transition-[visibility]
          duration-500

          ${
            mobileMenuOpen
              ? "visible"
              : "invisible delay-500"
          }
        `}
      >
        {/* BACKDROP */}

        <button
          type="button"
          aria-label="Menüyü kapat"
          onClick={() => setMobileMenuOpen(false)}
          className={`
            absolute
            inset-0

            h-full
            w-full

            bg-black/40
            backdrop-blur-[2px]

            transition-opacity
            duration-500

            ${
              mobileMenuOpen
                ? "opacity-100"
                : "opacity-0"
            }
          `}
        />

        {/* PANEL */}

        <div
          className={`
            absolute
            left-0
            top-0

            flex
            h-full
            w-[min(88%,420px)]
            flex-col

            bg-[var(--background)]

            shadow-[20px_0_60px_rgba(0,0,0,0.12)]

            transition-transform
            duration-700
            ease-[var(--ease-premium)]

            ${
              mobileMenuOpen
                ? "translate-x-0"
                : "-translate-x-full"
            }
          `}
        >
          {/* MOBILE MENU HEADER */}

          <div
            className="
              flex
              h-[var(--header-height)]
              shrink-0
              items-center
              justify-between

              border-b
              border-[var(--border)]

              px-5
              sm:px-7
            "
          >
            <Logo />

            <button
              type="button"
              aria-label="Menüyü kapat"
              onClick={() => setMobileMenuOpen(false)}
              className="
                flex
                h-10
                w-10
                items-center
                justify-end

                transition-all
                duration-500

                hover:rotate-90
                hover:opacity-60
              "
            >
              <X size={21} strokeWidth={1.5} />
            </button>
          </div>

          {/* MOBILE NAVIGATION */}

          <nav
            aria-label="Mobil navigasyon"
            className="
              flex-1
              overflow-y-auto

              px-5
              py-6

              sm:px-7
            "
          >
            <div>
              {navigation.map((item, index) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="
                    group

                    flex
                    min-h-[58px]
                    items-center
                    justify-between

                    border-b
                    border-[var(--border)]
                  "
                >
                  <div className="flex items-center gap-4">
                    <span
                      className="
                        w-5

                        font-[family-name:var(--font-manrope)]
                        text-[9px]
                        font-semibold
                        tracking-[0.12em]

                        text-[var(--muted)]
                      "
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span
                      className="
                        font-[family-name:var(--font-manrope)]
                        text-[15px]
                        font-semibold
                        tracking-[-0.02em]

                        transition-transform
                        duration-300

                        group-hover:translate-x-1
                      "
                    >
                      {item.label}
                    </span>
                  </div>

                  <ChevronRight
                    size={16}
                    strokeWidth={1.5}
                    className="
                      transition-transform
                      duration-300
                      group-hover:translate-x-1
                    "
                  />
                </Link>
              ))}
            </div>

            {/* ACCOUNT */}

            <div className="mt-9">
              <p
                className="
                  mb-4

                  font-[family-name:var(--font-manrope)]
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.18em]

                  text-[var(--muted)]
                "
              >
                Hesabım
              </p>

              <Link
                href="/hesabim"
                onClick={() => setMobileMenuOpen(false)}
                className="
                  flex
                  items-center
                  gap-3
                  py-2

                  text-sm
                  font-medium

                  transition-opacity
                  duration-300

                  hover:opacity-60
                "
              >
                <UserRound size={17} strokeWidth={1.5} />

                Giriş Yap / Üye Ol
              </Link>

              <Link
                href="/favoriler"
                onClick={() => setMobileMenuOpen(false)}
                className="
                  mt-2

                  flex
                  items-center
                  gap-3
                  py-2

                  text-sm
                  font-medium

                  transition-opacity
                  duration-300

                  hover:opacity-60
                "
              >
                <Heart size={17} strokeWidth={1.5} />

                Favorilerim
              </Link>
            </div>
          </nav>

          {/* FOOTER */}

          <div
            className="
              shrink-0

              border-t
              border-[var(--border)]

              px-5
              py-5

              sm:px-7
            "
          >
            <div className="flex items-center justify-between gap-4">
              <p
                className="
                  font-[family-name:var(--font-manrope)]
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.15em]

                  text-[var(--muted)]
                "
              >
                Premium Car Care & Detailing
              </p>

              <span
                className="
                  h-[6px]
                  w-[6px]
                  shrink-0
                  rounded-full
                  bg-[var(--accent)]
                "
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* =========================================================
   LOGO
========================================================= */

function Logo() {
  return (
    <Link
      href="/"
      aria-label="REVORA Ana Sayfa"
      className="
        inline-flex
        items-center
        whitespace-nowrap

        font-[family-name:var(--font-manrope)]
        text-[20px]
        font-extrabold
        leading-none
        tracking-[0.19em]

        text-[var(--foreground)]

        sm:text-[22px]
      "
    >
      REVORA

      <span
        aria-hidden="true"
        className="
          ml-[3px]
          mt-[-12px]

          h-[5px]
          w-[5px]

          shrink-0
          rounded-full

          bg-[var(--accent)]
        "
      />
    </Link>
  );
}

/* =========================================================
   HEADER ACTION
========================================================= */

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
      className="
        group
        relative

        flex
        h-10
        w-9
        items-center
        justify-center

        sm:w-10
      "
    >
      <span
        className="
          transition-all
          duration-300
          ease-[var(--ease-premium)]

          group-hover:-translate-y-[1px]
          group-hover:opacity-60
        "
      >
        {icon}
      </span>

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