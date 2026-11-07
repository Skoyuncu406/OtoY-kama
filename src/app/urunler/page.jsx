
import { Suspense } from "react";

import ProductsCatalog from "@/components/products/ProductsCatalog";

import {
  getStoreCategories,
  getStoreProducts,
} from "@/lib/store-data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Ürünler | VICIX Car Care",
  description:
    "VICIX Car Care profesyonel araç bakım, detailing, yıkama, polisaj ve seramik koruma ürünlerini keşfedin.",
};

export default async function ProductsPage() {
  const [categories, products] = await Promise.all([
    getStoreCategories(),
    getStoreProducts(),
  ]);

  return (
    <Suspense
      fallback={
        <main className="min-h-screen w-full bg-[#F4F3EF]">
          <div className="revora-container py-16">
            <div className="h-3 w-32 animate-pulse bg-[#D8DBD7]" />

            <div className="mt-7 h-14 w-64 max-w-full animate-pulse bg-[#D8DBD7]" />

            <div className="mt-14 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="aspect-[4/5] animate-pulse bg-[#E6E8E3]"
                />
              ))}
            </div>
          </div>
        </main>
      }
    >
      <ProductsCatalog
        products={products}
        categories={categories}
      />
    </Suspense>
  );
}
