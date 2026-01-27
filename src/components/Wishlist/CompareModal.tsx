"use client";
import React from "react";
import { WishListItem } from "@/redux/features/wishlist-slice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { addItemToCart } from "@/redux/features/cart-slice";
import Swal from "sweetalert2";
import Image from "next/image";

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: WishListItem[];
}

const CompareModal = ({ isOpen, onClose, items }: CompareModalProps) => {
  const dispatch = useDispatch<AppDispatch>();

  // 🔹 اگر مودال بسته بود چیزی رندر نشود (مانع از سنگین شدن DOM)
  if (!isOpen) return null;

  // 🔹 تابع خرید سریع: کالا را به سبد اضافه کرده و اطلاع‌رسانی می‌کند
  const handleQuickAdd = (item: WishListItem) => {
    dispatch(addItemToCart({ ...item, quantity: 1 }));
    
    // تنظیمات SweetAlert برای نمایش صحیح روی لایه‌ی مودال
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-start',
      showConfirmButton: false,
      timer: 2000,
      didOpen: (toast) => {
        const container = Swal.getContainer();
        // لایه‌ی مسیج باید از لایه‌ی مودال (1000000) بالاتر باشد
        if (container) container.style.zIndex = '10000001';
      }
    });

    Toast.fire({
      icon: 'success',
      title: 'با موفقیت به سبد خرید اضافه شد',
      background: '#fff',
    });
  };

  // 🔹 منطق داینامیک ستاره‌ها: تبدیل عدد امتیاز به آیکون‌های بصری
  const renderStars = (rating: number) => {
    const totalStars = 5;
    // محدود کردن عدد بین 0 و 5 برای جلوگیری از خطای رندر
    const safeFilled = Math.min(Math.max(Number(rating) || 0, 0), totalStars);
    
    return (
      <div className="flex items-center justify-center gap-1">
        {[...Array(totalStars)].map((_, i) => {
          // ستاره کامل
          if (i < Math.floor(safeFilled)) {
            return (
              <Image key={i} src="/images/icons/icon-star.svg" alt="star" width={15} height={15} />
            );
          }
          // ستاره نیمه (اگر اعشار امتیاز بیشتر از 0.5 باشد)
          if (i === Math.floor(safeFilled) && safeFilled % 1 >= 0.5) {
            return (
              <Image key={i} src="/images/icons/icon-star-half.svg" alt="half-star" width={15} height={15} />
            );
          }
          // ستاره خالی (با استفاده از SVG خاکستری)
          return (
            <svg key={i} width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.7906 6.72187L11.7 5.93438L9.39377 1.09688C9.22502 0.759375 8.77502 0.759375 8.60627 1.09688L6.30002 5.9625L1.23752 6.72187C0.871891 6.77812 0.731266 7.25625 1.01252 7.50938L4.69689 11.3063L3.82502 16.6219C3.76877 16.9875 4.13439 17.2969 4.47189 17.0719L9.05627 14.5687L13.6125 17.0719C13.9219 17.2406 14.3156 16.9594 14.2313 16.6219L13.3594 11.3063L17.0438 7.50938C17.2688 7.25625 17.1563 6.77812 16.7906 6.72187Z" fill="#E2E8F0" />
            </svg>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[1000000] flex items-center justify-center p-2 sm:p-4 bg-dark/70 backdrop-blur-sm transition-all" dir="rtl">
      <div className="bg-white w-full max-w-5xl max-h-[95vh] md:max-h-[85vh] rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        
        {/* هدر مودال */}
        <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-50">
          <div>
            <h3 className="text-lg md:text-xl font-black text-dark">مقایسه هوشمند کالا</h3>
            <p className="text-[10px] text-gray-400 mt-1">بررسی تفاوت‌های قیمت، محبوبیت و زمان افزودن</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-red text-white hover:bg-red-dark hover:text-white transition-all shadow-sm"
          >
            ✕
          </button>
        </div>

        {/* بخش اصلی جدول (اسکرول‌پذیر) */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-right border-separate border-spacing-0">
            <thead className="sticky top-0 z-20 bg-white shadow-sm">
              <tr>
                <th className="sticky right-0 z-30 bg-white py-4 px-4 text-gray-400 font-bold text-[10px] md:text-xs border-b border-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  ویژگی‌ها
                </th>
                {items.map(item => (
                  <th key={String(item._id)} className="py-4 px-4 border-b border-gray-100 min-w-[160px] md:min-w-[220px] text-center">
                    <img 
                      src={item.imgs?.thumbnails[0]} 
                      alt="" 
                      className="w-16 h-16 md:w-24 md:h-24 object-contain mx-auto transition-transform hover:scale-110 duration-500"
                    />
                    <div className="text-[11px] md:text-xs font-bold text-dark line-clamp-2 mt-2 px-2 h-8 leading-relaxed">
                      {item.title}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="text-[12px] md:text-sm">
              {/* ردیف قیمت */}
              <tr className="hover:bg-blue/5 transition-colors">
                <td className="sticky right-0 z-10 bg-white py-5 px-4 font-bold text-gray-600 border-b border-gray-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">قیمت نهایی</td>
                {items.map(item => (
                  <td key={String(item._id)} className="text-center py-5 px-4 border-b border-gray-50 font-black text-blue">
                    {(item.discountedPrice || item.price).toLocaleString('fa-IR')} تومان
                  </td>
                ))}
              </tr>

              {/* ردیف امتیاز (محبوبیت) */}
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="sticky right-0 z-10 bg-white py-5 px-4 font-bold text-gray-600 border-b border-gray-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">امتیاز کاربران</td>
                {items.map(item => (
                  <td key={String(item._id)} className="text-center py-5 px-4 border-b border-gray-50">
                    {renderStars(item.reviews)}
                    <span className="text-[10px] font-bold text-gray-400 block mt-1">({item.reviews} امتیاز)</span>
                  </td>
                ))}
              </tr>

              {/* ردیف تاریخ افزودن */}
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="sticky right-0 z-10 bg-white py-5 px-4 font-bold text-gray-600 border-b border-gray-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">تاریخ افزودن</td>
                {items.map(item => (
                  <td key={String(item._id)} className="text-center py-5 px-4 border-b border-gray-50 text-gray-500">
                    {item.date || "---"}
                  </td>
                ))}
              </tr>

              {/* ردیف دکمه خرید */}
              <tr>
                <td className="sticky right-0 z-10 bg-white py-8 px-4 font-bold text-gray-600 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">تصمیم نهایی</td>
                {items.map(item => (
                  <td key={String(item._id)} className="text-center py-8 px-4">
                    <button 
                      onClick={() => handleQuickAdd(item)}
                      disabled={item.count === 0}
                      className={`w-full max-w-[140px] mx-auto py-2.5 rounded-xl text-[10px] font-bold transition-all shadow-md active:scale-95 ${item.count !== 0 ? 'bg-dark text-white hover:bg-blue' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                    >
                      {item.count !== 0 ? 'افزودن به سبد' : 'ناموجود'}
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* فوتر مودال */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-[10px] text-gray-400">نکته: برای مشاهده تمامی کالاها در موبایل، جدول را به سمت چپ بکشید.</p>
        </div>
      </div>
    </div>
  );
};

export default CompareModal;