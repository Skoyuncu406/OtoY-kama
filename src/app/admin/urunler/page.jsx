
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import ProductManager from "@/components/admin/ProductManager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Ürün Yönetimi | VICIX",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminProductsPage() {
  await requireAdmin();

  const [records, categoryRecords] = await Promise.all([
   
prisma.product.findMany({
  orderBy: { createdAt: "desc" },
  include: {
    category: {
      select: { name: true },
    },
    images: {
      orderBy: [
        { order: "asc" },
        { createdAt: "asc" },
      ],
      select: {
        id: true,
        url: true,
        order: true,
      },
    },
  },
}),

    prisma.category.findMany({
      orderBy: [
        { order: "asc" },
        { name: "asc" },
      ],
      select: {
        id: true,
        name: true,
      },
    }),
  ]);

  
const products = records.map((product) => ({
  id: product.id,
  name: product.name,
  slug: product.slug,
  description: product.description,
  details: product.details,
  categoryId: product.categoryId,
  categoryName: product.category.name,
  price: product.price.toString(),
  salePrice: product.salePrice?.toString() ?? null,
  stock: product.stock,
  isActive: product.isActive,
  isNew: product.isNew,
  isBestSeller: product.isBestSeller,
  images: product.images,
}));


  return (
    <main className="min-h-[calc(100svh-112px)] w-full overflow-x-clip bg-[#F4F3EF] px-5 py-10 text-[#191C19] sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-6xl">
        <Link
          href="/admin"
          className="mb-9 inline-flex items-center gap-2 text-xs font-semibold text-[#747974] transition-colors hover:text-[#A61922]"
        >
          <ArrowLeft size={16} />
          Yönetim Paneline Dön
        </Link>

        <header className="mb-10 border-b border-[#D9DCD6] pb-8">
          <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#A61922]">
            VICIX CAR CARE / ADMIN
          </span>

          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
            Ürün Yönetimi
          </h1>

          <p className="mt-3 text-sm leading-7 text-[#747974]">
            Mağazanızın ürünlerini, fiyatlarını ve stoklarını yönetin.
          </p>
        </header>

        {categoryRecords.length === 0 && (
          <div className="mb-8 border-l-2 border-[#A61922] bg-[#A61922]/5 px-5 py-4 text-sm">
            Ürün eklemek için önce bir kategori oluşturmalısınız.{" "}
            <Link
              href="/admin/kategoriler"
              className="font-semibold text-[#A61922] underline"
            >
              Kategori Yönetimi
            </Link>
          </div>
        )}

        <ProductManager
          products={products}
          categories={categoryRecords}
        />
      </div>
    </main>
  );
}
