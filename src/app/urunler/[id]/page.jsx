
import { notFound } from "next/navigation";

import ProductDetail from "@/components/products/ProductDetail";
import RelatedProducts from "@/components/products/RelatedProducts";

import {
  getStoreProductById,
  getStoreProducts,
} from "@/lib/store-data";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;

  const product = await getStoreProductById(id);

  if (!product) {
    return {
      title: "Ürün Bulunamadı | VICIX",
    };
  }

  return {
    title: `${product.name} | VICIX Car Care`,
    description:
      product.description ||
      `${product.name} ürününü VICIX Car Care'de keşfedin.`,
  };
}

export default async function ProductDetailPage({ params }) {
  const { id } = await params;

  const product = await getStoreProductById(id);

  if (!product) {
    notFound();
  }

  const products = await getStoreProducts();

  return (
    <>
      <ProductDetail product={product} />

      <RelatedProducts
        product={product}
        products={products}
      />
    </>
  );
}
