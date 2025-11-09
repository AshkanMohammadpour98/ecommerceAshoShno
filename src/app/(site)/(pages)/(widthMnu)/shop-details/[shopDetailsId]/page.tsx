// app/shop-details/[shopDetailsId]/page.jsx
import { notFound } from "next/navigation";
import ShopDetails from "@/components/ShopDetails";

const API_URL = process.env.NEXT_PUBLIC_PRODUCTS_API || "http://localhost:3001/products";

// ISR هر 60 ثانیه
export const revalidate = 60;

async function getProductById(id) {
  try {
    const res = await fetch(API_URL, { next: { revalidate } });
    if (!res.ok) return null;

    const products = await res.json();
    return products.find((p) => p.id === id) || null;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

// متادیتای داینامیک براساس محصول
export async function generateMetadata({ params }) {
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

// پیش‌ساخت صفحات (SSG) برای همه محصولات
export async function generateStaticParams() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) return [];

    const products = await res.json();
    return products.map((p) => ({ shopDetailsId: p.id }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export default async function ShopDetailsPage({ params }) {
  const product = await getProductById(params.shopDetailsId);

  if (!product) {
    notFound();
  }

  return (
    <main>
      <ShopDetails product={product} />
    </main>
  );
}