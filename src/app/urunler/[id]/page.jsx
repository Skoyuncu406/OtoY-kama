
import { notFound } from "next/navigation";
import { products } from "@/data/products";
import ProductDetail from "@/components/products/ProductDetail";
import RelatedProducts from "@/components/products/RelatedProducts";                            

export function generateStaticParams() {
  return products.map((product) => ({
    id: String(product.id),
  }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;

  const product = products.find(
    (item) => String(item.id) === id
  );

  if (!product) {
    return {
      title: "Ürün Bulunamadı | VICIX",
    };
  }

  return {
    title: `${product.name} | VICIX Car Care`,
    description: `${product.name} ürününü VICIX Car Care'de keşfedin.`,
  };
}

export default async function ProductDetailPage({
  params,
}) {
  const { id } = await params;

  const product = products.find(
    (item) => String(item.id) === id
  );

  if (!product) {
    notFound();
  }

  return (
    <>
      <ProductDetail product={product} />
      <RelatedProducts product={product} />
    </>
  );
}
