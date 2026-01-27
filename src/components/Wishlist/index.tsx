"use client";
import React, { useEffect, useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import SingleItem from "./SingleItem";
import CompareModal from "./CompareModal"; // 🔹 وارد کردن کامپوننت جدید
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { removeAllItemsFromWishlist, WishListItem } from "@/redux/features/wishlist-slice";
import Link from "next/link";

// کلید LocalStorage برای لیست علاقه‌مندی‌ها
const LOCAL_STORAGE_KEY = "wishlistItems";

export const Wishlist = () => {
  const dispatch = useDispatch<AppDispatch>();

  // 🔹 state محلی برای نگه داشتن آیتم‌ها
  const [wishlistItems, setWishlistItems] = useState<WishListItem[]>([]);

  // 🔹 مدیریت محصولات انتخاب شده برای مقایسه
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  
  // 🔹 وضعیت باز/بسته بودن مودال مقایسه
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // 🔹 بارگذاری داده‌ها از LocalStorage هنگام mount کامپوننت
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedItems = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedItems) {
        setWishlistItems(JSON.parse(storedItems));
      }
    }
  }, []);

  // 🔹 حذف همه آیتم‌ها از لیست
  const handleClearAll = () => {
    dispatch(removeAllItemsFromWishlist());
    setWishlistItems([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setSelectedForCompare([]);
  };

  const toggleCompare = (productId: string) => {
    setSelectedForCompare((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // 🔹 فیلتر محصولات برای ارسال به کامپوننت مودال
  const itemsToCompare = wishlistItems.filter(item => 
    selectedForCompare.includes(item._id as string)
  );

  return (
    <>
      <Breadcrumb title={"لیست علاقه‌مندی‌ها"} pages={["لیست علاقه‌مندی‌ها"]} />

      <section className="overflow-hidden py-10 lg:py-20 bg-gray-2" dir="rtl">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="font-bold text-dark text-xl md:text-2xl">لیست علاقه‌مندی‌های شما</h2>
              <p className="text-xs text-gray-500 mt-1">محصولات را برای مقایسه هوشمند تیک بزنید.</p>
            </div>
            
            <div className="flex items-center gap-4">
              {selectedForCompare.length >= 2 && (
                <button 
                  className="bg-blue text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-lg hover:shadow-blue/30 transition-all animate-bounce"
                  onClick={() => setIsCompareModalOpen(true)}
                >
                  مقایسه هوشمند ({selectedForCompare.length})
                </button>
              )}
              
              <button className="text-blue text-sm font-medium hover:text-opacity-80 transition-all border-b border-blue border-opacity-0 hover:border-opacity-100" onClick={handleClearAll}>
                پاک کردن همه آیتم‌ها
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-3">
             {/* آیتم‌های لیست علاقه‌مندی با حفظ ساختار قبلی */}
             <div className="divide-y divide-gray-100">
                {wishlistItems.length > 0 ? (
                  wishlistItems.map((item) => (
                    <SingleItem 
                      key={String(item._id)} 
                      item={item} 
                      setWishlistItems={setWishlistItems}
                      isCompareSelected={selectedForCompare.includes(item._id as string)}
                      onToggleCompare={() => toggleCompare(item._id as string)}
                    />
                  ))
                ) : (
               <div className="flex flex-col items-center justify-center py-20 text-center">
  <svg
    className="w-8 h-8 mb-3 fill-current text-gray-400"
    viewBox="0 0 16 16"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3.74949 2.94946C2.6435 3.45502 1.83325 4.65749 1.83325 6.0914C1.83325 7.55633 2.43273 8.68549 3.29211 9.65318C4.0004 10.4507 4.85781 11.1118 5.694 11.7564C5.89261 11.9095 6.09002 12.0617 6.28395 12.2146C6.63464 12.491 6.94747 12.7337 7.24899 12.9099C7.55068 13.0862 7.79352 13.1667 7.99992 13.1667C8.20632 13.1667 8.44916 13.0862 8.75085 12.9099C9.05237 12.7337 9.3652 12.491 9.71589 12.2146C9.90982 12.0617 10.1072 11.9095 10.3058 11.7564C11.142 11.1118 11.9994 10.4507 12.7077 9.65318C13.5671 8.68549 14.1666 7.55633 14.1666 6.0914C14.1666 4.65749 13.3563 3.45502 12.2503 2.94946C11.1759 2.45832 9.73214 2.58839 8.36016 4.01382C8.2659 4.11175 8.13584 4.16709 7.99992 4.16709C7.864 4.16709 7.73393 4.11175 7.63967 4.01382C6.26769 2.58839 4.82396 2.45832 3.74949 2.94946Z"
    />
  </svg>

  <p className="text-gray-400 text-base sm:text-lg shadow-sm">
    لیست علاقه‌مندی‌های شما خالی است.
  </p>

  <Link href={'/shop-with-sidebar'} className="mt-4 px-5 py-2 bg-gray-4 text-blue rounded-lg hover:text-gray-4 hover:bg-blue hover:translate-y-[-2px] hover:shadow-md 
  transition-all duration-300 ease-in-out">
    مشاهده محصولات
  </Link>
</div>


                )}
             </div>
          </div>
        </div>
      </section>

      {/* 🔹 فراخوانی کامپوننت مودال مقایسه */}
      <CompareModal 
        isOpen={isCompareModalOpen} 
        onClose={() => setIsCompareModalOpen(false)} 
        items={itemsToCompare}
      />
    </>
  );
};