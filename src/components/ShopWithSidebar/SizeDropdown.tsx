/**
 * 📌 SizeDropdown → این کامپوننت یک منوی کشویی برای انتخاب سایز لباس (M, L, XL, XXL) است.
 * - با کلیک روی هدر، لیست باز و بسته می‌شود.
 * - از دکمه‌های رادیویی مخفی استفاده شده تا تنها یک سایز انتخاب شود.
 * - ظاهر انتخاب‌ها با استایل Tailwind تغییر می‌کند (هایلایت سایز انتخاب‌شده).
 */

"use client";
import React, { useState } from "react";

const SizeDropdown = () => {
  const [toggleDropdown, setToggleDropdown] = useState(true);

  return (
    <div className="bg-white shadow-1 rounded-lg">
      {/* هدر کامپوننت که با کلیک باز و بسته می‌شود */}
      <div
        onClick={() => setToggleDropdown(!toggleDropdown)}
        className={`cursor-pointer flex items-center justify-between py-3 pl-6 pr-5.5 ${
          toggleDropdown && "shadow-filter"
        }`}
      >
        <p className="text-dark">سایز</p>

        {/* آیکن فلش برای باز/بسته شدن منو */}
        <button
          onClick={() => setToggleDropdown(!toggleDropdown)}
          aria-label="button for size dropdown"
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

      {/* محتوای منوی کشویی سایزها */}
      <div
        className={`flex-wrap gap-2.5 p-6 ${
          toggleDropdown ? "flex" : "hidden"
        }`}
      >
        {/* گزینه سایز M */}
        <label
          htmlFor="sizeM"
          className="cursor-pointer select-none flex items-center rounded-md bg-blue text-white hover:bg-blue hover:text-white"
        >
          <div className="relative">
            <input type="radio" name="size" id="sizeM" className="sr-only" />
            <div className="text-custom-sm py-[5px] px-3.5 rounded-[5px]">M</div>
          </div>
        </label>

        {/* گزینه سایز L */}
        <label
          htmlFor="sizeL"
          className="cursor-pointer select-none flex items-center rounded-md hover:bg-blue hover:text-white"
        >
          <div className="relative">
            <input type="radio" name="size" id="sizeL" className="sr-only" />
            <div className="text-custom-sm py-[5px] px-3.5 rounded-[5px]">L</div>
          </div>
        </label>

        {/* گزینه سایز XL */}
        <label
          htmlFor="sizeXL"
          className="cursor-pointer select-none flex items-center rounded-md hover:bg-blue hover:text-white"
        >
          <div className="relative">
            <input type="radio" name="size" id="sizeXL" className="sr-only" />
            <div className="text-custom-sm py-[5px] px-3.5 rounded-[5px]">XL</div>
          </div>
        </label>

        {/* گزینه سایز XXL */}
        <label
          htmlFor="sizeXXL"
          className="cursor-pointer select-none flex items-center rounded-md hover:bg-blue hover:text-white"
        >
          <div className="relative">
            <input type="radio" name="size" id="sizeXXL" className="sr-only" />
            <div className="text-custom-sm py-[5px] px-3.5 rounded-[5px]">XXL</div>
          </div>
        </label>
      </div>
    </div>
  );
};

export default SizeDropdown;
