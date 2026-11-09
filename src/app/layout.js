import { Inter, Manrope } from "next/font/google";

import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import { CartProvider } from "@/context/CartContext";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/+$/, "");

const siteName = "VICIX";

const siteTitle = "VICIX | Profesyonel Oto Bakım ve Detailing Ürünleri";

const siteDescription =
  "VICIX'te profesyonel oto bakım, araç temizliği, oto yıkama, jant temizliği, lastik parlatıcı ve detailing ürünlerini keşfedin.";

export const metadata = {
  metadataBase: new URL(siteUrl),

  applicationName: siteName,

  title: {
    default: siteTitle,
    template: "%s | VICIX",
  },

  description: siteDescription,

  keywords: [
    "VICIX",
    "VICIX Car Care",
    "oto bakım ürünleri",
    "profesyonel oto bakım",
    "oto detailing",
    "araç bakım ürünleri",
    "oto yıkama ürünleri",
    "jant temizleme",
    "lastik parlatıcı",
    "araç iç temizlik",
    "pasta cila",
    "seramik kaplama",
  ],

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: siteUrl,
    siteName,
    title: siteTitle,
    description: siteDescription,
  },

  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },

  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" data-scroll-behavior="smooth">
      <body
        className={`${inter.variable} ${manrope.variable} min-w-0 overflow-x-clip`}
      >
        <CartProvider>
          <div data-revora-sticky-header className="sticky top-0 z-50 w-full">
            <AnnouncementBar />
            <Header />
          </div>

          {children}

          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
