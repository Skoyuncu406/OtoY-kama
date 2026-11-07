
import {
  Package,
  Grid2X2,
  Images,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import LogoutButton from "@/components/admin/LogoutButton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard | VICIX Yönetim",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();

  const [productCount, categoryCount, imageCount] =
    await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.productImage.count(),
    ]);

  const stats = [
    {
      label: "Toplam Ürün",
      value: productCount,
      icon: Package,
    },
    {
      label: "Kategoriler",
      value: categoryCount,
      icon: Grid2X2,
    },
    {
      label: "Ürün Görselleri",
      value: imageCount,
      icon: Images,
    },
  ];

  return (
    <main className="min-h-[calc(100svh-112px)] w-full overflow-x-clip bg-[#F4F3EF] px-5 py-10 text-[#191C19] sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-6xl">
        <header className="flex flex-wrap items-start justify-between gap-6 border-b border-[#D9DCD6] pb-8">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#A61922]">
              VICIX CAR CARE / ADMIN
            </span>

            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
              Yönetim Paneli
            </h1>

            <p className="mt-3 text-sm text-[#747974]">
              Hoş geldiniz, {admin.name}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="hidden items-center gap-2 text-xs text-[#747974] sm:flex">
              <ShieldCheck
                size={17}
                className="text-[#A61922]"
              />
              Güvenli Oturum
            </div>

            <LogoutButton />
          </div>
        </header>

        <section className="grid gap-8 border-b border-[#D9DCD6] py-10 sm:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div key={stat.label} className="space-y-4">
                <Icon
                  size={23}
                  strokeWidth={1.5}
                  className="text-[#A61922]"
                />

                <p className="text-4xl font-semibold tracking-tight sm:text-5xl">
                  {stat.value}
                </p>

                <p className="text-sm text-[#747974]">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </section>

        <section className="py-10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                İçerik Yönetimi
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#747974]">
                Mağazanızın ürünlerini ve kategorilerini buradan yöneteceksiniz.
              </p>
            </div>

            <ArrowUpRight
              size={22}
              strokeWidth={1.5}
              className="shrink-0 text-[#A61922]"
            />
          </div>

          <div className="mt-8 grid gap-5 border-t border-[#D9DCD6] pt-6 sm:grid-cols-2">
            <div className="border-b border-[#D9DCD6] pb-5">
              <p className="text-sm font-semibold">
                Kategori Yönetimi
              </p>
              <p className="mt-2 text-xs leading-6 text-[#747974]">
                Kategori ekleme, düzenleme ve sıralama
              </p>
              <span className="mt-4 inline-block text-[11px] font-semibold uppercase tracking-wider text-[#A61922]">
                <Link
  href="/admin/kategoriler"
  className="mt-4 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[#A61922] transition-colors hover:text-[#85141B]"
>
  Kategorileri Yönet
  <ArrowUpRight size={15} />
</Link>
              </span>
            </div>

            <div className="border-b border-[#D9DCD6] pb-5">
              <p className="text-sm font-semibold">
                Ürün Yönetimi
              </p>
              <p className="mt-2 text-xs leading-6 text-[#747974]">
                Ürün, fiyat, stok ve görsel yönetimi
              </p>
              <span className="mt-4 inline-block text-[11px] font-semibold uppercase tracking-wider text-[#A61922]">
                <Link
  href="/admin/urunler"
  className="mt-4 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[#A61922] transition-colors hover:text-[#85141B]"
>
  Ürünleri Yönet
  <ArrowUpRight size={15} />
</Link>
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
