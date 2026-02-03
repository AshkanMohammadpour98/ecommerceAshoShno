"use client";

import React, { useState } from "react";

// URLS
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const DISCOUNT_CODES_URL = process.env.NEXT_PUBLIC_API_DISCOUNT_CODES_URL;

const Discount = ({ coupon, setCoupon }) => {
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // ارسال فرم و چک کردن کوپن از API
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!couponCode.trim()) {
      setMessage({ type: "error", text: "لطفاً کد تخفیف را وارد کنید" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const code = couponCode.trim().toUpperCase();
      const res = await fetch(
        `${BASE_URL}${DISCOUNT_CODES_URL}?discountCode=${code}`
      );

      if (!res.ok) throw new Error("خطا در دریافت اطلاعات از سرور");

      const data = await res.json();

      if (Array.isArray(data.data) && data.data.length > 0) {
        const found = data.data[0];

        // 📌 ذخیره کوپن در state والد (Cart)
       setCoupon({
  code: found.discountCode,
  amount: Number(found.money) || 0,
});

// 📌 خیلی مهم: مقدار input رو sync می‌کنیم
setCouponCode(found.discountCode);

        setMessage({
          type: "success",
          text: "کد تخفیف با موفقیت اعمال شد",
        });
      } else {
        setMessage({ type: "error", text: "کد تخفیف نامعتبر است" });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: "خطا در اعمال کد تخفیف",
      });
    } finally {
      setLoading(false);
    }
  };

  // حذف کوپن
 const handleRemoveCoupon = () => {
  setCoupon(null);

  // 📌 مهم: input کاملاً پاک شود
  setCouponCode("");

  setMessage({ type: "", text: "" });
};


  return (
    <div className="lg:max-w-[670px] w-full" dir="rtl">
      <form onSubmit={handleSubmit}>
        <div className="bg-white shadow-1 rounded-[10px]">

          {/* هدر */}
          <div className="border-b border-gray-3 py-5 px-4 sm:px-5.5">
            <h3 className="text-right font-medium text-dark">
              کد تخفیف دارید؟
            </h3>
          </div>

          {/* بدنه */}
          <div className="py-8 px-4 sm:px-8.5">
            <div className="flex flex-wrap gap-4 xl:gap-5.5">

              {/* فیلد ورودی */}
              <div className="max-w-[426px] w-full">
                <input
                  type="text"
                  placeholder="کد تخفیف خود را وارد کنید"
                  value={couponCode}

                  onChange={(e) =>
                    setCouponCode(e.target.value.toUpperCase())
                  }
                  disabled={loading || Boolean(coupon)}
                  className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5"
                />
              </div>

              {/* دکمه‌ها */}
              {!coupon ? (
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex font-medium text-white bg-blue py-3 px-8 rounded-md"
                >
                  اعمال کد تخفیف
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="inline-flex font-medium text-white bg-red py-3 px-8 rounded-md"
                >
                  حذف کد تخفیف
                </button>
              )}
            </div>

            {/* پیام وضعیت */}
            {message.text && (
              <div className="mt-5">
                <p className="text-right">{message.text}</p>
              </div>
            )}

            {/* نمایش مقدار تخفیف */}
            {coupon && (
              <div className="mt-4 text-right text-dark">
                <span className="font-medium">تخفیف اعمال‌شده: </span>
                <span>
                  {coupon.amount.toLocaleString("fa-IR")} تومان
                </span>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default Discount;
