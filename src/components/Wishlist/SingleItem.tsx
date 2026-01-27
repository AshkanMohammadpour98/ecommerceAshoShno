import React from "react";
import { AppDispatch } from "@/redux/store";
import { useDispatch } from "react-redux";
import { removeItemFromWishlist, WishListItem } from "@/redux/features/wishlist-slice";
import { addItemToCart } from "@/redux/features/cart-slice";
import Image from "next/image";
import Swal from "sweetalert2";

interface SingleItemProps {
  item: WishListItem;
  setWishlistItems: React.Dispatch<React.SetStateAction<WishListItem[]>>;
  isCompareSelected: boolean;
  onToggleCompare: () => void;
}

const SingleItem = ({ item, setWishlistItems, isCompareSelected, onToggleCompare }: SingleItemProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const LOCAL_STORAGE_KEY = "wishlistItems";
  const isAvailable = item.count && item.count > 0;

  const Toast = Swal.mixin({
    toast: true,
    position: 'top-start',
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
    didOpen: (toast) => {
      const container = Swal.getContainer();
      if (container) container.style.zIndex = '9999999';
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });

  const handleRemoveFromWishlist = () => {
    dispatch(removeItemFromWishlist(item.id));
    setWishlistItems((prev) => {
      const newItems = prev.filter((i) => i.id !== item.id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newItems));
      return newItems;
    });
    Toast.fire({ icon: 'error', title: 'محصول از لیست حذف شد', background: '#fff' });
  };

  const handleAddToCart = () => {
    if (isAvailable) {
      dispatch(addItemToCart({ ...item, quantity: 1 }));
      Toast.fire({ icon: 'success', title: 'محصول به سبد خرید اضافه شد', background: '#fff' });
    }
  };

  return (
    /* 🔹 بهبود تفکیک در موبایل: اضافه کردن حاشیه و سایه نرم در حالت موبایل */
    <div className="flex flex-col md:grid md:grid-cols-12 md:items-center py-6 px-4 lg:px-10 gap-4 md:gap-0 transition-all hover:bg-gray-50/80 bg-white mb-4 md:mb-0 rounded-xl md:rounded-none border md:border-none border-gray-2 shadow-sm md:shadow-none" dir="rtl">
      
      {/* 🔹 بخش مقایسه و حذف - در موبایل کنار هم قرار می‌گیرند */}
      <div className="md:col-span-1 flex items-center justify-between md:justify-start gap-4 border-b md:border-none pb-3 md:pb-0">
        <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={isCompareSelected}
              onChange={onToggleCompare}
              className="w-5 h-5 text-blue border-gray-3 rounded focus:ring-blue accent-blue transition-transform group-hover:scale-110"
            />
            {/* 🔹 لیبل برای آگاه‌سازی کاربر در موبایل */}
            <span className="text-[10px] md:hidden font-bold text-gray-500 uppercase">انتخاب مقایسه</span>
        </label>
        
        <button
          onClick={handleRemoveFromWishlist}
          className="flex items-center justify-center rounded-full w-9 h-9 md:w-10 md:h-10 bg-gray-50 border border-gray-3 text-red bg-red-light-3 hover:text-red-dark hover:bg-red-light-2 transition-all"
        >
          
          <svg className="fill-current" viewBox="0 0 22 22">
            <path d="M9.19509 8.22222C8.92661 7.95374 8.49131 7.95374 8.22282 8.22222C7.95433 8.49071 7.95433 8.92601 8.22282 9.1945L10.0284 11L8.22284 12.8056C7.95435 13.074 7.95435 13.5093 8.22284 13.7778C8.49133 14.0463 8.92663 14.0463 9.19511 13.7778L11.0006 11.9723L12.8061 13.7778C13.0746 14.0463 13.5099 14.0463 13.7784 13.7778C14.0469 13.5093 14.0469 13.074 13.7784 12.8055L11.9729 11L13.7784 9.19451C14.0469 8.92603 14.0469 8.49073 13.7784 8.22224C13.5099 7.95376 13.0746 7.95376 12.8062 8.22224L11.0006 10.0278L9.19509 8.22222Z" />
          </svg>
        </button>
      </div>

      {/* تصویر و عنوان */}
      <div className="md:col-span-5 flex items-center gap-5 md:px-4">
        <div className="flex-shrink-0 flex items-center justify-center rounded-lg bg-gray-50 w-20 h-20 md:w-24 md:h-24 border border-gray-100 shadow-inner">
          <Image src={item.imgs?.thumbnails[0]} alt={item.title} width={80} height={80} className="object-contain p-2" />
        </div>
        <div>
          <h3 className="text-dark font-bold text-[14px] md:text-[15px] leading-tight hover:text-blue transition-colors">
            <a href="#">{item.title}</a>
          </h3>
          {/* 🔹 فیلد محبوبیت (reviews): در حال حاضر به جای تعداد کامنت استفاده می‌شود. */}
          <div className="flex items-center gap-1 mt-1.5">
              <span className="text-[10px] text-gray-400">تعداد نظرات:</span>
              <span className="text-[10px] font-bold text-blue bg-blue/5 px-1.5 rounded-sm">{item.reviews || 0}</span>
          </div>
        </div>
      </div>

      {/* قیمت */}
      <div className="md:col-span-2 flex md:flex-col justify-between md:justify-center items-center py-2 md:py-0 border-y md:border-none border-gray-50">
        <span className="md:hidden text-xs text-gray-400 font-medium">قیمت واحد:</span>
        <div className="text-right md:text-center">
          {(item as any).hasDiscount && (item as any).discountedPrice > 0 ? (
            <>
              <span className="text-gray-400 line-through text-[10px] block">
                {item.price.toLocaleString('fa-IR')} تومان
              </span>
              <p className="text-dark font-extrabold text-sm md:text-base">
                {(item as any).discountedPrice.toLocaleString('fa-IR')} تومان
              </p>
            </>
          ) : (
            <p className="text-dark font-extrabold text-sm md:text-base">
              {item.price ? item.price.toLocaleString('fa-IR') : 0} تومان
            </p>
          )}
        </div>
      </div>

      {/* وضعیت موجودی */}
      <div className="md:col-span-2 flex justify-between md:justify-center items-center">
        <span className="md:hidden text-xs text-gray-400 font-medium">وضعیت انبار:</span>
        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${isAvailable ? 'bg-green/10 text-green' : 'bg-red/10 text-red'}`}>
          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isAvailable ? 'bg-green' : 'bg-red'}`}></span>
          {isAvailable ? 'آماده ارسال' : 'ناموجود'}
        </span>
      </div>

      {/* دکمه افزودن */}
      <div className="md:col-span-2 flex md:justify-end mt-2 md:mt-0">
        <button
          onClick={handleAddToCart}
          disabled={!isAvailable}
          className={`
            w-full md:w-auto flex justify-center items-center py-3 md:py-2 px-6 rounded-xl text-xs font-bold transition-all
            ${isAvailable 
              ? 'bg-dark text-white hover:bg-blue shadow-md' 
              : 'bg-gray-2 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {isAvailable ? 'افزودن به سبد خرید' : 'اتمام موجودی'}
        </button>
      </div>
    </div>
  );
};

export default SingleItem;