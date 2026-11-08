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

export const metadata = {
  title: {
    default: "VICIX | Premium Oto Bakım & Detailing",
    template: "%s | VICIX",
  },
  description:
    "Profesyonel oto bakım, detailing, yıkama, polisaj ve araç koruma ürünleri. VICIX ile aracınıza hak ettiği bakımı sunun.",
  keywords: [
    "VICIX",
    "VICIX Car Care",
    "oto bakım",
    "detailing",
    "araç bakım ürünleri",
    "oto yıkama",
    "pasta cila",
    "seramik kaplama",
    "araç temizliği",
  ],
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
