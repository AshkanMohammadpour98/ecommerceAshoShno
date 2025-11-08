// 📌 این صفحه "سبد خرید" را نمایش می‌دهد.
// کاربر می‌تواند محصولات انتخاب شده را ببیند، تعداد را تغییر دهد، کد تخفیف اعمال کند و به صفحه پرداخت برود.

"use client";
import React from "react";
import Discount from "./Discount";
import OrderSummary from "./OrderSummary";
import { useAppSelector } from "@/redux/store";
import SingleItem from "./SingleItem";
import Breadcrumb from "../Common/Breadcrumb";
import Link from "next/link";

const Cart = () => {
  // 📌 گرفتن آیتم‌های سبد خرید از استیت ریداکس
  const cartItems = useAppSelector((state) => state.cartReducer.items);

  return (
    <>
      {/* 📌 بخش Breadcrumb */}
      <section>
        <Breadcrumb title={"سبد خرید"} pages={["سبد خرید"]} />
      </section>

      {cartItems.length > 0 ? (
        <section className="overflow-hidden py-20 bg-gray-2" dir="rtl">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">

            {/* 📌 عنوان سبد خرید و دکمه پاک کردن */}
            <div className="flex flex-wrap items-center justify-between gap-5 mb-7.5">
              <h2 className="font-medium text-dark text-2xl">سبد خرید شما</h2>
              <button className="text-blue">پاک کردن سبد خرید</button>
            </div>

            {/* 📌 جدول محصولات */}
            <div className="bg-white rounded-[10px] shadow-1">
              <div className="w-full overflow-x-auto">
                <div className="min-w-[1170px]">

                  {/* 📌 هدر جدول */}
                  <div className="flex items-center py-5.5 px-7.5 text-right">
                    <div className="min-w-[400px]"><p className="text-dark">محصول</p></div>
                    <div className="min-w-[180px]"><p className="text-dark">قیمت</p></div>
                    <div className="min-w-[275px]"><p className="text-dark">تعداد</p></div>
                    <div className="min-w-[200px]"><p className="text-dark">جمع جزء</p></div>
                    <div className="min-w-[50px]"><p className="text-dark text-right">عملیات</p></div>
                  </div>

                  {/* 📌 رندر کردن هر آیتم سبد خرید */}
                  {cartItems.map((item, key) => (
                    <SingleItem item={item} key={key} />
                  ))}

                </div>
              </div>
            </div>

            {/* 📌 بخش تخفیف و جمع کل سفارش */}
            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11 mt-9">
              <Discount />       {/* فرم کد تخفیف */}
              <OrderSummary />   {/* جمع کل و ادامه خرید */}
            </div>

          </div>
        </section>
      ) : (
        // 📌 وقتی سبد خرید خالی باشد
        <div className="text-center mt-8" dir="rtl">
          <div className="mx-auto pb-7.5">
            {/* 📌 آیکون سبد خرید خالی */}
            <svg
              className="mx-auto"
              width="100"
              height="100"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="50" cy="50" r="50" fill="#F3F4F6" />
              {/* ... ادامه مسیر SVG */}
            </svg>
          </div>

          {/* 📌 متن اطلاع رسانی */}
          <p className="pb-6">سبد خرید شما خالی است!</p>

          {/* 📌 لینک ادامه خرید */}
          <Link
            href="/shop-with-sidebar"
            className="w-96 mx-auto flex justify-center font-medium text-white bg-dark py-[13px] px-6 rounded-md ease-out duration-200 hover:bg-opacity-95"
          >
            ادامه خرید
          </Link>
        </div>
      )}
    </>
  );
};

export default Cart;
