import { getStoreProducts } from "@/lib/store-data";

export const dynamic = "force-dynamic";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://vicix.com.tr"
).replace(/\/+$/, "");

export default async function sitemap() {
  const products = await getStoreProducts();

  const staticPages = [
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/urunler`,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const productPages = products.map((product) => ({
    url: `${SITE_URL}/urunler/${encodeURIComponent(String(product.id))}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...productPages];
}
