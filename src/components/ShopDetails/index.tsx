// components/ShopDetails.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Product = {
  title: string;
  reviews: number; // امتیاز از 5 (در صورت تعداد نظر، می‌تونی تبدیلش کنی)
  price: number;
  hasDiscount: boolean;
  discountedPrice?: number;
  id: string;
  categorie: string;
  date: string;
  imgs?: {
    thumbnails?: string[];
    previews?: string[];
  };
  QRDatas?: {
    id: string;
    name: string;
    config?: {
      v: number;
      value: string;
      ecc: "L" | "M" | "Q" | "H";
      colors: { fg: string; bg: string };
    };
    preview?: {
      url: string; // data:...
      width: number;
      height: number;
      mime: string;
    };
    dateAddQrCode?: string;
  };
  // اختیاری: اگر بعدا ویژگی‌ها، توضیحات و ... اضافه کردی
  description?: string;
  specs?: Record<string, string | number>;
};

type Props = {
  product: Product;
  onAddToCart?: (p: Product, qty: number) => void;
  onBuyNow?: (p: Product, qty: number) => void;
  onToggleFavorite?: (p: Product, fav: boolean) => void;
};

export default function ShopDetails({
  product,
  onAddToCart,
  onBuyNow,
  onToggleFavorite,
}: Props) {
  const previews = product.imgs?.previews?.length
    ? product.imgs!.previews!
    : product.imgs?.thumbnails?.length
    ? product.imgs!.thumbnails!
    : ["/placeholder.png"];

  const [activeIndex, setActiveIndex] = useState(0);
  const [qty, setQty] = useState(1);
  const [fav, setFav] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [activeTab, setActiveTab] = useState<"desc" | "specs" | "reviews">(
    "desc"
  );
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [postalCode, setPostalCode] = useState("");

  const activeSrc = previews[Math.min(activeIndex, previews.length - 1)];
  const hasDiscount = product.hasDiscount && !!product.discountedPrice;

  const discountPercent = useMemo(() => {
    if (!hasDiscount || !product.discountedPrice || !product.price) return 0;
    return Math.max(
      0,
      Math.min(100, Math.round(100 - (product.discountedPrice / product.price) * 100))
    );
  }, [hasDiscount, product.discountedPrice, product.price]);

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("fa-IR").format(n) + " تومان";

  const rating = Math.max(0, Math.min(5, Number(product.reviews) || 0));

  useEffect(() => {
    const onScroll = () => {
      setShowStickyBar(window.scrollY > 360);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  };

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const title = product.title;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {}
    } else {
      copy(url);
    }
  };

  const handleAddToCart = () => onAddToCart?.(product, qty);
  const handleBuyNow = () => onBuyNow?.(product, qty);
  const handleToggleFav = () => {
    const next = !fav;
    setFav(next);
    onToggleFavorite?.(product, next);
  };

  // محاسبه صرفه‌جویی
  const saved = hasDiscount && product.discountedPrice
    ? Math.max(0, product.price - product.discountedPrice)
    : 0;

  return (
    <section dir="rtl" className="container py-6 md:py-10 font-euclid-circular-a">
      {/* Breadcrumb مینیمال */}
      <nav aria-label="breadcrumb" className="mb-5 text-custom-sm text-body">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="hover:text-dark">
              خانه
            </Link>
          </li>
          <span className="text-gray-5">/</span>
          <li>
            <Link href="/products" className="hover:text-dark">
              فروشگاه
            </Link>
          </li>
          <span className="text-gray-5">/</span>
          <li className="truncate max-w-[50vw] text-dark">{product.title}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* گالری */}
        <div className="lg:col-span-6">
          <div className="rounded-3xl border border-gray-3 bg-white p-3 shadow-2">
            {/* بنر تخفیف */}
            {hasDiscount && discountPercent > 0 && (
              <div className="mb-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-red-light-6 px-3 py-1 text-2xs font-bold text-red">
                  {discountPercent}% تخفیف ویژه
                </span>
              </div>
            )}

            {/* تصویر اصلی */}
            <div className="relative overflow-hidden rounded-2xl">
              <div className="relative aspect-square w-full">
                <Image
                  src={activeSrc}
                  alt={product.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 48vw"
                  className="object-contain"
                  priority
                />
              </div>
              {/* کنترل‌های قبلی/بعدی */}
              {previews.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setActiveIndex((i) => (i - 1 + previews.length) % previews.length)
                    }
                    className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full border border-gray-3 bg-white/90 p-2 text-dark shadow-1 hover:bg-white"
                    aria-label="تصویر قبلی"
                    title="قبلی"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setActiveIndex((i) => (i + 1) % previews.length)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full border border-gray-3 bg-white/90 p-2 text-dark shadow-1 hover:bg-white"
                    aria-label="تصویر بعدی"
                    title="بعدی"
                  >
                    ›
                  </button>
                </>
              )}

              {/* دکمه بزرگنمایی */}
              <button
                onClick={() => setLightbox(true)}
                className="absolute bottom-3 right-3 rounded-full border border-gray-3 bg-white/90 px-3 py-1.5 text-2xs font-bold text-dark shadow-1 hover:bg-white"
              >
                بزرگنمایی
              </button>
            </div>

            {/* thumbnails — موبایل: اسکرول افقی / دسکتاپ: گرید */}
            <div className="mt-4 hidden gap-3 sm:grid sm:grid-cols-6">
              {previews.map((src, i) => (
                <button
                  key={src + i}
                  onClick={() => setActiveIndex(i)}
                  className={`relative aspect-square overflow-hidden rounded-xl border transition ${
                    i === activeIndex
                      ? "border-blue ring-2 ring-blue-light-5"
                      : "border-gray-3 hover:border-gray-4"
                  }`}
                >
                  <Image
                    src={src}
                    alt={`${product.title} - ${i + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto sm:hidden">
              {previews.map((src, i) => (
                <button
                  key={src + i}
                  onClick={() => setActiveIndex(i)}
                  className={`relative h-20 w-20 flex-none overflow-hidden rounded-xl border transition ${
                    i === activeIndex ? "border-blue" : "border-gray-3"
                  }`}
                >
                  <Image
                    src={src}
                    alt={`${product.title} - ${i + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* جزئیات */}
        <div className="lg:col-span-6">
          <div className="rounded-3xl border border-gray-3 bg-white p-5 shadow-2 md:p-6">
            {/* عنوان و امتیاز */}
            <div className="mb-4">
              <h1 className="mb-2 text-custom-2 font-bold text-dark">
                {product.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-custom-xs text-body">
                {/* ستاره‌ها */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <svg
                      key={idx}
                      viewBox="0 0 24 24"
                      className={`h-5 w-5 ${
                        idx < Math.round(rating) ? "fill-yellow" : "fill-gray-2"
                      }`}
                    >
                      <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.786 1.401 8.168L12 18.896l-7.335 3.868 1.401-8.168L.132 9.21l8.2-1.192z" />
                    </svg>
                  ))}
                </div>
                <span className="text-gray-6">امتیاز: {rating} از ۵</span>
                <span className="h-1 w-1 rounded-full bg-gray-3"></span>
                <span>
                  دسته‌بندی:{" "}
                  <Link
                    href={`/category/${encodeURIComponent(product.categorie)}`}
                    className="text-blue hover:underline"
                  >
                    {product.categorie}
                  </Link>
                </span>
                <span className="h-1 w-1 rounded-full bg-gray-3"></span>
                <span>تاریخ: {product.date}</span>
                <span className="h-1 w-1 rounded-full bg-gray-3"></span>
                <span className="text-gray-6">کد محصول: {product.id}</span>
              </div>
            </div>

            {/* قیمت + صرفه‌جویی */}
            <div className="mb-5">
              {hasDiscount ? (
                <div className="flex flex-wrap items-end gap-3">
                  <div className="text-3xl font-extrabold text-red">
                    {formatPrice(product.discountedPrice!)}
                  </div>
                  <div className="text-custom-sm text-gray-5 line-through">
                    {formatPrice(product.price)}
                  </div>
                  <span className="rounded-full bg-red-light-6 px-2 py-0.5 text-2xs font-bold text-red">
                    {discountPercent}٪
                  </span>
                  {saved > 0 && (
                    <span className="text-custom-sm text-green">
                      صرفه‌جویی: {formatPrice(saved)}
                    </span>
                  )}
                </div>
              ) : (
                <div className="text-3xl font-extrabold text-dark">
                  {formatPrice(product.price)}
                </div>
              )}
            </div>

            {/* تعداد + اکشن‌ها */}
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
              {/* استپر تعداد */}
              <div className="inline-flex items-center gap-2">
                <span className="text-custom-sm text-body">تعداد:</span>
                <div className="flex select-none items-center overflow-hidden rounded-2xl border border-gray-3">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="px-3 py-2 text-dark hover:bg-gray-1"
                    aria-label="کاهش تعداد"
                  >
                    −
                  </button>
                  <span className="min-w-[2.5rem] text-center font-bold text-dark">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((q) => Math.min(99, q + 1))}
                    className="px-3 py-2 text-dark hover:bg-gray-1"
                    aria-label="افزایش تعداد"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* دکمه‌ها */}
              <div className="flex flex-1 flex-wrap items-center gap-3">
                <button
                  onClick={handleBuyNow}
                  className="rounded-2xl bg-blue px-5 py-3 text-custom-sm font-bold text-white transition hover:bg-blue-dark"
                >
                  خرید سریع
                </button>
                <button
                  onClick={handleAddToCart}
                  className="rounded-2xl border border-blue bg-blue-light-5 px-5 py-3 text-custom-sm font-bold text-blue transition hover:bg-blue-light-4"
                >
                  افزودن به سبد
                </button>
                <button
                  onClick={handleToggleFav}
                  aria-pressed={fav}
                  className={`rounded-2xl px-5 py-3 text-custom-sm font-bold transition ${
                    fav
                      ? "bg-red text-white hover:bg-red-dark"
                      : "border border-gray-3 bg-white text-dark hover:bg-gray-1"
                  }`}
                >
                  {fav ? "در علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی"}
                </button>
              </div>
            </div>

            {/* باکس‌های اعتماد */}
            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-gray-3 bg-white p-3 text-custom-sm text-dark shadow-1">
                🚚 ارسال سریع به سراسر کشور
              </div>
              <div className="rounded-2xl border border-gray-3 bg-white p-3 text-custom-sm text-dark shadow-1">
                ✅ ضمانت اصالت کالا
              </div>
              <div className="rounded-2xl border border-gray-3 bg-white p-3 text-custom-sm text-dark shadow-1">
                ↩️ ۷ روز ضمانت بازگشت
              </div>
            </div>

            {/* چک موجودی/ارسال ساده (UI) */}
            <div className="mb-6 flex flex-col items-stretch gap-3 rounded-2xl border border-gray-3 bg-white p-3 shadow-1 sm:flex-row sm:items-center">
              <div className="text-custom-sm text-dark">
                زمان ارسال به شهر شما:
              </div>
              <div className="flex flex-1 items-center gap-2">
                <input
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full rounded-xl border border-gray-3 bg-white px-3 py-2 text-custom-sm text-dark outline-none focus:shadow-input"
                  placeholder="کد پستی را وارد کنید"
                />
                <button
                  className="whitespace-nowrap rounded-xl bg-gray-1 px-4 py-2 text-custom-sm font-bold text-dark hover:bg-gray-2"
                  onClick={() => {
                    // اینجا می‌تونی براساس API زمان ارسال رو محاسبه کنی
                  }}
                >
                  بررسی
                </button>
              </div>
            </div>

            {/* QR + اشتراک‌گذاری */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* QR */}
              {product.QRDatas?.preview?.url ? (
                <div className="flex items-center justify-between rounded-2xl border border-gray-3 bg-white p-3 shadow-1">
                  <div className="flex items-center gap-3">
                    <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-gray-3">
                      <Image
                        src={product.QRDatas.preview.url}
                        alt={`QR - ${product.title}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="text-custom-xs text-dark">
                      <div className="font-bold">QR محصول</div>
                      {product.QRDatas?.dateAddQrCode && (
                        <div className="text-body">
                          تاریخ افزودن: {product.QRDatas.dateAddQrCode}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {product.QRDatas?.config?.value && (
                      <button
                        onClick={() => copy(product.QRDatas!.config!.value)}
                        className="rounded-xl border border-gray-3 bg-white px-3 py-2 text-2xs font-bold text-dark hover:bg-gray-1"
                      >
                        کپی لینک
                      </button>
                    )}
                    <button
                      onClick={() => setLightbox(true)}
                      className="rounded-xl bg-dark px-3 py-2 text-2xs font-bold text-white hover:bg-dark-2"
                    >
                      نمایش بزرگ
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-gray-3 bg-white p-4 text-custom-sm text-body shadow-1">
                  کد QR برای این محصول ثبت نشده است.
                </div>
              )}

              {/* Share */}
              <div className="flex items-center justify-between rounded-2xl border border-gray-3 bg-white p-3 shadow-1">
                <div className="text-custom-sm">
                  <div className="font-bold text-dark">اشتراک‌گذاری</div>
                  <div className="text-body">لینک محصول را به اشتراک بگذارید</div>
                </div>
                <button
                  onClick={share}
                  className="rounded-xl bg-blue px-3 py-2 text-2xs font-bold text-white hover:bg-blue-dark"
                >
                  اشتراک‌گذاری
                </button>
              </div>
            </div>

            {/* تب‌ها: توضیحات / مشخصات / نظرات */}
            <div className="mt-6">
              <div className="mb-3 flex gap-2">
                <Tab
                  active={activeTab === "desc"}
                  onClick={() => setActiveTab("desc")}
                >
                  توضیحات
                </Tab>
                <Tab
                  active={activeTab === "specs"}
                  onClick={() => setActiveTab("specs")}
                >
                  مشخصات
                </Tab>
                <Tab
                  active={activeTab === "reviews"}
                  onClick={() => setActiveTab("reviews")}
                >
                  نظرات
                </Tab>
              </div>

              <div className="rounded-2xl border border-gray-3 bg-white p-4 shadow-1">
                {activeTab === "desc" && (
                  <div className="prose max-w-none text-custom-sm text-dark">
                    {product.description ? (
                      <p>{product.description}</p>
                    ) : (
                      <ul className="list-inside list-disc leading-7 text-body">
                        <li>طراحی ارگونومیک و کیفیت ساخت بالا</li>
                        <li>سازگار با انواع دستگاه‌ها</li>
                        <li>گارانتی و خدمات پس از فروش</li>
                      </ul>
                    )}
                  </div>
                )}

                {activeTab === "specs" && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {Object.keys(product.specs ?? {}).length ? (
                      Object.entries(product.specs!).map(([k, v]) => (
                        <div
                          key={k}
                          className="flex items-center justify-between rounded-xl bg-gray-1 p-3 text-custom-sm"
                        >
                          <span className="text-body">{k}</span>
                          <span className="font-bold text-dark">{String(v)}</span>
                        </div>
                      ))
                    ) : (
                      <>
                        <SpecItem label="شناسه" value={product.id} />
                        <SpecItem label="دسته‌بندی" value={product.categorie} />
                        <SpecItem label="تاریخ" value={product.date} />
                        {hasDiscount && product.discountedPrice && (
                          <SpecItem
                            label="قیمت با تخفیف"
                            value={formatPrice(product.discountedPrice)}
                          />
                        )}
                      </>
                    )}
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {/* خلاصه امتیاز */}
                    <div className="rounded-2xl border border-gray-3 bg-white p-4 text-center">
                      <div className="text-3xl font-extrabold text-dark">
                        {rating.toFixed(1)}
                      </div>
                      <div className="mt-1 flex justify-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.round(rating) ? "text-yellow" : "text-gray-3"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <div className="mt-2 text-custom-xs text-body">
                        میانگین امتیاز از ۵
                      </div>
                    </div>

                    {/* توزیع امتیازات (دمو) */}
                    <div className="md:col-span-2">
                      {([5, 4, 3, 2, 1] as const).map((star) => (
                        <div key={star} className="mb-2 flex items-center gap-3">
                          <span className="w-6 text-custom-xs text-dark">{star}★</span>
                          <div className="h-2 flex-1 rounded-full bg-gray-2">
                            <div
                              className="h-2 rounded-full bg-green"
                              style={{
                                width: `${Math.max(10, Math.min(100, star * 18))}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                      {/* دکمه ثبت نظر (UI) */}
                      <div className="mt-4">
                        <button className="rounded-xl border border-gray-3 bg-white px-4 py-2 text-custom-sm font-bold text-dark hover:bg-gray-1">
                          ثبت نظر شما
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-9999 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-h-[90vh] max-w-[95vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={activeSrc}
              alt={product.title}
              width={1400}
              height={1400}
              className="h-full w-full rounded-2xl object-contain"
            />
            <button
              onClick={() => setLightbox(false)}
              className="absolute right-2 top-2 rounded-full bg-white px-3 py-1 text-2xs font-bold text-dark shadow-1 hover:bg-gray-1"
            >
              بستن
            </button>
          </div>
        </div>
      )}

      {/* نوار CTA شناور موبایل */}
      {showStickyBar && (
        <div className="fixed inset-x-0 bottom-0 z-999 bg-white/95 backdrop-blur border-t border-gray-3 md:hidden">
          <div className="container flex items-center justify-between gap-3 py-3">
            <div className="flex flex-col">
              <span className="text-2xs text-body">قیمت</span>
              <span className="text-custom-1 font-extrabold text-dark">
                {hasDiscount && product.discountedPrice
                  ? formatPrice(product.discountedPrice)
                  : formatPrice(product.price)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddToCart}
                className="rounded-xl border border-blue bg-blue-light-5 px-4 py-2 text-2xs font-bold text-blue"
              >
                افزودن به سبد
              </button>
              <button
                onClick={handleBuyNow}
                className="rounded-xl bg-blue px-4 py-2 text-2xs font-bold text-white"
              >
                خرید
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* کامپوننت‌های کوچک کمکی */
function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border px-4 py-2 text-custom-sm font-bold transition ${
        active
          ? "border-blue bg-blue-light-5 text-blue"
          : "border-gray-3 bg-white text-dark hover:bg-gray-1"
      }`}
    >
      {children}
    </button>
  );
}

function SpecItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-gray-1 p-3 text-custom-sm">
      <span className="text-body">{label}</span>
      <span className="font-bold text-dark">{value}</span>
    </div>
  );
}

/* اختیار: اسکلت لودینگ */
export function ShopDetailsSkeleton() {
  return (
    <section dir="rtl" className="container py-6 md:py-10">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <div className="rounded-3xl border border-gray-3 bg-white p-3 shadow-2">
            <div className="aspect-square w-full animate-pulse rounded-2xl bg-gray-1" />
            <div className="mt-4 grid grid-cols-5 gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="aspect-square animate-pulse rounded-xl bg-gray-1" />
              ))}
            </div>
          </div>
        </div>
        <div className="lg:col-span-6">
          <div className="rounded-3xl border border-gray-3 bg-white p-5 shadow-2 md:p-6">
            <div className="mb-4 h-8 w-1/2 animate-pulse rounded bg-gray-1" />
            <div className="mb-5 h-6 w-1/3 animate-pulse rounded bg-gray-1" />
            <div className="mb-6 h-10 w-full animate-pulse rounded-2xl bg-gray-1" />
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-2xl bg-gray-1" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}