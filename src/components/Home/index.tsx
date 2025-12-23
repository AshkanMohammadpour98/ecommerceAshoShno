import React from "react";
// کامپوننت‌های صفحه اصلی را ایمپورت می‌کنیم
import Hero from "./Hero"; // بخش هدر بزرگ با تصویر و شعار
import Categories from "./Categories"; // دسته‌بندی محصولات
import NewArrival from "./NewArrivals"; // محصولات جدید
import PromoBanner from "./PromoBanner"; // بنرهای تبلیغاتی
import BestSeller from "./BestSeller"; // محصولات پرفروش
import LimitedDiscountCountdown from "./LimitedDiscountCountdown"; // شمارش معکوس برای تخفیف‌ها
import Testimonials from "./Testimonials"; // نظرات کاربران
// import Newsletter from "../Common/Newsletter"; // عضویت در خبرنامه

const Home = () => {
  return (
    <main dir="rtl"> {/* تمام محتوای داخلی این صفحه راست‌چین می‌شود */}
      <Hero />
      <Categories />
      <NewArrival />
      <LimitedDiscountCountdown />
      <PromoBanner />
      <BestSeller />
      <Testimonials />
      {/* <Newsletter /> */}
    </main>
  );
};

export default Home;
