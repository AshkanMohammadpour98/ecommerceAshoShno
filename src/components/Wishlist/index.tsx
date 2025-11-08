// این صفحه لیست علاقه‌مندی‌های کاربر را نمایش می‌دهد
// شامل عنوان، دکمه پاک کردن لیست و جدول آیتم‌ها است.

"use client";
import React from "react";
import Breadcrumb from "../Common/Breadcrumb";
import SingleItem from "./SingleItem";
import { useDispatch } from "react-redux";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { removeAllItemsFromWishlist } from "@/redux/features/wishlist-slice";



export const Wishlist = () => {
  // گرفتن آیتم‌های لیست علاقه‌مندی از ریداکس
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);
  const dispatch = useDispatch<AppDispatch>();



  return (
    <>
      {/* مسیر ناوبری */}
      <Breadcrumb title={"لیست علاقه‌مندی‌ها"} pages={["لیست علاقه‌مندی‌ها"]} />

      {/* بخش اصلی صفحه */}
      <section className="overflow-hidden py-20 bg-gray-2" dir="rtl">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          {/* عنوان و دکمه پاک کردن */}
          <div className="flex flex-wrap items-center justify-between gap-5 mb-7.5">
            <h2 className="font-medium text-dark text-2xl">لیست علاقه‌مندی‌های شما</h2>
            <button className="text-blue"
            onClick={() => dispatch(removeAllItemsFromWishlist())}
            >پاک کردن همه آیتم‌ها</button>
          </div>

          {/* جدول آیتم‌ها */}
          <div className="bg-white rounded-[10px] shadow-1">
            <div className="w-full overflow-x-auto">
              <div className="min-w-[1170px]">
                {/* هدر جدول */}
                <div className="flex items-center py-5.5 px-10">
                  <div className="min-w-[83px]"></div>
                  <div className="min-w-[387px]">
                    <p className="text-dark">محصول</p>
                  </div>

                  <div className="min-w-[205px]">
                    <p className="text-dark">قیمت واحد</p>
                  </div>

                  <div className="min-w-[265px]">
                    <p className="text-dark">وضعیت موجودی</p>
                  </div>

                  <div className="min-w-[150px]">
                    <p className="text-dark text-right">عملیات</p>
                  </div>
                </div>

                {/* آیتم‌های لیست علاقه‌مندی */}
                {wishlistItems.length > 0 ? (
  wishlistItems.map((item) => <SingleItem item={item} key={String(item.id)} />)
) : (
  <p className="text-center py-10">هیچ آیتمی در لیست علاقه‌مندی وجود ندارد</p>
)}

              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
