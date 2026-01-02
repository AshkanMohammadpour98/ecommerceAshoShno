"use client"; 
// یعنی این کامپوننت در سمت کاربر (client-side) رندر میشه، نه سمت سرور.

import React from "react";
import { useDispatch } from "react-redux"; // برای ارسال اکشن به Redux
import { useModalContext } from "@/app/context/QuickViewModalContext"; // برای باز کردن مودال مشاهده سریع
import { updateQuickView } from "@/redux/features/quickView-slice"; // اکشن به‌روزرسانی اطلاعات مودال
import { addItemToCart } from "@/redux/features/cart-slice"; // اکشن افزودن محصول به سبد خرید
import { addItemToWishlist } from "@/redux/features/wishlist-slice"; // اکشن افزودن به لیست علاقه‌مندی‌ها
import Link from "next/link"; // برای لینک‌های داخلی Next.js
import Image from "next/image"; // برای بهینه‌سازی تصاویر در Next.js

// این کامپوننت نمایانگر یک کارت محصول است (در حالت گرید)
const SingleGridItem = ({ item }) => {
  
  // گرفتن تابع dispatch برای ارتباط با Redux
  const dispatch = useDispatch();

  // از Context برای باز کردن مودال استفاده می‌کنیم
  const { openModal } = useModalContext();

  // تابع برای به‌روزرسانی اطلاعات مودال "مشاهده سریع"
  const handleQuickViewUpdate = () => {
    dispatch(updateQuickView({ ...item }));
  };

  // افزودن محصول به سبد خرید
  const handleAddToCart = () => {
    dispatch(addItemToCart({
      ...item,
      quantity: 1, // مقدار پیش‌فرض
    }));
  };

  // افزودن محصول به لیست علاقه‌مندی‌ها
  const handleItemToWishList = () => {
    dispatch(addItemToWishlist({
      ...item,
      status: "available", // فقط یک ویژگی نمایشی
      quantity: 1,
    }));
  };

  // برای ستاره‌های امتیاز
  const totalStars = 5;
  const ratingValue = Number(item.reviews) || 0;
  const safeFilled = Math.min(Math.max(ratingValue, 0), totalStars);

  return (
    <div className="group">
      {/* ======== بخش تصویر محصول ======== */}
      <div className="relative overflow-hidden flex items-center justify-center rounded-lg bg-white shadow-1 min-h-[270px] mb-4">
        {/* نمایش تصویر محصول */}
        <Image
          src={item?.imgs?.previews?.[0] || "/images/notImg.png"}
          alt={item.title || "product image"}
          width={250}
          height={250}
        />

        {/* دکمه‌هایی که با هاور ظاهر می‌شوند */}
        <div className="absolute left-0 bottom-0 translate-y-full w-full flex items-center justify-center gap-2.5 pb-5 ease-linear duration-200 group-hover:translate-y-0">

          {/* دکمه مشاهده سریع */}
          <button
            onClick={() => {
              openModal();
              handleQuickViewUpdate();
            }}
            aria-label="button for quick view"
            className="flex items-center justify-center w-9 h-9 rounded-[5px] shadow-1 ease-out duration-200 text-dark bg-white hover:text-blue"
          >
            👁️
          </button>

          {/* دکمه افزودن به سبد خرید */}
          <button
            onClick={handleAddToCart}
            className="inline-flex font-medium text-custom-sm py-[7px] px-5 rounded-[5px] bg-blue text-white ease-out duration-200 hover:bg-blue-dark"
          >
            افزودن به سبد خرید
          </button>

          {/* دکمه افزودن به لیست علاقه‌مندی‌ها */}
          <button
            onClick={handleItemToWishList}
            aria-label="button for favorite select"
            className="flex items-center justify-center w-9 h-9 rounded-[5px] shadow-1 ease-out duration-200 text-dark bg-white hover:text-blue"
          >
            ❤️
          </button>
        </div>
      </div>

      {/* ======== بخش امتیاز محصول ======== */}
      <div className="flex items-center gap-2.5 mb-2">
        <div style={{ display: "flex", gap: "4px" }}>
          {[...Array(totalStars)].map((_, i) => {
            if (i < Math.floor(safeFilled)) {
              return (
                <Image
                  key={i}
                  src="/images/icons/icon-star.svg"
                  alt="star"
                  width={15}
                  height={15}
                />
              );
            }
            if (i === Math.floor(safeFilled) && safeFilled % 1 >= 0.5) {
              return (
                <Image
                  key={i}
                  src="/images/icons/icon-star-half.svg"
                  alt="half-star"
                  width={15}
                  height={15}
                />
              );
            }
            return (
              <svg
                key={i}
                className="fill-gray-4"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16.7906 6.72187L11.7 5.93438L9.39377 1.09688C9.22502 0.759375 8.77502 0.759375 8.60627 1.09688L6.30002 5.9625L1.23752 6.72187C0.871891 6.77812 0.731266 7.25625 1.01252 7.50938L4.69689 11.3063L3.82502 16.6219C3.76877 16.9875 4.13439 17.2969 4.47189 17.0719L9.05627 14.5687L13.6125 17.0719C13.9219 17.2406 14.3156 16.9594 14.2313 16.6219L13.3594 11.3063L17.0438 7.50938C17.2688 7.25625 17.1563 6.77812 16.7906 6.72187Z"
                  fill=""
                />
              </svg>
            );
          })}
        </div>
        <p className="text-custom-sm">({item.reviews})</p>
      </div>

      {/* ======== عنوان محصول ======== */}
      <h3 className="font-medium text-dark ease-out duration-200 hover:text-blue mb-1.5">
        <Link href={`/shop-details/${item.id}`}>{item.title}</Link>
      </h3>

      {/* ======== قیمت محصول ======== */}
      <span className="flex items-center gap-2 font-medium text-lg">
        {item.hasDiscount && item.discountedPrice > 0 ? (
          <>
            <span className="text-dark-4 line-through">${item.price}</span>
            <span className="text-dark">${item.discountedPrice}</span>
          </>
        ) : (
          <span className="text-dark">${item.price}</span>
        )}
      </span>
    </div>
  );
};

export default SingleGridItem;
