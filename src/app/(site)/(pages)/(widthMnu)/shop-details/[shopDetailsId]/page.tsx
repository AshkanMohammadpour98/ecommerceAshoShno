// app/shop-details/[shopDetailsId]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ShopDetails from "@/components/ShopDetails";

type Product = {
  title: string;
  reviews: number;
  price: number;
  hasDiscount: boolean;
  discountedPrice?: number;
  id: string;
  categorie: string;
  date: string;
  imgs: {
    thumbnails: string[];
    previews: string[];
  };
  QRDatas: {
    id: string;
    name: string;
    config: {
      v: number;
      value: string;
      ecc: "L" | "M" | "Q" | "H";
      colors: { fg: string; bg: string };
    };
    preview: {
      url: string; // data:image/...
      width: number;
      height: number;
      mime: string;
    };
    dateAddQrCode: string;
  };
};

const API_URL =
  process.env.NEXT_PUBLIC_PRODUCTS_API ?? "http://localhost:3000/products";

// اختیاری: ISR هر 60 ثانیه
export const revalidate = 60;

async function getProductById(id: string): Promise<Product | null> {
  const res = await fetch(API_URL, { next: { revalidate } });
  if (!res.ok) return null;

  const products: Product[] = await res.json();
  return products.find((p) => p.id === id) ?? null;
}

// متادیتای داینامیک براساس محصول
export async function generateMetadata(
  { params }: { params: { shopDetailsId: string } }
): Promise<Metadata> {
  const product = await getProductById(params.shopDetailsId);
  if (!product) {
    return {
      title: "محصول یافت نشد | آسو شنو",
      description: "این محصول وجود ندارد یا حذف شده است.",
    };
  }
  return {
    title: `${product.title} | آسو شنو`,
    description: `جزئیات ${product.title}`,
  };
}

// اختیاری: پیش‌ساخت صفحات (SSG) برای همه محصولات
export async function generateStaticParams() {
  const res = await fetch(API_URL);
  if (!res.ok) return [];

  const products: Product[] = await res.json();
  return products.map((p) => ({ shopDetailsId: p.id }));
}

export default async function ShopDetailsPage(
  { params }: { params: { shopDetailsId: string } }
) {
  const product = await getProductById(params.shopDetailsId);

  if (!product) {
    notFound();
  }

  return (
    <main>
      {/* فرض بر اینه که ShopDetails یه prop به اسم product می‌گیره */}
      <ShopDetails product={product!} />
    </main>
  );
}