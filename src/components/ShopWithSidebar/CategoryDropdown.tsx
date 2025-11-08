// 📌 این کامپوننت یک منوی کشویی (Dropdown) دسته‌بندی‌ها را نمایش می‌دهد که هر دسته قابلیت انتخاب (چک‌باکس‌مانند) دارد.

"use client";

import { useState } from "react";

// 🔹 این کامپوننت یک آیتم دسته‌بندی تکی را نمایش می‌دهد
// شامل نام دسته، تعداد محصولات و یک حالت انتخاب (selected) است
const CategoryItem = ({ category }) => {
  // state برای کنترل انتخاب شدن آیتم
  const [selected, setSelected] = useState(false);

  return (
    <button
      // کلاس‌های داینامیک: اگر انتخاب شده باشد، متن آبی می‌شود
      className={`${
        selected && "text-blue"
      } group flex items-center justify-between ease-out duration-200 hover:text-blue `}
      // تغییر وضعیت انتخاب با هر کلیک
      onClick={() => setSelected(!selected)}
    >
      <div className="flex items-center gap-2">
        {/* مربع چک‌باکس */}
        <div
          className={`cursor-pointer flex items-center justify-center rounded w-4 h-4 border ${
            selected ? "border-blue bg-blue" : "bg-white border-gray-3"
          }`}
        >
          {/* نمایش تیک فقط وقتی که انتخاب شده باشد */}
          <svg
            className={selected ? "block" : "hidden"}
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.33317 2.5L3.74984 7.08333L1.6665 5"
              stroke="white"
              strokeWidth="1.94437"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* نام دسته */}
        <span>{category.name}</span>
      </div>

      {/* تعداد محصولات دسته */}
      <span
        className={`${
          selected ? "text-white bg-blue" : "bg-gray-2"
        } inline-flex rounded-[30px] text-custom-xs px-2 ease-out duration-200 group-hover:text-white group-hover:bg-blue`}
      >
        {category.products}
      </span>
    </button>
  );
};

// 🔹 این کامپوننت منوی کشویی دسته‌بندی‌ها را مدیریت و نمایش می‌دهد
const CategoryDropdown = ({ categories }) => {
  // state برای باز/بسته بودن منوی کشویی
  const [toggleDropdown, setToggleDropdown] = useState(true);

  return (
    <div className="bg-white shadow-1 rounded-lg">
      {/* هدر منو - کلیک برای باز/بسته کردن */}
      <div
        onClick={(e) => {
          e.preventDefault();
          setToggleDropdown(!toggleDropdown);
        }}
        className={`cursor-pointer flex items-center justify-between py-3 pl-6 pr-5.5 ${
          toggleDropdown && "shadow-filter"
        }`}
      >
        <p className="text-dark">Category</p>

        {/* آیکن فلش که هنگام باز بودن می‌چرخد */}
        <button
          aria-label="button for category dropdown"
          className={`text-dark ease-out duration-200 ${
            toggleDropdown && "rotate-180"
          }`}
        >
          <svg
            className="fill-current"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M4.43057 8.51192C4.70014 8.19743 5.17361 8.161 5.48811 8.43057L12 14.0122L18.5119 8.43057C18.8264 8.16101 19.2999 8.19743 19.5695 8.51192C19.839 8.82642 19.8026 9.29989 19.4881 9.56946L12.4881 15.5695C12.2072 15.8102 11.7928 15.8102 11.5119 15.5695L4.51192 9.56946C4.19743 9.29989 4.161 8.82641 4.43057 8.51192Z"
              fill=""
            />
          </svg>
        </button>
      </div>

      {/* بخش آیتم‌های دسته‌بندی (فقط وقتی باز باشد نمایش داده می‌شود) */}
      <div
        className={`flex-col gap-3 py-6 pl-6 pr-5.5 ${
          toggleDropdown ? "flex" : "hidden"
        }`}
      >
        {/* map روی لیست دسته‌ها و رندر هر آیتم */}
        {categories.map((category, key) => (
          <CategoryItem key={key} category={category} />
        ))}
      </div>
    </div>
  );
};

export default CategoryDropdown;
