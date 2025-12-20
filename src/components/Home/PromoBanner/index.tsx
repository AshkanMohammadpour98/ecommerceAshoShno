"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

// تایپ برای داده‌های بنر تبلیغاتی
type PromoBannerData = {
  id?: string | number;
  title: string;          // عنوان محصول
  subtitle: string;       // عنوان فرعی یا تخفیف
  description: string;    // توضیحات
  buttonText: string;     // متن دکمه
  buttonLink: string;     // لینک دکمه
  image: string;          // آدرس تصویر
  bgColor?: string;       // رنگ پس‌زمینه (اختیاری)
  buttonColor?: string;   // رنگ دکمه (اختیاری)
  discount?: string;      // درصد تخفیف (اختیاری)
};

// داده‌های پیش‌فرض برای زمانی که API خالی است
const defaultBanners: PromoBannerData[] = [
];

const PromoBanner = () => {
  // state برای نگهداری داده‌های بنرها
  const [banners, setBanners] = useState<PromoBannerData[]>(defaultBanners);
  const [loading, setLoading] = useState(true);

  // دریافت داده‌ها از API هنگام mount شدن کامپوننت
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        
        // درخواست به API
        const response = await fetch('http://localhost:3000/api/customPromoBenner');
        
        // بررسی موفقیت‌آمیز بودن درخواست
        if (!response.ok) {
          throw new Error('Failed to fetch banners');
        }
        
        const data = await response.json();
        
        // بررسی اینکه آیا داده‌ای دریافت شده و آرایه است
        if (Array.isArray(data.data) && data.data.length > 0) {
          // اگر داده‌ها کمتر از 3 تا بود، از داده‌های پیش‌فرض برای تکمیل استفاده می‌کنیم
          const finalBanners = [...data.data];
          while (finalBanners.length < 3) {
            finalBanners.push(defaultBanners[finalBanners.length]);
          }
          setBanners(finalBanners.slice(0, 3)); // فقط 3 بنر اول را نگه می‌داریم
        } else {
          // اگر API خالی بود، از داده‌های پیش‌فرض استفاده می‌کنیم
          setBanners(defaultBanners);
        }
      } catch (error) {
        // در صورت خطا، از داده‌های پیش‌فرض استفاده می‌کنیم
        console.error('Error fetching banners:', error);
        setBanners(defaultBanners);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []); // فقط یکبار هنگام mount اجرا می‌شود

  // نمایش لودینگ (اختیاری - می‌توانید این قسمت را حذف کنید)
  if (loading) {
    return (
      <section className="overflow-hidden py-20">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-96 mb-7.5"></div>
            <div className="grid gap-7.5 grid-cols-1 lg:grid-cols-2">
              <div className="bg-gray-200 rounded-lg h-64"></div>
              <div className="bg-gray-200 rounded-lg h-64"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // اگر هیچ بنری وجود نداشت
  if (!banners || banners.length === 0) {
    return null;
  }

  // جدا کردن بنر بزرگ (اولین بنر) از بنرهای کوچک
  const [mainBanner, ...smallBanners] = banners;

  return (
    <section className="overflow-hidden py-20">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">

        {/* =============================
            بنر بزرگ تبلیغاتی
        ============================== */}
        {mainBanner && (
          <div 
            className="relative z-1 overflow-hidden rounded-lg py-12.5 lg:py-17.5 xl:py-22.5 px-4 sm:px-7.5 lg:px-14 xl:px-19 mb-7.5"
            style={{ backgroundColor: mainBanner.bgColor || '#F5F5F7' }}
          >
            <div className="max-w-[550px] w-full">
              <span className="block font-medium text-xl text-dark mb-3">
                {mainBanner.title}
              </span>

              <h2 className="font-bold text-xl lg:text-heading-4 xl:text-heading-3 text-dark mb-5">
                {mainBanner.subtitle}
              </h2>

              <p>
                {mainBanner.description}
              </p>

              <a
                href={mainBanner.buttonLink}
                className={`inline-flex font-medium text-custom-sm text-white bg-${mainBanner.buttonColor || 'blue'} py-[11px] px-9.5 rounded-md ease-out duration-200 hover:bg-${mainBanner.buttonColor || 'blue'}-dark mt-7.5`}
              >
                {mainBanner.buttonText}
              </a>
            </div>

            <Image
              src={mainBanner.image}
              alt={mainBanner.title}
              className="absolute bottom-0 left-4 lg:left-26 -z-1"
              width={274}
              height={350}
            />
          </div>
        )}

        {/* =============================
            بنرهای کوچک تبلیغاتی
        ============================== */}
        <div className="grid gap-7.5 grid-cols-1 lg:grid-cols-2">

          {/* بنر کوچک اول */}
          {smallBanners[0] && (
            <div 
              className="relative z-1 overflow-hidden rounded-lg py-10 xl:py-16 px-4 sm:px-7.5 xl:px-10"
              style={{ backgroundColor: smallBanners[0].bgColor || '#DBF4F3' }}
            >
              <Image
                src={smallBanners[0].image}
                alt={smallBanners[0].title}
                className="absolute top-1/2 -translate-y-1/2 left-3 sm:left-10 -z-1"
                width={241}
                height={241}
              />

              <div className="text-right">
                <span className="block text-lg text-dark mb-1.5">
                  {smallBanners[0].title}
                </span>

                <h2 className="font-bold text-xl lg:text-heading-4 text-dark mb-2.5">
                  {smallBanners[0].subtitle}
                </h2>

                {smallBanners[0].discount && (
                  <p className="font-semibold text-custom-1 text-teal">
                    {smallBanners[0].discount}
                  </p>
                )}

                <a
                  href={smallBanners[0].buttonLink}
                  className={`inline-flex font-medium text-custom-sm text-white bg-${smallBanners[0].buttonColor || 'teal'} py-2.5 px-8.5 rounded-md ease-out duration-200 hover:bg-${smallBanners[0].buttonColor || 'teal'}-dark mt-9`}
                >
                  {smallBanners[0].buttonText}
                </a>
              </div>
            </div>
          )}

          {/* بنر کوچک دوم */}
          {smallBanners[1] && (
            <div 
              className="relative z-1 overflow-hidden rounded-lg py-10 xl:py-16 px-4 sm:px-7.5 xl:px-10"
              style={{ backgroundColor: smallBanners[1].bgColor || '#FFECE1' }}
            >
              <Image
                src={smallBanners[1].image}
                alt={smallBanners[1].title}
                className="absolute top-1/2 -translate-y-1/2 left-3 sm:left-8.5 -z-1"
                width={200}
                height={200}
              />

              <div>
                <span className="block text-lg text-dark mb-1.5">
                  {smallBanners[1].title}
                </span>

                <h2 className="font-bold text-xl lg:text-heading-4 text-dark mb-2.5">
                  {/* اگر در subtitle کلمه تخفیف وجود داشت، عدد را نارنجی نمایش می‌دهیم */}
                  {smallBanners[1].subtitle.includes('٪') ? (
                    <>
                      {smallBanners[1].subtitle.split('٪')[0]}
                      <span className="text-orange">٪</span>
                      {smallBanners[1].subtitle.split('٪')[1]}
                    </>
                  ) : (
                    smallBanners[1].subtitle
                  )}
                </h2>

                <p className="max-w-[285px] text-custom-sm">
                  {smallBanners[1].description}
                </p>

                <a
                  href={smallBanners[1].buttonLink}
                  className={`inline-flex font-medium text-custom-sm text-white bg-${smallBanners[1].buttonColor || 'orange'} py-2.5 px-8.5 rounded-md ease-out duration-200 hover:bg-${smallBanners[1].buttonColor || 'orange'}-dark mt-7.5`}
                >
                  {smallBanners[1].buttonText}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;