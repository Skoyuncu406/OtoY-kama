import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    const categories = await prisma.category.count();
    const products = await prisma.product.count();

    return NextResponse.json({
      success: true,
      message: "VICIX veritabanı bağlantısı başarılı.",
      database: "Neon PostgreSQL",
      categories,
      products,
    });
  } catch (error) {
    console.error("VICIX DB test error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Veritabanı bağlantısı başarısız.",
      },
      { status: 500 },
    );
  }
}
