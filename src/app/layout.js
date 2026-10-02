import { Inter, Manrope } from "next/font/google";
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
    <html lang="tr">
      <body className={`${inter.variable} ${manrope.variable}`}>
        {children}
      </body>
    </html>
  );
}
