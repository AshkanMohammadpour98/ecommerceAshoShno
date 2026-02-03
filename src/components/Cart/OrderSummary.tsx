"use client";

import React from "react";
import { useAppSelector } from "@/redux/store";
import { selectTotalPrice } from "@/redux/features/cart-slice";

const OrderSummary = ({ coupon }) => {
  // آیتم‌های سبد خرید
  const cartItems = useAppSelector((state) => state.cartReducer.items);

  // جمع کل قبل از تخفیف (از ریداکس)
  const totalPrice = useAppSelector(selectTotalPrice);

  // مبلغ تخفیف کوپن
  const discount = coupon ? coupon.amount : 0;

  // مبلغ قابل پرداخت
  const payable = Math.max(totalPrice - discount, 0);

  return (
    <div className="lg:max-w-[455px] w-full" dir="rtl">
      {/* باکس جمع سفارش‌ها */}
      <div className="bg-white shadow-1 rounded-[10px]">

        {/* هدر */}
        <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
          <h3 className="font-medium text-xl text-dark">
            جمع سفارش‌ها
          </h3>
        </div>

        {/* بدنه */}
        <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">

          {/* عنوان ستون‌ها */}
          <div className="flex items-center justify-between py-5 border-b border-gray-3">
            <h4 className="font-medium text-dark">محصول</h4>
            <h4 className="font-medium text-dark text-right">جمع جزء</h4>
          </div>

          {/* لیست محصولات */}
          {cartItems.map((item) => {
            // ===================================================
            // 📌 اگر discountedPrice وجود داشته باشد از آن استفاده می‌کنیم
            // در غیر این صورت price ملاک محاسبه است
            // ===================================================
const unitPrice =
  typeof item.discountedPrice === "number" && item.discountedPrice > 0
    ? item.discountedPrice
    : item.price;

            return (
              <div
                key={item.id}
                className="flex items-center justify-between py-5 border-b border-gray-3"
              >
                <p className="text-dark">
                  {item.title}
                  <span className="text-gray-6 text-sm mr-2">
                    × {item.quantity}
                  </span>
                </p>
                <p className="text-dark text-right">
                  {(unitPrice * item.quantity).toLocaleString("fa-IR")} تومان
                </p>
              </div>
            );
          })}

          {/* جمع کل */}
          <div className="flex items-center justify-between pt-5">
            <p className="font-medium text-lg text-dark">جمع کل</p>
            <p className="font-medium text-lg text-dark text-right">
              {totalPrice.toLocaleString("fa-IR")} تومان
            </p>
          </div>

          {/* تخفیف کوپن */}
          {coupon && (
            <div className="flex items-center justify-between mt-2 text-green-dark">
              <p className="font-medium">
                تخفیف کوپن
                <span className="text-gray-6 text-sm mr-1">
                  ({coupon.code})
                </span>
              </p>
              <p className="font-medium">
                - {coupon.amount.toLocaleString("fa-IR")} تومان
              </p>
            </div>
          )}

          {/* خط جداکننده */}
          <div className="border-t border-gray-3 my-4"></div>

          {/* مبلغ قابل پرداخت */}
          <div className="flex items-center justify-between">
            <p className="font-bold text-dark">مبلغ قابل پرداخت</p>
            <p className="font-bold text-dark text-right">
              {payable.toLocaleString("fa-IR")} تومان
            </p>
          </div>

          {/* دکمه ادامه پرداخت */}
          <button
            type="button"
            className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5"
          >
            ادامه به پرداخت
          </button>

        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
