'use client';

import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';

const CustomSelect = ({ options, onChange }) => {
  // const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);

  // نرمال‌سازی برای اینکه label همیشه از name پر شود
  const normalized = options.map((o) => ({
    ...o,
    label: o.label ?? o.name,
  }));

  const [selectedOption, setSelectedOption] = useState(normalized[0] ?? null);

  useEffect(() => {
    // اگر options از بیرون تغییر کرد، انتخاب پیش‌فرض رو به اولی ببر
    setSelectedOption(normalized[0] ?? null);
    
  }, [options]);
  
  const toggleDropdown = () => setIsOpen((v) => !v);
  

const handleOptionClick = (option) => {
  setSelectedOption(option);
  setIsOpen(false);
  onChange?.(option); // 🔥 فقط اطلاع به والد
};

  useEffect(() => {
    
    function handleClickOutside(event) {
      if (!event.target.closest('.dropdown-content')) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="dropdown-content custom-select relative" style={{ width: 200 }}>
      {/* انتخاب شده */}
      <div
        className={`select-selected whitespace-nowrap ${isOpen ? 'select-arrow-active' : ''}`}
        onClick={toggleDropdown}
      >
        {selectedOption?.label ?? 'انتخاب دسته‌بندی'}
      </div>

      {/* لیست گزینه‌ها */}
      <div className={`select-items ${isOpen ? '' : 'select-hide'}`}>
        {/* اگر placeholder نداری، دیگه slice(1,-1) لازم نیست */}
        {normalized.map((option) => {
          const key = option.id ?? option.name ?? option.label;
          const isActive =
            (selectedOption?.id ?? selectedOption?.name ?? selectedOption?.label) ===
            (option.id ?? option.name ?? option.label);

          return (
            <div
              key={key}
              onClick={() => handleOptionClick(option)}
              className={`select-item ${isActive ? 'same-as-selected' : ''}`}
            >
              {option.label}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CustomSelect;