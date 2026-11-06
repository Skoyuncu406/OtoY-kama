import Hero from "@/components/home/Hero";
import Categories from "@/components/home/Categories";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import AllProductsCTA from "@/components/home/AllProductsCTA";

export const metadata = {
  title: "VICIX Car Care | Profesyonel Araç Bakım Ürünleri",
  description:
    "VICIX Car Care profesyonel araç bakım ürünleri, oto parfümleri, yıkama setleri ve araç bakım çözümleri.",

  icons: {
    icon: [
      {
        url: "/images/vicix-logo.png",
        type: "image/png",
      },
    ],
    shortcut: "/images/vicix-logo.png",
    apple: "/images/vicix-logo.png",
  },
};

export default function Home() {
  return (
    <main className="w-full min-w-0 overflow-x-clip">
      <Hero />
      <Categories />
      <FeaturedProducts />
      <AllProductsCTA />
    </main>
  );
}
