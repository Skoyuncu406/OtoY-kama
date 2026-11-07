import { Inter, Manrope } from "next/font/google";

import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
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
    default: "REVORA | Premium Oto Bakım & Detailing",
    template: "%s | REVORA",
  },
  description:
    "Profesyonel oto bakım, detailing, yıkama, polisaj ve araç koruma ürünleri. REVORA ile aracınıza hak ettiği bakımı sunun.",
  keywords: [
    "oto bakım",
    "detailing",
    "araç bakım ürünleri",
    "oto yıkama",
    "pasta cila",
    "seramik kaplama",
    "araç temizliği",
    "REVORA",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" data-scroll-behavior="smooth">
      <body
        className={`${inter.variable} ${manrope.variable} min-w-0 overflow-x-clip`}
      >
        <div data-revora-sticky-header className="sticky top-0 z-50 w-full">
          <AnnouncementBar />
          <Header />
        </div>

        {children}
        <Footer />
      </body>
    </html>
  );
}
