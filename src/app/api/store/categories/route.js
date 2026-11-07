import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },

      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        order: true,
      },

      orderBy: [
        {
          order: "asc",
        },
        {
          name: "asc",
        },
      ],
    });

    const formattedCategories = categories.map((category) => ({
      id: category.id,
      name: category.name,
      title: category.name,
      slug: category.slug,
      image: category.image,
      href: `/urunler?kategori=${encodeURIComponent(category.slug)}`,
    }));

    return NextResponse.json(
      {
        success: true,
        categories: formattedCategories,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("VICIX kategori API hatası:", error);

    return NextResponse.json(
      {
        success: false,
        categories: [],
        message: "Kategoriler yüklenirken bir hata oluştu.",
      },
      {
        status: 500,
      },
    );
  }
}
