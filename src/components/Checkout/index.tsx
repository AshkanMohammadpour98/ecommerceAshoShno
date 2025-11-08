// این صفحه Checkout است و کاربردش نمایش فرم سفارش، جزئیات صورتحساب، تخفیف، روش ارسال و پرداخت است.
// کاربر می‌تواند محصولات را بررسی کند، کد تخفیف اعمال کند، آدرس و صورتحساب خود را وارد کند و سپس سفارش را ثبت کند.

"use client";
import React from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Login from "./Login";
import Shipping from "./Shipping";
import ShippingMethod from "./ShippingMethod";
import PaymentMethod from "./PaymentMethod";
import Coupon from "./Coupon";
import Billing from "./Billing";

const Checkout = () => {
  return (
    <>
      {/* بخش ناوبری بالای صفحه */}
      <Breadcrumb title={"تسویه حساب"} pages={["تسویه حساب"]} />

      <section className="overflow-hidden py-20 bg-gray-2" dir="rtl">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <form>
            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11">
              {/* ستون سمت چپ صفحه: ورود، صورتحساب و آدرس */}
              <div className="lg:max-w-[670px] w-full flex flex-col gap-7.5">
                {/* فرم ورود یا ثبت نام */}
                <Login />

                {/* فرم جزئیات صورتحساب */}
                <Billing />

                {/* فرم آدرس ارسال */}
                <Shipping />

                {/* بخش یادداشت‌های سفارش (اختیاری) */}
                <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5">
                  <label htmlFor="notes" className="block mb-2.5">
                    یادداشت‌های دیگر (اختیاری)
                  </label>
                  <textarea
                    name="notes"
                    id="notes"
                    rows={5}
                    placeholder="مثال: یادداشت خاص برای تحویل سفارش"
                    className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full p-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  />
                </div>
              </div>

              {/* ستون سمت راست صفحه: سفارش، کوپن، روش ارسال و پرداخت */}
              <div className="lg:max-w-[455px] w-full flex flex-col gap-7.5">
                {/* باکس لیست سفارش */}
                <div className="bg-white shadow-1 rounded-[10px]">
                  <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
                    <h3 className="font-medium text-xl text-dark">سفارش شما</h3>
                  </div>

                  <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
                    {/* عنوان ستون‌ها */}
                    <div className="flex items-center justify-between py-5 border-b border-gray-3">
                      <h4 className="font-medium text-dark">محصول</h4>
                      <h4 className="font-medium text-dark text-right">قیمت</h4>
                    </div>

                    {/* آیتم‌های سفارش */}
                    {[
                      { name: "گوشی آیفون 14 پلاس، 6/128GB", price: 899 },
                      { name: "مودم Asus RT Dual Band", price: 129 },
                      { name: "دسته بازی Havit HV-G69 USB", price: 29 },
                      { name: "هزینه ارسال", price: 15 },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-5 border-b border-gray-3"
                      >
                        <p className="text-dark">{item.name}</p>
                        <p className="text-dark text-right">{item.price}.00$</p>
                      </div>
                    ))}

                    {/* جمع کل */}
                    <div className="flex items-center justify-between pt-5">
                      <p className="font-medium text-lg text-dark">جمع کل</p>
                      <p className="font-medium text-lg text-dark text-right">1072.00$</p>
                    </div>
                  </div>
                </div>

                {/* بخش کوپن تخفیف */}
                <Coupon />

                {/* روش ارسال */}
                <ShippingMethod />

                {/* روش پرداخت */}
                <PaymentMethod />

                {/* دکمه ثبت نهایی سفارش */}
                <button
                  type="submit"
                  className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark"
                >
                  ثبت سفارش و پرداخت
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default Checkout;
