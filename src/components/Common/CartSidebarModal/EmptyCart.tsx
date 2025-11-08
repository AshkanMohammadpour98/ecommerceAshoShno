import React from "react";
import Link from "next/link";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import { ShoppingCartIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { SparklesIcon } from "@heroicons/react/24/solid";

/**
 * کامپوننت EmptyCart
 * نمایش وضعیت خالی بودن سبد خرید با طراحی مدرن و ریسپانسیو
 * 
 * ویژگی‌ها:
 * - طراحی ریسپانسیو برای موبایل، تبلت و دسکتاپ
 * - انیمیشن‌های smooth
 * - استفاده از آیکون‌های Heroicons
 * - دکمه CTA (Call To Action) جذاب
 */
const EmptyCart: React.FC = () => {
  const { closeCartModal } = useCartModalContext();

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] px-4 py-8 text-center">
      
      {/* 
       * بخش آیکون اصلی
       * - آیکون سبد خرید با پس‌زمینه دایره‌ای
       * - انیمیشن pulse برای جلب توجه
       * - سایز ریسپانسیو
       */}
      <div className="relative mb-8">
        {/* دایره پس‌زمینه با انیمیشن */}
        <div className="absolute inset-0 bg-blue-light-5 rounded-full animate-pulse" />
        
        {/* کانتینر آیکون اصلی */}
        <div className="relative bg-gradient-to-br from-gray-2 to-gray-3 rounded-full p-6 sm:p-8 shadow-3">
          <ShoppingCartIcon className="w-12 h-12 sm:w-16 sm:h-16 text-meta-4 stroke-[1.5]" />
          
          {/* آیکون تزیینی */}
          <SparklesIcon className="absolute -top-2 -right-2 w-6 h-6 text-yellow animate-bounce" />
        </div>
      </div>

      {/* 
       * بخش متن‌ها
       * - عنوان اصلی با فونت بزرگ‌تر
       * - توضیحات فرعی
       * - سایز متن ریسپانسیو
       */}
      <div className="mb-8 space-y-3 max-w-[280px] sm:max-w-[320px]">
        {/* عنوان اصلی */}
        <h3 className="text-custom-1 sm:text-heading-6 font-semibold text-dark">
          سبد خرید شما خالی است!
        </h3>
        
        {/* توضیحات فرعی */}
        <p className="text-custom-sm sm:text-base text-meta-4 leading-relaxed">
          محصولات مورد علاقه خود را به سبد اضافه کنید و خرید آسان را تجربه کنید
        </p>
      </div>

      {/* 
       * بخش دکمه‌ها
       * - دکمه اصلی برای رفتن به فروشگاه
       * - دکمه ثانویه (اختیاری) برای مشاهده محصولات پرفروش
       * - طراحی ریسپانسیو با عرض مناسب
       */}
      <div className="w-full space-y-3 max-w-[280px] sm:max-w-[320px]">
        {/* دکمه اصلی - رفتن به فروشگاه */}
        <Link
          href="/shop-with-sidebar"
          onClick={closeCartModal}
          className="group relative w-full flex items-center justify-center gap-2.5 
                     bg-gradient-to-r from-blue to-blue-light text-white 
                     py-3.5 sm:py-4 px-6 rounded-xl
                     font-medium text-custom-sm sm:text-base
                     shadow-2 overflow-hidden
                     transition-all duration-300 
                     hover:shadow-3 hover:scale-[1.02] 
                     active:scale-[0.98]"
        >
          {/* افکت hover - overlay */}
          <span className="absolute inset-0 bg-white/10 translate-y-full 
                          transition-transform duration-300 
                          group-hover:translate-y-0" />
          
          {/* محتوای دکمه */}
          <span className="relative">شروع خرید</span>
          <ArrowLeftIcon className="relative w-5 h-5 transition-transform duration-300 
                                   group-hover:-translate-x-1" />
        </Link>

        {/* دکمه ثانویه - مشاهده پرفروش‌ها (اختیاری) */}
        <button
          onClick={closeCartModal}
          className="w-full text-blue hover:text-blue-dark
                     py-2 text-custom-sm sm:text-base
                     font-medium transition-colors duration-200
                     hover:underline underline-offset-4"
        >
          مشاهده محصولات پرفروش
        </button>
      </div>

      {/* 
       * بخش پیشنهادات (اختیاری)
       * نمایش تعداد محصولات یا پیشنهادات ویژه
       * فقط در صفحات بزرگ‌تر نمایش داده می‌شود
       */}
      <div className="hidden sm:flex items-center gap-2 mt-8 text-custom-xs text-meta-5">
        <div className="flex -space-x-2">
          {/* نمایش آواتار محصولات نمونه */}
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-3 to-gray-4 
                        border-2 border-white"
            />
          ))}
        </div>
        <span>بیش از ۱۰۰ محصول در انتظار شما</span>
      </div>
    </div>
  );
};

export default EmptyCart;