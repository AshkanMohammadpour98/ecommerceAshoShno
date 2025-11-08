import React from "react";

// ✅ این کامپوننت فرم وارد کردن کد تخفیف را نمایش می‌دهد
// کاربر می‌تواند کد تخفیف خود را وارد کرده و آن را روی خرید اعمال کند
const Coupon = () => {
  return (
    <div className="bg-white shadow-1 rounded-[10px] mt-7.5" dir="rtl">
      {/* 📌 عنوان فرم */}
      <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
        <h3 className="font-medium text-xl text-dark">کد تخفیف دارید؟</h3>
      </div>

      {/* 📌 ورودی و دکمه اعمال کوپن */}
      <div className="py-8 px-4 sm:px-8.5">
        {/* 📌 روی دسکتاپ کنار هم، روی موبایل زیر هم */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 📌 فیلد ورودی کد تخفیف */}
          <input
            type="text"
            name="coupon"
            id="coupon"
            placeholder="کد تخفیف خود را وارد کنید"
            className="flex-grow rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 text-right"
          />

          {/* 📌 دکمه اعمال کوپن */}
          <button
            type="submit"
            className="flex-shrink-0 w-full sm:w-auto inline-flex font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark justify-center"
          >
            اعمال
          </button>
        </div>
      </div>
    </div>
  );
};

export default Coupon;
