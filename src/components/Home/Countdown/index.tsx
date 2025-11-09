"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

// تایپ محصول (از /products)
type Product = {
  title: string;
  count: number;
  reviews: number;
  price: number;
  hasDiscount: boolean;
  discountedPrice: number;
  id: string | number;
  categorie: string;
  date: string;
  imgs: { thumbnails: string[]; previews: string[] };
  QRDatas?: any; // QR Code data
};

// تایپ تخفیف زمان‌دار (از /longTermDiscountProduct)
type LongTermDiscount = {
  id?: string | number;
  productId: string | number;
  startedAt: string; // ISO
  endsAt: string; // ISO
  description?: string;
};

// کمکی: تبدیل اعداد به فارسی
const toFaDigits = (input: number | string) =>
  input.toString().replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
const padFa = (n: number) => toFaDigits(n.toString().padStart(2, "0"));
const moneyFa = (value: number) => `${value.toLocaleString("fa-IR")} تومان`;
const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));

const CounDown: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [discount, setDiscount] = useState<LongTermDiscount | null>(null);
  const [error, setError] = useState<string | null>(null);

  // شمارش معکوس
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [expired, setExpired] = useState(false);

  // دریافت از API
  useEffect(() => {
    let ignore = false;
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // 1. دریافت لیست تخفیف‌های زمان‌دار
        const discountRes = await fetch("http://localhost:3001/longTermDiscountProduct");
        if (!discountRes.ok) throw new Error("discount fetch error");
        const discountData: LongTermDiscount[] = await discountRes.json();

        // بررسی وجود تخفیف
        if (!Array.isArray(discountData) || discountData.length === 0) {
          if (!ignore) {
            setProduct(null);
            setDiscount(null);
            setLoading(false);
          }
          return;
        }

        // فقط اولین مورد (باید فقط یکی باشد)
        const activeDiscount = discountData[0];

        // 2. دریافت محصول مربوطه
        const productRes = await fetch(
          `http://localhost:3001/products/${activeDiscount.productId}`
        );
        if (!productRes.ok) throw new Error("product fetch error");
        const productData: Product = await productRes.json();

        if (!ignore) {
          setDiscount(activeDiscount);
          setProduct(productData);
          setLoading(false);
        }
      } catch (err: any) {
        if (!ignore) {
          setError(err?.message || "مشکلی رخ داد");
          setLoading(false);
        }
      }
    };

    fetchData();
    
    return () => {
      ignore = true;
    };
  }, []);

  // درصد تخفیف
  const discountPercent = useMemo(() => {
    if (!product?.hasDiscount || product.price <= 0) return 0;
    return Math.max(0, Math.round(100 - (product.discountedPrice / product.price) * 100));
  }, [product]);

  // نوار پیشرفت زمان
  const timeProgress = useMemo(() => {
    if (!discount?.startedAt || !discount.endsAt) return 0;
    const s = new Date(discount.startedAt).getTime();
    const e = new Date(discount.endsAt).getTime();
    if (isNaN(s) || isNaN(e) || e <= s) return 0;
    return clamp(((Date.now() - s) / (e - s)) * 100);
  }, [discount?.startedAt, discount?.endsAt]);

  // محاسبه زمان باقی‌مانده
  const calcTimeLeft = () => {
    if (!discount?.endsAt) return "invalid";
    const end = new Date(discount.endsAt).getTime();
    const diff = end - Date.now();

    if (isNaN(end)) {
      setExpired(true);
      setDays(0);
      setHours(0);
      setMinutes(0);
      setSeconds(0);
      return "invalid";
    }

    if (diff <= 0) {
      setExpired(true);
      setDays(0);
      setHours(0);
      setMinutes(0);
      setSeconds(0);
      return "done";
    }

    setExpired(false);
    setDays(Math.floor(diff / (1000 * 60 * 60 * 24)));
    setHours(Math.floor((diff / (1000 * 60 * 60)) % 24));
    setMinutes(Math.floor((diff / (1000 * 60)) % 60));
    setSeconds(Math.floor((diff / 1000) % 60));
    return "ok";
  };

  // آپدیت هر ثانیه
  useEffect(() => {
    if (!discount?.endsAt) return;
    
    calcTimeLeft();
    const timer = setInterval(() => {
      const status = calcTimeLeft();
      if (status === "done" || status === "invalid") clearInterval(timer);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [discount?.endsAt]);

  // Skeleton لودینگ
  if (loading) {
    return (
      <section className="overflow-hidden py-20" dir="rtl">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="relative rounded-xl bg-blue-light-5 p-6 sm:p-10 shadow-2">
            <div className="grid lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 order-2 lg:order-1">
                <div className="w-full aspect-square bg-gray-2 rounded-xl animate-pulse" />
              </div>
              <div className="lg:col-span-6 order-1 lg:order-2 text-right space-y-4">
                <div className="h-6 w-32 bg-gray-3 rounded animate-pulse" />
                <div className="h-9 w-64 bg-gray-3 rounded animate-pulse" />
                <div className="h-4 w-80 bg-gray-3 rounded animate-pulse" />
                <div className="flex gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-16 h-16 bg-white shadow-2 rounded-lg animate-pulse" />
                  ))}
                </div>
                <div className="h-10 w-48 bg-blue rounded-md animate-pulse opacity-60" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // اگر خطا یا دیتا موجود نیست
  if (error || !product || !discount) return null;

  return (
    <section className="overflow-hidden py-20" dir="rtl">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="relative overflow-hidden z-1 rounded-xl bg-gradient-to-br from-blue-light-5 to-blue-light-4 p-4 sm:p-7.5 lg:p-10 xl:p-15 shadow-3">
          
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            {/* تصویر — سمت چپ */}
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="relative w-full aspect-square bg-white rounded-xl border-2 border-white shadow-2">
                {product.imgs?.previews?.[0] ? (
                  <Image
                    src={product.imgs.previews[0]}
                    alt={product.title}
                    fill
                    className="object-contain p-6"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-5">
                    تصویری موجود نیست
                  </div>
                )}
              </div>
            </div>

            {/* متن — سمت راست */}
            <div className="lg:col-span-6 order-1 lg:order-2 text-right">
              {/* برچسب‌ها */}
              <div className="flex items-center gap-2 mb-3 justify-end flex-wrap">
                <span className="inline-flex items-center justify-center bg-green-light-6 text-green-dark border border-green-light-4 rounded-md px-3 py-1.5 text-xs font-semibold">
                  پیشنهاد ویژه
                </span>
                {product.count <= 5 && (
                  <span className="inline-flex items-center justify-center bg-red-light-6 text-red-dark border border-red-light-4 rounded-md px-3 py-1.5 text-xs font-semibold">
                    موجودی محدود
                  </span>
                )}
              </div>

              {/* عنوان */}
              <h2 className="font-bold text-dark text-xl lg:text-heading-4 xl:text-heading-3 mb-3 leading-tight">
                {product.title}
              </h2>

              {/* توضیح */}
              <p className="text-body leading-relaxed mb-4">
                {discount.description || "این محصول با تخفیف زمان‌دار ارائه شده است. فرصت را از دست ندهید!"}
              </p>

              {/* قیمت */}
              <div className="flex items-center gap-3 mb-4 justify-start flex-wrap">
                {product.hasDiscount && discountPercent > 0 && (
                  <span className="inline-flex items-center justify-center bg-red text-white border-2 border-red-dark rounded-lg px-4 py-2 text-sm font-bold shadow-1">
                    {toFaDigits(discountPercent)}٪ تخفیف
                  </span>
                )}
                <div className="flex items-baseline gap-2">
                  {product.hasDiscount ? (
                    <>
                      <span className="text-dark font-bold text-2xl">
                        {moneyFa(product.discountedPrice)}
                      </span>
                      <span className="line-through text-gray-5 text-lg">
                        {moneyFa(product.price)}
                      </span>
                    </>
                  ) : (
                    <span className="text-dark font-bold text-2xl">{moneyFa(product.price)}</span>
                  )}
                </div>
              </div>

              {/* موجودی */}
              <p className="text-dark-4 text-sm mb-5">
                موجودی: <span className="font-semibold text-dark">{toFaDigits(product.count)}</span> عدد
              </p>

              {/* نوار پیشرفت زمان */}
              {discount.startedAt && (
                <div className="mb-6">
                  <div className="flex items-center justify-between text-xs text-dark-4 mb-2">
                    <span className="font-medium">شروع</span>
                    <span className="font-medium">پایان</span>
                  </div>
                  <div className="w-full h-3 bg-white/60 backdrop-blur-sm rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-gradient-to-l from-red to-green rounded-full transition-all duration-1000"
                      style={{ width: `${timeProgress}%` }}
                    />
                  </div>
                  <div className="text-right text-xs text-dark-4 mt-2 font-medium">
                    گذر زمان: {toFaDigits(Math.round(timeProgress))}٪
                  </div>
                </div>
              )}

              {/* شمارش معکوس */}
              <div className="flex flex-wrap gap-4 mb-6">
                {[
                  { value: days, label: "روز" },
                  { value: hours, label: "ساعت" },
                  { value: minutes, label: "دقیقه" },
                  { value: seconds, label: "ثانیه" },
                ].map((item, i) => (
                  <div key={i} className="flex-1 min-w-[70px]">
                    <div className="bg-white rounded-xl shadow-2 p-4 text-center border-2 border-white">
                      <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-dark mb-1">
                        {padFa(item.value)}
                      </div>
                      <div className="text-xs sm:text-sm text-body font-medium">{item.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* دکمه */}
              <Link
                href={`/shop-details/${product.id}`}
                aria-label="مشاهده محصول"
                className={`inline-flex items-center justify-center font-semibold text-white py-4 px-10 rounded-xl ease-out duration-200 shadow-2 ${
                  expired
                    ? "bg-gray-4 cursor-not-allowed"
                    : "bg-blue hover:bg-blue-dark hover:shadow-3 hover:scale-105"
                }`}
                onClick={(e) => expired && e.preventDefault()}
              >
                {expired ? "این تخفیف به پایان رسیده است" : "مشاهده و خرید محصول"}
              </Link>
            </div>
          </div>

          {/* شیپ‌های دکوری */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-yellow/10 rounded-full blur-3xl -z-1" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue/10 rounded-full blur-3xl -z-1" />
        </div>
      </div>
    </section>
  );
};

export default CounDown;