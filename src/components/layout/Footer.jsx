
import Link from "next/link";
import Image from "next/image";

import {
  ArrowUpRight,
  MessageCircle,
  Phone,
  MapPin,
  Mail,
  ArrowUp,
} from "lucide-react";

// İLETİŞİM BİLGİLERİ
const contact = {
  phoneDisplay: "0543 243 61 41",
  phoneHref: "tel:+905432436141",
  whatsapp: "https://wa.me/905432436141",
  instagram: "https://www.instagram.com/vicix.cix/",
  instagramName: "@vicix.cix",

  // Daha sonra güncellenecek
  address: null,
  email: null,
};

// FOOTER NAVIGATION
const footerLinks = [
  {
    label: "Ana Sayfa",
    href: "/",
  },
  {
    label: "Tüm Ürünler",
    href: "/urunler",
  },
  {
    label: "VICIX Koleksiyonu",
    href: "/urunler?kategori=vicix",
  },
  {
    label: "Kategoriler",
    href: "/#kategoriler",
  },
];

// INSTAGRAM SVG
function InstagramIcon({ size = 18, className = "" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="2"
        y="2"
        width="20"
        height="20"
        rx="5"
      />
      <circle cx="12" cy="12" r="4" />
      <circle
        cx="17.5"
        cy="6.5"
        r="1"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

// SOCIAL ICON BUTTON
// Hover sırasında ikon rengi koyu kırmızı kalır.
function SocialIconLink({
  href,
  label,
  children,
  external = false,
}) {
  return (
    <a
      href={href}
      aria-label={label}
      {...(external
        ? {
            target: "_blank",
            rel: "noopener noreferrer",
          }
        : {})}
      className="
        group/social
        flex
        h-10
        w-10
        shrink-0
        items-center
        justify-center
        border
        border-white/35
        bg-transparent
        !text-white
        transition-all
        duration-300
        hover:!border-white
        hover:!bg-white
        hover:!text-[#A61922]
        focus-visible:!border-white
        focus-visible:!bg-white
        focus-visible:!text-[#A61922]
        focus-visible:outline
        focus-visible:outline-2
        focus-visible:outline-offset-2
        focus-visible:outline-white
        [&_svg]:!text-current
      "
    >
      {children}
    </a>
  );
}

export default function Footer() {
  return (
    <footer
      className="
        w-full
        min-w-0
        overflow-hidden
        bg-[#A61922]
        text-[#FFF8F4]
      "
    >
      <div className="revora-container">
        {/* MAIN FOOTER */}
        <div
          className="
            grid
            grid-cols-1
            gap-10
            py-12
            sm:py-14
            lg:grid-cols-[1.3fr_0.7fr_1fr]
            lg:gap-12
            lg:py-16
          "
        >
          {/* BRAND AREA */}
          <div className="min-w-0">
            <Link
              href="/"
              aria-label="VICIX Car Care ana sayfa"
              className="group inline-flex items-center gap-3"
            >
              <Image
                src="/images/vicix-logo.png"
                alt="VICIX Car Care"
                width={64}
                height={64}
                className="
                  h-16
                  w-16
                  object-contain
                  transition-transform
                  duration-500
                  group-hover:scale-[1.04]
                "
              />

              <div>
                <span
                  className="
                    block
                    font-[family-name:var(--font-manrope)]
                    text-[23px]
                    font-bold
                    leading-none
                    tracking-[-0.055em]
                    text-white
                  "
                >
                  VICIX
                </span>

                <span
                  className="
                    mt-2
                    block
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.23em]
                    text-white/70
                  "
                >
                  CAR CARE
                </span>
              </div>
            </Link>

            <p
              className="
                mt-5
                max-w-[340px]
                text-[12px]
                leading-6
                text-white/75
              "
            >
              Aracınızın her detayında kaliteyi ön planda
              tutan bakım ürünleri. Profesyonel araç
              bakımına yönelik VICIX koleksiyonunu keşfedin.
            </p>

            {/* SOCIAL LINKS */}
            <div className="mt-6 flex items-center gap-3">
              <SocialIconLink
                href={contact.instagram}
                label="VICIX Instagram"
                external
              >
                <InstagramIcon size={18} />
              </SocialIconLink>

              <SocialIconLink
                href={contact.whatsapp}
                label="VICIX WhatsApp"
                external
              >
                <MessageCircle
                  size={18}
                  strokeWidth={1.7}
                />
              </SocialIconLink>

              <SocialIconLink
                href={contact.phoneHref}
                label="VICIX telefon"
              >
                <Phone
                  size={17}
                  strokeWidth={1.7}
                />
              </SocialIconLink>
            </div>
          </div>

          {/* NAVIGATION */}
          <div className="min-w-0">
            <h3
              className="
                mb-6
                font-[family-name:var(--font-manrope)]
                text-[10px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-white/60
              "
            >
              KEŞFEDİN
            </h3>

            <nav
              aria-label="Footer navigasyon"
              className="flex flex-col items-start gap-4"
            >
              {footerLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="
                    group
                    inline-flex
                    items-center
                    gap-2
                    text-[12px]
                    font-medium
                    text-white/90
                    transition-colors
                    duration-300
                    hover:text-white
                  "
                >
                  <span>{item.label}</span>

                  <ArrowUpRight
                    size={13}
                    strokeWidth={1.6}
                    className="
                      opacity-0
                      transition-all
                      duration-300
                      group-hover:-translate-y-0.5
                      group-hover:translate-x-0.5
                      group-hover:opacity-100
                    "
                  />
                </Link>
              ))}
            </nav>
          </div>

          {/* CONTACT AREA */}
          <div className="min-w-0">
            <h3
              className="
                mb-6
                font-[family-name:var(--font-manrope)]
                text-[10px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-white/60
              "
            >
              İLETİŞİM
            </h3>

            <div className="space-y-5">
              {/* PHONE */}
              <div className="flex items-start gap-3">
                <Phone
                  size={16}
                  strokeWidth={1.6}
                  className="mt-0.5 shrink-0 text-white/85"
                />

                <div className="min-w-0">
                  <p className="mb-1 text-[10px] text-white/60">
                    Telefon
                  </p>

                  <a
                    href={contact.phoneHref}
                    className="
                      text-[12px]
                      font-semibold
                      text-white
                      transition-opacity
                      duration-300
                      hover:opacity-70
                    "
                  >
                    {contact.phoneDisplay}
                  </a>
                </div>
              </div>

              {/* INSTAGRAM */}
              <div className="flex items-start gap-3">
                <InstagramIcon
                  size={16}
                  className="mt-0.5 shrink-0 text-white/85"
                />

                <div className="min-w-0">
                  <p className="mb-1 text-[10px] text-white/60">
                    Instagram
                  </p>

                  <a
                    href={contact.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      text-[12px]
                      font-semibold
                      text-white
                      transition-opacity
                      duration-300
                      hover:opacity-70
                    "
                  >
                    {contact.instagramName}
                  </a>
                </div>
              </div>

              {/* ADDRESS */}
              <div className="flex items-start gap-3">
                <MapPin
                  size={16}
                  strokeWidth={1.6}
                  className="mt-0.5 shrink-0 text-white/85"
                />

                <div className="min-w-0">
                  <p className="mb-1 text-[10px] text-white/60">
                    Adres
                  </p>

                  <p className="text-[12px] leading-6 text-white/80">
                    {contact.address ||
                      "Adres bilgisi yakında eklenecek."}
                  </p>
                </div>
              </div>

              {/* EMAIL */}
              {contact.email && (
                <div className="flex items-start gap-3">
                  <Mail
                    size={16}
                    strokeWidth={1.6}
                    className="mt-0.5 shrink-0 text-white/85"
                  />

                  <div className="min-w-0">
                    <p className="mb-1 text-[10px] text-white/60">
                      E-posta
                    </p>

                    <a
                      href={`mailto:${contact.email}`}
                      className="
                        break-all
                        text-[12px]
                        font-semibold
                        text-white
                        transition-opacity
                        duration-300
                        hover:opacity-70
                      "
                    >
                      {contact.email}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* WHATSAPP CTA */}
            <a
              href={contact.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="
                group
                mt-6
                inline-flex
                items-center
                justify-between
                gap-5
                border-b
                border-white/70
                pb-2
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.08em]
                text-white
                transition-all
                duration-300
                hover:border-white
                hover:text-white/75
              "
            >
              WhatsApp ile İletişim

              <ArrowUpRight
                size={16}
                strokeWidth={1.6}
                className="
                  transition-transform
                  duration-300
                  group-hover:-translate-y-0.5
                  group-hover:translate-x-0.5
                "
              />
            </a>
          </div>
        </div>

        {/* FOOTER BOTTOM */}
        <div
          className="
            flex
            flex-col
            gap-4
            border-t
            border-white/20
            py-5
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <p className="text-[10px] text-white/65">
            © {new Date().getFullYear()} VICIX Car Care.
            Tüm hakları saklıdır.
          </p>

          <div className="flex flex-wrap items-center gap-5">
            <span
              className="
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.15em]
                text-white/65
              "
            >
              DETAIL IN EVERY DRIVE
            </span>

            {/* BACK TO TOP */}
            <a
              href="#"
              aria-label="Sayfanın başına dön"
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                border
                border-white/35
                bg-transparent
                text-white
                transition-all
                duration-300
                hover:border-white
                hover:bg-white
                hover:!text-[#A61922]
                focus-visible:outline
                focus-visible:outline-2
                focus-visible:outline-offset-2
                focus-visible:outline-white
              "
            >
              <ArrowUp
                size={16}
                strokeWidth={1.6}
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
