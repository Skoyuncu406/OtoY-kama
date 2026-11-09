
import { notFound } from "next/navigation";

import ProductDetail from "@/components/products/ProductDetail";
import RelatedProducts from "@/components/products/RelatedProducts";

import {
  getStoreProductById,
  getStoreProducts,
} from "@/lib/store-data";

export const dynamic = "force-dynamic";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://vicix.com.tr"
).replace(/\/+$/, "");

function getProductUrl(id) {
  return `${SITE_URL}/urunler/${encodeURIComponent(String(id))}`;
}

function getProductDescription(product) {
  const description =
    typeof product.description === "string"
      ? product.description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
      : "";

  return (
    description ||
    `${product.name} ürününü VICIX'te keşfedin. Profesyonel oto bakım ve detailing ürünleri.`
  ).slice(0, 160);
}

function getProductImages(product) {
  const images = [
    product.image,
    product.imageUrl,
    ...(Array.isArray(product.images) ? product.images : []),
  ];

  return [
    ...new Set(
      images
        .map((item) => {
          if (typeof item === "string") return item;
          return item?.url || item?.src || null;
        })
        .filter(Boolean)
        .map((url) => {
          try {
            return new URL(url, SITE_URL).toString();
          } catch {
            return null;
          }
        })
        .filter(Boolean)
    ),
  ];
}

function getAvailability(product) {
  if (product.isActive === false || product.active === false) {
    return "https://schema.org/OutOfStock";
  }

  if (typeof product.stock === "number") {
    return product.stock > 0
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock";
  }

  return undefined;
}

function getPrice(product) {
  const price = Number(product.price);

  return Number.isFinite(price) && price >= 0 ? price : null;
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getStoreProductById(id);

  if (!product) {
    return {
      title: "Ürün Bulunamadı",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = product.name;
  const description = getProductDescription(product);
  const url = getProductUrl(id);
  const images = getProductImages(product);

  const isActive =
    product.isActive !== false && product.active !== false;

  return {
    title,
    description,

    alternates: {
      canonical: url,
    },

    robots: {
      index: isActive,
      follow: isActive,
    },

    openGraph: {
      type: "website",
      locale: "tr_TR",
      siteName: "VICIX",
      title: `${title} | VICIX`,
      description,
      url,
      ...(images.length > 0 ? { images } : {}),
    },

    twitter: {
      card: images.length > 0
        ? "summary_large_image"
        : "summary",
      title: `${title} | VICIX`,
      description,
      ...(images.length > 0
        ? { images: [images[0]] }
        : {}),
    },
  };
}

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  const product = await getStoreProductById(id);

  if (!product) {
    notFound();
  }

  const products = await getStoreProducts();

  const productUrl = getProductUrl(id);
  const productImages = getProductImages(product);
  const price = getPrice(product);
  const availability = getAvailability(product);

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: getProductDescription(product),
    url: productUrl,

    ...(productImages.length > 0
      ? { image: productImages }
      : {}),

    ...(product.sku ? { sku: String(product.sku) } : {}),

    ...(price !== null
      ? {
          offers: {
            "@type": "Offer",
            url: productUrl,
            priceCurrency: "TRY",
            price,
            ...(availability ? { availability } : {}),
            itemCondition: "https://schema.org/NewCondition",
          },
        }
      : {}),
  };

  const safeJsonLd = JSON.stringify(productSchema).replace(
    /</g,
    "\\u003c"
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd,
        }}
      />

      <ProductDetail product={product} />

      <RelatedProducts
        product={product}
        products={products}
      />
    </>
  );
}
