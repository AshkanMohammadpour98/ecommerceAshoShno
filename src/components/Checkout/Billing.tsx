import React from "react";

// ✅ این کامپوننت فرم جزئیات صورتحساب را نمایش می‌دهد.
// کاربرد: کاربر اطلاعات شخصی و آدرس خود را وارد می‌کند تا سفارش تکمیل شود.
const Billing = () => {
  return (
    <div className="mt-9" dir="rtl">
      {/* 📌 عنوان فرم */}
      <h2 className="font-medium text-dark text-xl sm:text-2xl mb-5.5">
        جزئیات صورتحساب
      </h2>

      <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5">
        {/* 📌 نام و نام خانوادگی */}
        <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
          <div className="w-full">
            <label htmlFor="firstName" className="block mb-2.5">
              نام <span className="text-red">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              id="firstName"
              placeholder="علی"
              className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 text-right"
            />
          </div>

          <div className="w-full">
            <label htmlFor="lastName" className="block mb-2.5">
              نام خانوادگی <span className="text-red">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              id="lastName"
              placeholder="محمدی"
              className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 text-right"
            />
          </div>
        </div>

        {/* 📌 نام شرکت */}
        <div className="mb-5">
          <label htmlFor="companyName" className="block mb-2.5">
            نام شرکت
          </label>
          <input
            type="text"
            name="companyName"
            id="companyName"
            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 text-right"
          />
        </div>

        {/* 📌 کشور / منطقه */}
        <div className="mb-5">
          <label htmlFor="countryName" className="block mb-2.5">
            کشور / منطقه <span className="text-red">*</span>
          </label>
          <div className="relative">
            <select className="w-full bg-gray-1 rounded-md border border-gray-3 text-dark-4 py-3 pr-5 pl-9 duration-200 appearance-none outline-none focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 text-right">
              <option value="0">استرالیا</option>
              <option value="1">آمریکا</option>
              <option value="2">انگلستان</option>
            </select>
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-4">
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path d="M2.41469 5.03569L8 10.9622L13.5853 5.03569" stroke="" strokeWidth="0.666667"/>
              </svg>
            </span>
          </div>
        </div>

        {/* 📌 آدرس */}
        <div className="mb-5">
          <label htmlFor="address" className="block mb-2.5">
            آدرس خیابان <span className="text-red">*</span>
          </label>
          <input
            type="text"
            name="address"
            id="address"
            placeholder="شماره خانه و نام خیابان"
            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 text-right"
          />
          <div className="mt-5">
            <input
              type="text"
              name="address"
              id="addressTwo"
              placeholder="واحد، آپارتمان و ... (اختیاری)"
              className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 text-right"
            />
          </div>
        </div>

        {/* 📌 شهر */}
        <div className="mb-5">
          <label htmlFor="town" className="block mb-2.5">
            شهر <span className="text-red">*</span>
          </label>
          <input
            type="text"
            name="town"
            id="town"
            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 text-right"
          />
        </div>

        {/* 📌 تلفن */}
        <div className="mb-5">
          <label htmlFor="phone" className="block mb-2.5">
            شماره تلفن <span className="text-red">*</span>
          </label>
          <input
            type="text"
            name="phone"
            id="phone"
            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 text-right"
          />
        </div>

        {/* 📌 ایمیل */}
        <div className="mb-5.5">
          <label htmlFor="email" className="block mb-2.5">
            ایمیل <span className="text-red">*</span>
          </label>
          <input
            type="email"
            name="email"
            id="email"
            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 text-right"
          />
        </div>

        {/* 📌 گزینه ایجاد حساب */}
        <div>
          <label htmlFor="checkboxLabelTwo" className="text-dark flex cursor-pointer select-none items-center">
            <div className="relative">
              <input type="checkbox" id="checkboxLabelTwo" className="sr-only" />
              <div className="ml-2 flex h-4 w-4 items-center justify-center rounded border border-gray-4">
                <span className="opacity-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="4" y="4" width="16" height="16" rx="4" fill="#3C50E0" />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M16.31 9.25C16.47 9.41 16.56 9.63 16.56 9.85C16.56 10.08 16.47 10.3 16.31 10.46L12.02 14.75C11.86 14.91 11.65 15 11.42 15C11.19 15 10.97 14.91 10.81 14.75L8.24 12.18C8.08 12.02 7.99 11.8 8 11.57C8 11.35 8.09 11.13 8.25 10.97C8.41 10.82 8.62 10.73 8.85 10.72C9.07 10.72 9.29 10.81 9.45 10.97L11.42 12.93L15.1 9.25C15.26 9.09 15.47 9 15.7 9C15.93 9 16.15 9.09 16.31 9.25Z"
                      fill="white"
                    />
                  </svg>
                </span>
              </div>
            </div>
            ایجاد حساب کاربری
          </label>
        </div>
      </div>
    </div>
  );
};

export default Billing;
