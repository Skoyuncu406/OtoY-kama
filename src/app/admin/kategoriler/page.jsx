
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import CategoryManager from "@/components/admin/CategoryManager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Kategori Yönetimi | VICIX",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminCategoriesPage() {
  await requireAdmin();

  const records = await prisma.category.findMany({
    orderBy: [
      { order: "asc" },
      { createdAt: "asc" },
    ],
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

const categories = records.map((category) => ({
  id: category.id,
  name: category.name,
  slug: category.slug,
  image: category.image,
  order: category.order,
  isActive: category.isActive,
  productCount: category._count.products,
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
            Kategori Yönetimi
          </h1>

          <p className="mt-3 text-sm leading-7 text-[#747974]">
            Mağazanızın kategorilerini oluşturun, düzenleyin ve yönetin.
          </p>
        </header>

        <CategoryManager categories={categories} />
      </div>
    </main>
  );
}
