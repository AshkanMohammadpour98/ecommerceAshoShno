// 📌 این کامپوننت یک Select سفارشی (Custom Select) است که لیستی از گزینه‌ها را نمایش می‌دهد و قابلیت باز/بسته شدن و انتخاب گزینه دارد.

import React, { useState, useEffect, useRef } from "react";

const CustomSelect = ({ options , selectedOption , setSelectedOption }) => {
  // state برای باز/بسته بودن dropdown
  const [isOpen, setIsOpen] = useState(false);

  // ref برای تشخیص کلیک خارج از کامپوننت
  const selectRef = useRef(null);

  // 🔹 تابع برای بستن dropdown وقتی کاربر بیرون از کامپوننت کلیک می‌کند
  const handleClickOutside = (event) => {
    if (selectRef.current && !selectRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    // اضافه کردن eventListener برای کلیک روی کل document
    document.addEventListener("click", handleClickOutside);

    // پاکسازی eventListener هنگام unmount شدن کامپوننت
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // باز/بسته کردن dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // وقتی کاربر یک گزینه انتخاب کند
  const handleOptionClick = (option) => {
    setSelectedOption(option); // ست کردن گزینه انتخابی
    toggleDropdown(); // بستن dropdown
  };

  // محافظت وقتی options هنوز نیومده
  if (!options.length || !selectedOption) return null;

  return (
    <div
      className="custom-select custom-select-2 flex-shrink-0 relative"
      ref={selectRef} // رفرنس برای تشخیص کلیک بیرونی
    >
      {/* بخش اصلی نمایش گزینه انتخاب شده */}
      <div
        className={`select-selected whitespace-nowrap ${
          isOpen ? "select-arrow-active" : ""
        }`}
        onClick={toggleDropdown} // باز و بسته کردن dropdown
      >
        {selectedOption.label}
      </div>

      {/* لیست گزینه‌ها */}
      <div className={`select-items ${isOpen ? "" : "select-hide"}`}>
        {options.slice(1).map((option, index) => (
          <div
            key={index}
            onClick={() => handleOptionClick(option)}
            className={`select-item ${
              selectedOption === option ? "same-as-selected" : ""
            }`}
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomSelect;
