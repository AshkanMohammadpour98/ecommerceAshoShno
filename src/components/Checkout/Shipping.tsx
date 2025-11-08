// این کامپوننت برای وارد کردن آدرس حمل و نقل متفاوت استفاده می‌شود.
// کاربر می‌تواند اگر می‌خواهد سفارش به آدرس دیگری ارسال شود، جزئیات آدرس جدید را وارد کند.

import React, { useState } from "react";

const Shipping = () => {
  const [dropdown, setDropdown] = useState(false); // مدیریت باز و بسته شدن فرم آدرس جدید

  return (
    <div className="bg-white shadow-1 rounded-[10px] mt-7.5" dir="rtl">
      {/* عنوان و کلید باز کردن فرم */}
      <div
        onClick={() => setDropdown(!dropdown)}
        className="cursor-pointer flex items-center justify-between gap-2.5 font-medium text-lg text-dark py-5 px-5.5"
      >
        ارسال به آدرس دیگر؟
        <svg
          className={`fill-current ease-out duration-200 ${dropdown ? "rotate-180" : ""}`}
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M4.06103 7.80259C4.30813 7.51431 4.74215 7.48092 5.03044 7.72802L10.9997 12.8445L16.9689 7.72802C17.2572 7.48092 17.6912 7.51431 17.9383 7.80259C18.1854 8.09088 18.1521 8.5249 17.8638 8.772L11.4471 14.272C11.1896 14.4927 10.8097 14.4927 10.5523 14.272L4.1356 8.772C3.84731 8.5249 3.81393 8.09088 4.06103 7.80259Z"
            fill=""
          />
        </svg>
      </div>

      {/* فرم آدرس جدید */}
      <div className={`${dropdown ? "block" : "hidden"} p-4 sm:p-8.5`}>
        {/* کشور / منطقه */}
        <div className="mb-5">
          <label htmlFor="countryName" className="block mb-2.5">
            کشور / منطقه
            <span className="text-red">*</span>
          </label>
          <div className="relative">
            <select className="w-full bg-gray-1 rounded-md border border-gray-3 text-dark-4 py-3 pl-5 pr-9 duration-200 appearance-none outline-none focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20">
              <option value="0">استرالیا</option>
              <option value="1">آمریکا</option>
              <option value="2">انگلستان</option>
            </select>
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-4">
              ▼
            </span>
          </div>
        </div>

        {/* آدرس اصلی */}
        <div className="mb-5">
          <label htmlFor="address" className="block mb-2.5">
            آدرس خیابان
            <span className="text-red">*</span>
          </label>
          <input
            type="text"
            name="address"
            placeholder="شماره خانه و نام خیابان"
            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
          />
          <div className="mt-5">
            <input
              type="text"
              name="address2"
              placeholder="آپارتمان، واحد و غیره (اختیاری)"
              className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
            />
          </div>
        </div>

        {/* شهر */}
        <div className="mb-5">
          <label htmlFor="town" className="block mb-2.5">
            شهر / شهرستان <span className="text-red">*</span>
          </label>
          <input
            type="text"
            name="town"
            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
          />
        </div>

        {/* استان / کشور */}
        <div className="mb-5">
          <label htmlFor="country" className="block mb-2.5">
            استان / کشور
          </label>
          <input
            type="text"
            name="country"
            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
          />
        </div>

        {/* شماره تلفن */}
        <div className="mb-5">
          <label htmlFor="phone" className="block mb-2.5">
            شماره تلفن <span className="text-red">*</span>
          </label>
          <input
            type="text"
            name="phone"
            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
          />
        </div>

        {/* ایمیل */}
        <div>
          <label htmlFor="email" className="block mb-2.5">
            ایمیل <span className="text-red">*</span>
          </label>
          <input
            type="email"
            name="email"
            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
          />
        </div>
      </div>
    </div>
  );
};

export default Shipping;
