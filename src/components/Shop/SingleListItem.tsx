"use client";
import React from "react";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import { updateQuickView } from "@/redux/features/quickView-slice";
import { addItemToCart } from "@/redux/features/cart-slice";
import { addItemToWishlist } from "@/redux/features/wishlist-slice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import Link from "next/link";
import Image from "next/image";

const SingleListItem = ({ item }) => {
  // منطق ستاره ها
  const totalStars = 5;

  // تبدیل به عدد و محدود کردن بین 0 تا totalStars
  const ratingValue = Number(item.reviews) || 0;
  const safeFilled = Math.min(Math.max(ratingValue, 0), totalStars);

  const { openModal } = useModalContext();
  const dispatch = useDispatch<AppDispatch>();

  // update the QuickView state
  const handleQuickViewUpdate = () => {
    dispatch(updateQuickView({ ...item }));
  };

  // add to cart
  const handleAddToCart = () => {
    dispatch(
      addItemToCart({
        ...item,
        quantity: 1,
      })
    );
  };

  const handleItemToWishList = () => {
    dispatch(
      addItemToWishlist({
        ...item,
        status: "available",
        quantity: 1,
      })
    );
  };

  return (
    <div dir="rtl" className="group rounded-lg bg-white shadow-1 border border-gray-100 hover:shadow-2 transition-all duration-300">
      <div className="flex flex-col md:flex-row">
        
        {/* ======== بخش تصویر محصول ======== */}
        <div className="relative overflow-hidden flex items-center justify-center bg-gray-50/50 min-w-[240px] md:max-w-[240px] w-full p-4 rounded-r-lg">
          <Image 
            src={item.imgs.previews[0]} 
            alt={item.title} 
            width={220} 
            height={220} 
            className="object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* وضعیت محصول روی تصویر */}
          {item.condition && (
            <span className="absolute top-3 right-3 text-[10px] font-bold px-3 py-1 rounded-full bg-blue text-white shadow-sm z-10">
              {item.condition}
            </span>
          )}
          {/* لایه اکشن‌های سریع که در هاور ظاهر می‌شود */}
          <div className=" absolute inset-0
    bg-black/0 md:bg-black/5
    opacity-100
    md:opacity-0
    md:group-hover:opacity-100
    transition-opacity duration-300
    flex items-center justify-center gap-3">
             <button
              onClick={() => {
                openModal();
                handleQuickViewUpdate();
              }}
              className="w-10 h-10 rounded-full bg-white text-dark hover:bg-blue hover:text-white flex items-center justify-center shadow-lg transition-all transform hover:-translate-y-1"
              title="مشاهده سریع"
            >
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M8 5.5C6.619 5.5 5.5 6.619 5.5 8C5.5 9.381 6.619 10.5 8 10.5C9.381 10.5 10.5 9.381 10.5 8C10.5 6.619 9.381 5.5 8 5.5ZM6.5 8C6.5 7.172 7.172 6.5 8 6.5C8.829 6.5 9.5 7.172 9.5 8C9.5 8.828 8.829 9.5 8 9.5C7.172 9.5 6.5 8.828 6.5 8Z" fill="currentColor"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M8 2.167C5 2.167 3 3.97 1.8 5.525C1.5 5.87 1.25 6.19 1.1 6.566C0.9 6.97 0.83 7.408 0.83 8C0.83 8.592 0.91 9.031 1.1 9.434C1.25 9.81 1.5 10.13 1.8 10.475C3 12.03 5 13.833 8 13.833C11 13.833 13 12.03 14.2 10.475C14.5 10.13 14.75 9.81 14.9 9.434C15.1 9.031 15.17 8.592 15.17 8C15.17 7.408 15.1 6.97 14.9 6.566C14.75 6.19 14.5 5.87 14.2 5.525C13 3.97 11 2.167 8 2.167Z" fill="currentColor"/>
              </svg>
            </button>
            <button
              onClick={handleItemToWishList}
              className="w-10 h-10 rounded-full bg-white text-dark hover:bg-red-500 hover:text-white flex items-center justify-center shadow-lg transition-all transform hover:-translate-y-1"
              title="افزودن به علاقه‌مندی"
            >
              <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 2.972C6.458 1.594 4.732 1.4 3.334 2.04C1.856 2.715 0.833 4.283 0.833 6.091C0.833 7.868 1.574 9.224 2.544 10.317C3.322 11.193 4.273 11.925 5.114 12.572L8 14.167L10.886 12.572C11.726 11.925 12.678 11.193 13.455 10.317C14.426 9.224 15.167 7.868 15.167 6.091C15.167 4.283 14.143 2.715 12.666 2.04C11.267 1.4 9.541 1.594 8 2.972Z" />
              </svg>
            </button>
          </div>
        </div>

        {/* ======== بخش اطلاعات مرکزی ======== */}
        <div className="flex-grow flex flex-col md:flex-row p-6 lg:p-8 gap-6">
          
          <div className="flex-grow flex flex-col justify-center border-l border-gray-50 pl-6">
            <div className="flex items-center gap-2 mb-2 text-xs text-blue font-medium uppercase tracking-wider">
              <span>{item.categorie}</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span>کد محصول: {item.id}</span>
            </div>

            <h3 className="text-xl font-bold text-dark hover:text-blue transition-colors mb-3">
              <Link href={`/shop-details/${item._id?.$oid || item._id}`}> {item.title} </Link>
            </h3>

            {/* بخش توضیحات کوتاه برای پر کردن فضای خالی میانی */}
            {item.description?.short && (
              <p className="text-gray-500 text-sm leading-7 line-clamp-2 mb-4">
                {item.description.short}
              </p>
            )}

            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1">
                {[...Array(totalStars)].map((_, i) => (
                  <StarItem key={i} index={i} safeFilled={safeFilled} />
                ))}
              </div>
              <p className="text-xs text-gray-400 font-medium mt-1">({item.reviews}امتیاز)</p>
            </div>
          </div>

          {/* ======== بخش قیمت و دکمه خرید ======== */}
          <div className="md:min-w-[180px] flex flex-col justify-center items-center md:items-start gap-4">
            <div className="flex flex-col items-center md:items-start">
              {item.hasDiscount && item.discountedPrice ? (
                <>
                  <span className="text-gray-400 line-through text-sm decoration-red-400/50">${item.price.toLocaleString()}</span>
                  <span className="text-2xl font-black text-blue">${item.discountedPrice.toLocaleString()}</span>
                </>
              ) : (
                <span className="text-2xl font-black text-dark">${item.price.toLocaleString()}</span>
              )}
            </div>
            
            <button
              onClick={handleAddToCart}
              className="w-full bg-dark hover:bg-blue text-white px-5 py-3 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2 group/btn"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform group-hover/btn:translate-x-1">
                <path d="M14.1667 15.8333C14.6269 15.8333 15 16.2064 15 16.6667C15 17.1269 14.6269 17.5 14.1667 17.5C13.7064 17.5 13.3333 17.1269 13.3333 16.6667C13.3333 16.2064 13.7064 15.8333 14.1667 15.8333Z" fill="currentColor"/>
                <path d="M7.5 15.8333C7.96024 15.8333 8.33333 16.2064 8.33333 16.6667C8.33333 17.1269 7.96024 17.5 7.5 17.5C7.03976 17.5 6.66667 17.1269 6.66667 16.6667C6.66667 16.2064 7.03976 15.8333 7.5 15.8333Z" fill="currentColor"/>
                <path d="M2.5 3.33333H4.16667L5 11.6667H15L15.8333 5H5.83333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>افزودن به سبد</span>
            </button>
            
            <p className={`text-[11px] font-bold ${item.count > 0 ? 'text-green-600' : 'text-red-500'}`}>
               {item.count > 0 ? `در انبار: ${item.count} عدد موجود` : 'ناموجود در انبار'}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

// کامپوننت داخلی برای مدیریت بهینه ستاره‌ها
const StarItem = ({ index, safeFilled }) => {
  // ستاره پر
  if (index < Math.floor(safeFilled)) {
    return (
      <Image src="/images/icons/icon-star.svg" alt="star" width={14} height={14} />
    );
  }
  // ستاره نیمه
  if (index === Math.floor(safeFilled) && safeFilled % 1 >= 0.5) {
    return (
      <Image src="/images/icons/icon-star-half.svg" alt="half star" width={14} height={14} />
    );
  }
  // ستاره خالی
  return (
    <svg className="text-gray-200 fill-current" width="16" height="16" viewBox="0 0 18 18">
      <path d="M16.7906 6.72187L11.7 5.93438L9.39377 1.09688C9.22502 0.759375 8.77502 0.759375 8.60627 1.09688L6.30002 5.9625L1.23752 6.72187C0.871891 6.77812 0.731266 7.25625 1.01252 7.50938L4.69689 11.3063L3.82502 16.6219C3.76877 16.9875 4.13439 17.2969 4.47189 17.0719L9.05627 14.5687L13.6125 17.0719C13.9219 17.2406 14.3156 16.9594 14.2313 16.6219L13.3594 11.3063L17.0438 7.50938C17.2688 7.25625 17.1563 6.77812 16.7906 6.72187Z" />
    </svg>
  );
};

export default SingleListItem;