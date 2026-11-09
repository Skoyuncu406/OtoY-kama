
"use client";

import Link from "next/link";
import Image from "next/image";

import {
  ArrowDown,
  ArrowUpRight,
  Grid2X2,
} from "lucide-react";

import FoamEffect from "./FoamEffect";

export default function Hero() {
  // Kategoriler bölümüne yumuşak kaydırma
  const handleCategoriesClick = (event) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const section = document.getElementById("kategoriler");

    if (!section) return;

    event.preventDefault();

    const header = document.querySelector(
      "[data-revora-sticky-header]"
    );

    const headerHeight = header
      ? header.getBoundingClientRect().height
      : 0;

    const sectionTop =
      section.getBoundingClientRect().top +
      window.scrollY;

    const targetPosition = Math.max(
      0,
      sectionTop - headerHeight
    );

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    window.scrollTo({
      top: targetPosition,
      behavior: reducedMotion ? "auto" : "smooth",
    });

    if (window.location.hash !== "#kategoriler") {
      window.history.replaceState(
        window.history.state,
        "",
        "/#kategoriler"
      );
    }
  };

  // Alttaki Keşfet butonu
  const handleExploreClick = () => {
    const section = document.getElementById("kategoriler");

    if (!section) return;

    const header = document.querySelector(
      "[data-revora-sticky-header]"
    );

    const headerHeight = header
      ? header.getBoundingClientRect().height
      : 0;

    const sectionTop =
      section.getBoundingClientRect().top +
      window.scrollY;

    window.scrollTo({
      top: Math.max(0, sectionTop - headerHeight),
      behavior: window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
        ? "auto"
        : "smooth",
    });

    if (window.location.hash !== "#kategoriler") {
      window.history.replaceState(
        window.history.state,
        "",
        "/#kategoriler"
      );
    }
  };

  return (
    <section
      id="hero"
      className="
        relative
        isolate
        h-[calc(100svh-var(--site-header-height))]
        min-h-[460px]
        w-full
        overflow-hidden
        bg-[var(--carbon)]
      "
    >
      {/* BACKGROUND IMAGE */}
      <Image
        src="/images/hero/revora-hero.jpg"
        alt="VICIX Car Care - Kırmızı Lamborghini Huracán ve araç bakım ürünleri"
        fill
        priority
        sizes="100vw"
        className="
          -z-40
          object-cover
          object-center
        "
      />

      {/* FAR IŞIKLARI — görselle aynı object-cover koordinat sistemi */}
      <HeadlightEffect />

      {/* DESKTOP LEFT CONTRAST OVERLAY */}
      <div
        aria-hidden="true"
        className="
          absolute
          inset-0
          -z-30
          hidden
          lg:block
          bg-[linear-gradient(90deg,rgba(8,10,9,0.82)_0%,rgba(8,10,9,0.67)_28%,rgba(8,10,9,0.30)_52%,rgba(8,10,9,0.04)_78%)]
        "
      />

      {/* GLOBAL CINEMATIC OVERLAY */}
      <div
        aria-hidden="true"
        className="
          absolute
          inset-0
          -z-30
          bg-black/10
        "
      />

      {/* MOBILE OVERLAY */}
      <div
        aria-hidden="true"
        className="
          absolute
          inset-0
          -z-20
          bg-[linear-gradient(180deg,rgba(8,10,9,0.42)_0%,rgba(8,10,9,0.18)_35%,rgba(8,10,9,0.12)_65%,rgba(8,10,9,0.75)_100%)]
          lg:hidden
        "
      />

      {/* BOTTOM GRADIENT */}
      <div
        aria-hidden="true"
        className="
          absolute
          inset-x-0
          bottom-0
          -z-20
          h-[45%]
          bg-gradient-to-t
          from-black/65
          via-black/20
          to-transparent
        "
      />

      {/* TECHNICAL GRID */}
      <div
        aria-hidden="true"
        className="
          absolute
          inset-0
          -z-10
          opacity-[0.045]
          [background-image:linear-gradient(rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.35)_1px,transparent_1px)]
          [background-size:80px_80px]
        "
      />

      {/* FOAM EFFECT */}
      <FoamEffect />

      {/* HERO CONTENT */}
      <div
        className="
          revora-container
          relative
          z-20
          grid
          h-full
          grid-rows-[auto_1fr_auto]
          py-4
          sm:py-6
          lg:py-7
        "
      >
        {/* TOP META */}
        <div className="flex items-center justify-between">
          <div
            className="
              flex
              items-center
              gap-2.5
              font-[family-name:var(--font-manrope)]
              text-[8px]
              font-semibold
              uppercase
              tracking-[0.15em]
              text-white/75
              sm:gap-3
              sm:text-[10px]
              sm:tracking-[0.18em]
            "
          >
            <span
              className="
                h-[6px]
                w-[6px]
                shrink-0
                rounded-full
                bg-[var(--accent)]
                shadow-[0_0_14px_rgba(183,255,60,0.65)]
              "
            />

            Profesyonel Detailing
          </div>

          <p
            className="
              hidden
              font-[family-name:var(--font-manrope)]
              text-[9px]
              font-semibold
              uppercase
              tracking-[0.18em]
              text-white/60
              md:block
            "
          >
            Araç bakımında yeni standart
          </p>
        </div>

        {/* MAIN CONTENT */}
        <div
          className="
            flex
            min-h-0
            items-start
            pt-5
            sm:pt-8
            lg:items-center
            lg:pt-0
          "
        >
          <div className="w-full max-w-[900px] lg:-translate-y-16 xl:-translate-y-20">
            {/* EYEBROW */}
            <p
              className="
                mb-2.5
                font-[family-name:var(--font-manrope)]
                text-[8px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-[var(--accent)]
                sm:mb-4
                sm:text-[10px]
                sm:tracking-[0.2em]
                lg:mb-5
                lg:text-[11px]
              "
            >
              Premium Car Care
            </p>

            {/* TITLE */}
            <h1
              className="
                max-w-[900px]
                font-[family-name:var(--font-manrope)]
                text-[clamp(2rem,8.5vw,6.7rem)]
                font-semibold
                leading-[0.95]
                tracking-[-0.06em]
                text-white
                sm:text-[clamp(2.35rem,8vw,6.7rem)]
                lg:text-[clamp(3.2rem,5.3vw,5.4rem)]
                lg:leading-[0.94]
              "
            >
              Kusursuzluk

              <span className="block text-white/60">
                detaylarda başlar.
              </span>
            </h1>

            {/* DESCRIPTION */}
            <p
              className="
                mt-3
                max-w-[500px]
                text-[11px]
                leading-[1.65]
                text-white/75
                sm:mt-5
                sm:text-[14px]
                lg:mt-6
                lg:text-[15px]
              "
            >
              Profesyonel detailing ürünleriyle aracınızın
              görünümünü koruyun, yenileyin ve her detayda
              fark yaratın.
            </p>

            {/* CTA BUTTONS */}
            <div
              className="
                mt-4
                flex
                w-full
                max-w-[400px]
                items-center
                gap-2
                sm:mt-6
                sm:max-w-none
                sm:gap-3
                lg:mt-7
              "
            >
              {/* PRIMARY CTA */}
              <Link
                href="/urunler"
                className="
                  group
                  inline-flex
                  h-[46px]
                  min-w-0
                  flex-1
                  items-center
                  justify-between
                  gap-1.5
                  bg-[var(--accent)]
                  px-3
                  font-[family-name:var(--font-manrope)]
                  text-[7.5px]
                  font-bold
                  uppercase
                  tracking-[0.06em]
                  text-[var(--carbon)]
                  shadow-[0_10px_35px_rgba(0,0,0,0.18)]
                  transition-all
                  duration-500
                  ease-[var(--ease-premium)]
                  hover:-translate-y-[2px]
                  hover:bg-white
                  hover:shadow-[0_14px_40px_rgba(0,0,0,0.25)]
                  sm:h-[50px]
                  sm:min-w-[185px]
                  sm:flex-none
                  sm:gap-7
                  sm:px-5
                  sm:text-[9px]
                  sm:tracking-[0.12em]
                  lg:h-[52px]
                  lg:min-w-[195px]
                  lg:px-6
                "
              >
                <span className="whitespace-nowrap">
                  Ürünleri Keşfet
                </span>

                <ArrowUpRight
                  size={14}
                  strokeWidth={1.7}
                  className="
                    shrink-0
                    transition-transform
                    duration-500
                    ease-[var(--ease-premium)]
                    group-hover:translate-x-1
                    group-hover:-translate-y-1
                    sm:h-4
                    sm:w-4
                  "
                />
              </Link>

              {/* SECONDARY CTA */}
              <Link
                href="/#kategoriler"
                onClick={handleCategoriesClick}
                className="
                  group
                  inline-flex
                  h-[46px]
                  min-w-0
                  flex-1
                  items-center
                  justify-between
                  gap-1.5
                  border
                  border-white/80
                  bg-[rgba(250,250,247,0.94)]
                  px-3
                  font-[family-name:var(--font-manrope)]
                  text-[7.5px]
                  font-bold
                  uppercase
                  tracking-[0.06em]
                  text-[var(--carbon)]
                  shadow-[0_10px_35px_rgba(0,0,0,0.18)]
                  backdrop-blur-xl
                  transition-all
                  duration-500
                  ease-[var(--ease-premium)]
                  hover:-translate-y-[2px]
                  hover:border-white
                  hover:bg-white
                  hover:shadow-[0_14px_40px_rgba(0,0,0,0.25)]
                  sm:h-[50px]
                  sm:min-w-[180px]
                  sm:flex-none
                  sm:gap-7
                  sm:px-5
                  sm:text-[9px]
                  sm:tracking-[0.12em]
                  lg:h-[52px]
                  lg:min-w-[190px]
                  lg:px-6
                "
              >
                <span
                  className="
                    flex
                    min-w-0
                    items-center
                    gap-1.5
                    whitespace-nowrap
                    sm:gap-2.5
                  "
                >
                  <Grid2X2
                    size={12}
                    strokeWidth={1.8}
                    className="
                      shrink-0
                      sm:h-[14px]
                      sm:w-[14px]
                    "
                  />

                  Kategoriler
                </span>

                <ArrowUpRight
                  size={14}
                  strokeWidth={1.7}
                  className="
                    shrink-0
                    transition-transform
                    duration-500
                    ease-[var(--ease-premium)]
                    group-hover:translate-x-1
                    group-hover:-translate-y-1
                    sm:h-4
                    sm:w-4
                  "
                />
              </Link>
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div
          className="
            flex
            items-end
            justify-between
            gap-3
            border-t
            border-white/20
            pt-3
            sm:gap-4
            sm:pt-4
          "
        >
          {/* SCROLL / EXPLORE */}
          <button
            type="button"
            aria-label="Kategorileri keşfet"
            onClick={handleExploreClick}
            className="
              group
              flex
              shrink-0
              items-center
              gap-3
              text-white/70
              transition-colors
              duration-300
              hover:text-white
            "
          >
            <span
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                border
                border-white/30
                bg-black/10
                backdrop-blur-sm
                transition-all
                duration-300
                group-hover:border-white/70
                group-hover:bg-white/10
              "
            >
              <ArrowDown
                size={13}
                strokeWidth={1.5}
                className="
                  transition-transform
                  duration-500
                  group-hover:translate-y-1
                "
              />
            </span>

            <span
              className="
                hidden
                font-[family-name:var(--font-manrope)]
                text-[8px]
                font-semibold
                uppercase
                tracking-[0.16em]
                sm:block
              "
            >
              Keşfet
            </span>
          </button>

          {/* META */}
          <div
            className="
              flex
              items-center
              gap-3
              sm:gap-7
              lg:gap-10
            "
          >
            <HeroMeta
              number="01"
              title="Profesyonel"
              description="Ürün Seçkisi"
            />

            <HeroMeta
              number="02"
              title="Premium"
              description="Araç Bakımı"
            />

            <div className="hidden md:block">
              <HeroMeta
                number="03"
                title="Güvenli"
                description="Alışveriş"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* HERO META */
function HeroMeta({
  number,
  title,
  description,
}) {
  return (
    <div
      className="
        flex
        items-start
        gap-1.5
        sm:gap-3
      "
    >
      <span
        className="
          pt-[1px]
          font-[family-name:var(--font-manrope)]
          text-[6px]
          font-bold
          tracking-[0.12em]
          text-[var(--accent)]
          sm:text-[8px]
          sm:tracking-[0.14em]
        "
      >
        {number}
      </span>

      <div>
        <p
          className="
            font-[family-name:var(--font-manrope)]
            text-[7px]
            font-semibold
            uppercase
            tracking-[0.07em]
            text-white
            sm:text-[9px]
            sm:tracking-[0.1em]
          "
        >
          {title}
        </p>

        <p
          className="
            mt-1
            hidden
            text-[8px]
            text-white/50
            lg:block
          "
        >
          {description}
        </p>
      </div>
    </div>
  );
}

/* Görselin doğal çözünürlüğü 1670 × 941.
   SVG aynı viewBox ve slice davranışıyla farları görsele sabitler. */
function HeadlightEffect() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 1670 941"
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none absolute inset-0 z-[1] h-full w-full overflow-hidden"
    >
      <defs>
        <filter id="vicix-headlight-glow" x="-130%" y="-200%" width="360%" height="500%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
        <filter id="vicix-headlight-core" x="-70%" y="-130%" width="240%" height="360%">
          <feGaussianBlur stdDeviation="2.8" />
        </filter>
        <radialGradient id="vicix-headlight-halo">
          <stop offset="0%" stopColor="#f8fcff" stopOpacity=".67" />
          <stop offset="30%" stopColor="#d9eeff" stopOpacity=".32" />
          <stop offset="100%" stopColor="#d9eeff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Farların etrafındaki yumuşak ışık yayılımı */}
      <g className="vicix-lamps vicix-lamps-halo">
        <ellipse cx="418" cy="553" rx="69" ry="43" fill="url(#vicix-headlight-halo)" />
        <ellipse cx="842" cy="547" rx="120" ry="56" fill="url(#vicix-headlight-halo)" />
      </g>

      {/* LED hatları: geniş glow, hafif blur ve keskin ışık çekirdeği */}
      <g className="vicix-lamps vicix-lamps-beam" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <g filter="url(#vicix-headlight-glow)" stroke="#e4f4ff" strokeWidth="17" opacity=".9">
          <path d="M 389 567 L 404 573 L 416 560 L 420 539 L 425 530 L 432 551 L 443 562" />
          <path d="M 769 563 L 796 578 L 820 567 L 834 548 L 855 561 L 874 537 L 938 512" />
        </g>
        <g filter="url(#vicix-headlight-core)" stroke="#f4faff" strokeWidth="8" opacity=".95">
          <path d="M 389 567 L 404 573 L 416 560 L 420 539 L 425 530 L 432 551 L 443 562" />
          <path d="M 769 563 L 796 578 L 820 567 L 834 548 L 855 561 L 874 537 L 938 512" />
        </g>
        <g stroke="#ffffff" strokeWidth="2.7" opacity=".95">
          <path d="M 389 567 L 404 573 L 416 560 L 420 539 L 425 530 L 432 551 L 443 562" />
          <path d="M 769 563 L 796 578 L 820 567 L 834 548 L 855 561 L 874 537 L 938 512" />
        </g>
      </g>
      <style>{`
        .vicix-lamps {
          opacity: 0;
          transform-box: fill-box;
          animation: vicix-lamps-on 3.2s cubic-bezier(.22,1,.36,1) 1.25s forwards;
        }
        .vicix-lamps-halo {
          animation-delay: 1.45s;
          animation-duration: 3.6s;
        }
        @keyframes vicix-lamps-on {
          0% { opacity: 0; }
          30% { opacity: .10; }
          65% { opacity: .55; }
          100% { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .vicix-lamps { animation: none; opacity: 1; }
        }
      `}</style>
    </svg>
  );
}
