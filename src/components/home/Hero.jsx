import Link from "next/link";
import Image from "next/image";

import {
  ArrowDown,
  ArrowUpRight,
  Grid2X2,
} from "lucide-react";

import FoamEffect from "./FoamEffect";

export default function Hero() {
  return (
    <section
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
      {/* =====================================================
          BACKGROUND IMAGE
      ====================================================== */}

      <Image
        src="/images/hero/revora-hero.jpg"
        alt="Premium araç bakım ve detailing ürünleri"
        fill
        priority
        sizes="100vw"
        className="
          -z-40
          object-cover
          object-center
        "
      />

      {/* =====================================================
          DESKTOP LEFT CONTRAST OVERLAY
      ====================================================== */}

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

      {/* =====================================================
          GLOBAL CINEMATIC OVERLAY
      ====================================================== */}

      <div
        aria-hidden="true"
        className="
          absolute
          inset-0
          -z-30

          bg-black/10
        "
      />

      {/* =====================================================
          MOBILE OVERLAY
      ====================================================== */}

      <div
        aria-hidden="true"
        className="
          absolute
          inset-0
          -z-20

          bg-[linear-gradient(180deg,rgba(8,10,9,0.20)_0%,rgba(8,10,9,0.42)_40%,rgba(8,10,9,0.86)_100%)]

          lg:hidden
        "
      />

      {/* =====================================================
          BOTTOM GRADIENT
      ====================================================== */}

      <div
        aria-hidden="true"
        className="
          absolute
          inset-x-0
          bottom-0
          -z-20

          h-[42%]

          bg-gradient-to-t
          from-black/60
          via-black/20
          to-transparent
        "
      />

      {/* =====================================================
          SUBTLE TECHNICAL GRID
      ====================================================== */}

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

      {/* =====================================================
          FOAM EFFECT
          
          Görselin üzerinde,
          Hero yazılarının arkasında çalışır.
      ====================================================== */}

      <FoamEffect />

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div
        className="
          revora-container
          relative
          z-20

          grid
          h-full

          grid-rows-[auto_1fr_auto]

          py-5

          sm:py-6
          lg:py-7
        "
      >
        {/* ===================================================
            TOP META
        ==================================================== */}

        <div className="flex items-center justify-between">
          <div
            className="
              flex
              items-center
              gap-3

              font-[family-name:var(--font-manrope)]

              text-[9px]
              font-semibold
              uppercase

              tracking-[0.18em]

              text-white/75

              sm:text-[10px]
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

        {/* ===================================================
            CENTER
        ==================================================== */}

        <div
          className="
            flex
            min-h-0
            items-center
          "
        >
          <div className="w-full max-w-[900px]">
            {/* EYEBROW */}

            <p
              className="
                mb-3

                font-[family-name:var(--font-manrope)]

                text-[9px]
                font-bold
                uppercase

                tracking-[0.2em]

                text-[var(--accent)]

                sm:mb-4
                sm:text-[10px]

                lg:mb-5
                lg:text-[11px]
              "
            >
              Premium Car Care
            </p>

            {/* =================================================
                TITLE
            ================================================== */}

            <h1
              className="
                max-w-[900px]

                font-[family-name:var(--font-manrope)]

                text-[clamp(2.65rem,7vw,6.7rem)]
                font-semibold

                leading-[0.88]
                tracking-[-0.065em]

                text-white
              "
            >
              Kusursuzluk

              <span
                className="
                  block
                  text-white/60
                "
              >
                detaylarda başlar.
              </span>
            </h1>

            {/* =================================================
                DESCRIPTION
            ================================================== */}

            <p
              className="
                mt-4
                max-w-[500px]

                text-[12px]
                leading-[1.7]

                text-white/75

                sm:mt-5
                sm:text-[14px]

                lg:mt-6
                lg:text-[15px]
              "
            >
              Profesyonel detailing ürünleriyle aracınızın görünümünü
              koruyun, yenileyin ve her detayda fark yaratın.
            </p>

            {/* =================================================
                CTA BUTTONS
            ================================================== */}

            <div
              className="
                mt-5

                flex
                items-center
                gap-2

                sm:mt-6
                sm:gap-3

                lg:mt-7
              "
            >
              {/* ===============================================
                  PRIMARY CTA
              ================================================ */}

              <Link
                href="/urunler"
                className="
                  group

                  inline-flex

                  h-[50px]

                  items-center
                  justify-between

                  gap-5

                  bg-[var(--accent)]

                  px-4

                  font-[family-name:var(--font-manrope)]

                  text-[9px]
                  font-bold
                  uppercase

                  tracking-[0.12em]

                  text-[var(--carbon)]

                  shadow-[0_10px_35px_rgba(0,0,0,0.18)]

                  transition-all
                  duration-500
                  ease-[var(--ease-premium)]

                  hover:-translate-y-[2px]
                  hover:bg-white
                  hover:shadow-[0_14px_40px_rgba(0,0,0,0.25)]

                  sm:min-w-[185px]
                  sm:gap-7
                  sm:px-5

                  lg:h-[52px]
                  lg:min-w-[195px]
                  lg:px-6
                "
              >
                <span>
                  Ürünleri Keşfet
                </span>

                <ArrowUpRight
                  size={16}
                  strokeWidth={1.7}
                  className="
                    shrink-0

                    transition-transform
                    duration-500
                    ease-[var(--ease-premium)]

                    group-hover:translate-x-1
                    group-hover:-translate-y-1
                  "
                />
              </Link>

              {/* ===============================================
                  SECONDARY CTA
              ================================================ */}

              <Link
                href="/kategoriler"
                className="
                  group

                  hidden

                  h-[50px]

                  items-center
                  justify-between

                  gap-5

                  border
                  border-white/80

                  bg-[rgba(250,250,247,0.94)]

                  px-4

                  font-[family-name:var(--font-manrope)]

                  text-[9px]
                  font-bold
                  uppercase

                  tracking-[0.12em]

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

                  min-[390px]:inline-flex

                  sm:min-w-[180px]
                  sm:gap-7
                  sm:px-5

                  lg:h-[52px]
                  lg:min-w-[190px]
                  lg:px-6
                "
              >
                <span
                  className="
                    flex
                    items-center
                    gap-2.5
                  "
                >
                  <Grid2X2
                    size={14}
                    strokeWidth={1.8}
                    className="
                      hidden
                      sm:block
                    "
                  />

                  Kategoriler
                </span>

                <ArrowUpRight
                  size={16}
                  strokeWidth={1.7}
                  className="
                    shrink-0

                    transition-transform
                    duration-500
                    ease-[var(--ease-premium)]

                    group-hover:translate-x-1
                    group-hover:-translate-y-1
                  "
                />
              </Link>
            </div>
          </div>
        </div>

        {/* ===================================================
            BOTTOM
        ==================================================== */}

        <div
          className="
            flex
            items-end
            justify-between

            gap-4

            border-t
            border-white/20

            pt-4
          "
        >
          {/* =================================================
              SCROLL
          ================================================== */}

          <button
            type="button"
            aria-label="Aşağı kaydır"
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

          {/* =================================================
              META
          ================================================== */}

          <div
            className="
              flex
              items-center

              gap-4

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

/* =========================================================
   HERO META
========================================================= */

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

        gap-2
        sm:gap-3
      "
    >
      <span
        className="
          pt-[1px]

          font-[family-name:var(--font-manrope)]

          text-[7px]
          font-bold

          tracking-[0.14em]

          text-[var(--accent)]

          sm:text-[8px]
        "
      >
        {number}
      </span>

      <div>
        <p
          className="
            font-[family-name:var(--font-manrope)]

            text-[8px]
            font-semibold
            uppercase

            tracking-[0.1em]

            text-white

            sm:text-[9px]
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