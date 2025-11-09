"use client";

import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/store"; // اگر ندارید از useDispatch/useSelector استفاده کنید
import {
  applyCoupon,
  removeCoupon,
  selectAppliedCoupon,
  selectDiscount,
} from "@/redux/features/cart-slice";

const Discount = () => {
  const dispatch = useAppDispatch();
  const appliedCoupon = useAppSelector(selectAppliedCoupon);
  const discount = useAppSelector(selectDiscount);

  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error" | ""; text: string }>({
    type: "",
    text: "",
  });

  // ارسال فرم و چک کردن کوپن از API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!couponCode.trim()) {
      setMessage({ type: "error", text: "لطفاً کد تخفیف را وارد کنید" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const code = couponCode.trim().toUpperCase();
      const res = await fetch(`http://localhost:3001/discountCodes?discountCode=${code}`);

      if (!res.ok) throw new Error("خطا در دریافت اطلاعات از سرور");

      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const found = data[0]; // { id, discountCode, money }
        const amount = Number(found.money) || 0;

        // ذخیره کوپن در ریداکس
        dispatch(applyCoupon({ code: found.discountCode, amount }));

        setMessage({
          type: "success",
          text: `کوپن اعمال شد. مبلغ تخفیف: ${amount.toLocaleString("fa-IR")} تومان`,
        });
      } else {
        setMessage({ type: "error", text: "کد تخفیف نامعتبر است" });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: "خطا در اعمال کد تخفیف. لطفاً دوباره تلاش کنید.",
      });
    } finally {
      setLoading(false);
    }
  };

  // حذف کوپن
  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
    setCouponCode("");
    setMessage({ type: "", text: "" });
  };

  return (
    <div className="lg:max-w-[670px] w-full" dir="rtl">
      <form onSubmit={handleSubmit}>
        <div className="bg-white shadow-1 rounded-[10px]">
          {/* هدر */}
          <div className="border-b border-gray-3 py-5 px-4 sm:px-5.5">
            <h3 className="text-right font-medium text-dark">کد تخفیف دارید؟</h3>
          </div>

          {/* بدنه */}
          <div className="py-8 px-4 sm:px-8.5">
            <div className="flex flex-wrap gap-4 xl:gap-5.5">
              {/* فیلد ورودی */}
              <div className="max-w-[426px] w-full">
                <input
                  type="text"
                  id="coupon"
                  name="coupon"
                  placeholder="کد تخفیف خود را وارد کنید"
                  value={appliedCoupon ? appliedCoupon.code : couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 text-right"
                  disabled={loading || Boolean(appliedCoupon)}
                />
              </div>

              {/* دکمه‌ها */}
              {!appliedCoupon ? (
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex font-medium text-white bg-blue py-3 px-8 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      در حال بررسی...
                    </span>
                  ) : (
                    "اعمال کد تخفیف"
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="inline-flex font-medium text-white bg-red py-3 px-8 rounded-md ease-out duration-200 hover:bg-red-dark"
                >
                  حذف کد تخفیف
                </button>
              )}
            </div>

            {/* پیام وضعیت */}
            {message.text && (
              <div
                className={`mt-5 p-4 rounded-md transition-all duration-300 ${
                  message.type === "success"
                    ? "bg-green-light-6 text-green-dark border border-green-light-4"
                    : "bg-red-light-6 text-red-dark border border-red-light-4"
                }`}
              >
                <p className="text-right">{message.text}</p>
              </div>
            )}

            {/* نمایش مقدار تخفیف در صورت اعمال */}
            {appliedCoupon && (
              <div className="mt-4 text-right text-dark">
                <span className="font-medium">تخفیف اعمال‌شده: </span>
                <span>{discount.toLocaleString("fa-IR")} تومان</span>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default Discount;