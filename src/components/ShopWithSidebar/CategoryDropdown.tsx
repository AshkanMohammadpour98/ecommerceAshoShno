// 📌 این کامپوننت یک منوی کشویی (Dropdown) دسته‌بندی‌ها را نمایش می‌دهد که هر دسته قابلیت انتخاب (چک‌باکس‌مانند) دارد.

"use client";

import { useState } from "react";

// 🔹 این کامپوننت یک آیتم دسته‌بندی تکی را نمایش می‌دهد
// شامل نام دسته، تعداد محصولات و یک حالت انتخاب (selected) است
const CategoryItem = ({ category, isSelected, onSelect }) => {
  return (
    <button
      onClick={onSelect}
      className={`${isSelected && "text-blue"
        } group flex items-center justify-between ease-out duration-200 hover:text-blue`}
    >
      <div className="flex items-center gap-2">
        <div
          className={`flex items-center justify-center rounded w-4 h-4 border ${isSelected ? "border-blue bg-blue" : "bg-white border-gray-3"
            }`}
        >
          <svg
            className={isSelected ? "block" : "hidden"}
            width="10"
            height="10"
            viewBox="0 0 10 10"
          >
            <path
              d="M8.33317 2.5L3.74984 7.08333L1.6665 5"
              stroke="white"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <span>{category.name}</span>
      </div>

      <span
        className={`${isSelected ? "text-white bg-blue" : "bg-gray-2"
          } inline-flex rounded-[30px] text-custom-xs px-2`}
      >
        {category.products}
      </span>
    </button>
  );
};

// 🔹 این کامپوننت منوی کشویی دسته‌بندی‌ها را مدیریت و نمایش می‌دهد
const CategoryDropdown = ({ categories, selectedCategories, setSelectedCategories, }) => {
  console.log(categories , "categories ...");
  
  // state برای باز/بسته بودن منوی کشویی
  const [toggleDropdown, setToggleDropdown] = useState(true);
  const handleSelectCategory = (category) => {
  setSelectedCategories((prev) => {
    const isSelected = prev.some((c) => c._id === category._id);

    if (isSelected) {
      // حذف
      return prev.filter((c) => c._id !== category._id);
    } else {
      // اضافه
      return [...prev, category];
    }
  });
};

console.log(selectedCategories , 'selectedCategories...');

  return (
    <div className="bg-white shadow-1 rounded-lg">
      {/* هدر منو - کلیک برای باز/بسته کردن */}
      <div
        onClick={(e) => {
          e.preventDefault();
          setToggleDropdown(!toggleDropdown);
        }}
        className={`cursor-pointer flex items-center justify-between py-3 pl-6 pr-5.5 ${toggleDropdown && "shadow-filter"
          }`}
      >
        <p className="text-dark">Category</p>

        {/* آیکن فلش که هنگام باز بودن می‌چرخد */}
        <button
          aria-label="button for category dropdown"
          className={`text-dark ease-out duration-200 ${toggleDropdown && "rotate-180"
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
        className={`flex-col gap-3 py-6 pl-6 pr-5.5 ${toggleDropdown ? "flex" : "hidden"
          }`}
      >
        {/* map روی لیست دسته‌ها و رندر هر آیتم */}
        {categories.map((category) => (
  <CategoryItem
    key={category._id}
    category={category}
    isSelected={selectedCategories.some(
      (c) => c._id === category._id
    )}
    onSelect={() => handleSelectCategory(category)}
  />
))}

      </div>
    </div>
  );
};

export default CategoryDropdown;
