import Hero from "@/components/home/Hero";
import Categories from "@/components/home/Categories";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import AllProductsCTA from "@/components/home/AllProductsCTA";

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
