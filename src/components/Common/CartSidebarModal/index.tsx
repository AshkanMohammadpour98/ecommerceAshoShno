"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { useAppSelector } from "@/redux/store";
import { useSelector } from "react-redux";
import { selectTotalPrice, removeItemFromCart } from "@/redux/features/cart-slice";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import SingleItem from "./SingleItem";
import EmptyCart from "./EmptyCart";

/**
 * کامپوننت CartSidebarModal
 * این کامپوننت یک پنل سایدبار نمایش سبد خرید است که از سمت راست صفحه باز می‌شود.
 * آیتم‌های داخل سبد را نشان می‌دهد و امکان حذف هر آیتم، مشاهده سبد و رفتن به صفحه پرداخت را فراهم می‌کند.
 */
const CartSidebarModal: React.FC = () => {
  const { isCartModalOpen, closeCartModal } = useCartModalContext();
  const cartItems = useAppSelector((state) => state.cartReducer.items);
  const totalPrice = useSelector(selectTotalPrice);

  // بستن مودال هنگام کلیک خارج از پنل
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!(event.target as HTMLElement).closest(".modal-content")) {
        closeCartModal();
      }
    }

    if (isCartModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCartModalOpen, closeCartModal]);

  return (
    // Overlay تاریک پشت سایدبار
    <div className={`fixed top-0 left-0 w-full h-screen z-50 bg-dark/70 transition-opacity duration-300 ${isCartModalOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>
  <div className="flex justify-start h-full">
    <div className={`modal-content w-full max-w-[500px] h-full bg-white shadow-lg flex flex-col text-right transform transition-transform duration-300 ease-in-out ${isCartModalOpen ? "translate-x-0" : "-translate-x-full"}`}>
      
      {/* هدر */}
      <div className="sticky top-0 bg-white flex items-center justify-between border-b border-gray-3 pb-7 pt-4 sm:pt-7.5 lg:pt-11 px-4 sm:px-7.5 lg:px-11">
        <h2 className="font-medium text-dark text-lg sm:text-2xl">سبد خرید</h2>
        <button onClick={closeCartModal} className="flex items-center justify-center bg-meta text-dark-5 hover:text-dark p-2 rounded">
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-dark">
            <path d="M12.5379 11.2121L15 13.6742L17.462 11.2121" stroke="currentColor" strokeWidth="2"/>
            <path d="M12.5379 18.7879L15 16.3258L17.462 18.7879" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </button>
      </div>

      {/* لیست آیتم‌ها */}
      <div className="flex-1 h-[66vh] overflow-y-auto no-scrollbar px-4 sm:px-7.5 lg:px-11 pt-4">
        {cartItems.length > 0 ? cartItems.map((item, idx) => (
          <SingleItem key={idx} item={item} removeItemFromCart={removeItemFromCart}/>
        )) : <EmptyCart />}
      </div>

      {/* فوتر */}
      <div className="border-t border-gray-3 bg-white pt-5 pb-4 sm:pb-7.5 lg:pb-11 mt-7.5 sticky bottom-0 px-4 sm:px-7.5 lg:px-11">
        <div className="flex items-center justify-between gap-5 mb-6">
          <p className="font-medium text-xl text-dark">جمع کل:</p>
          <p className="font-medium text-xl text-dark">${totalPrice}</p>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/cart" onClick={closeCartModal} className="w-full flex justify-center font-medium text-white bg-blue py-[13px] px-6 rounded-md transition-all duration-200 hover:bg-blue-dark">مشاهده سبد خرید</Link>
          <Link href="/checkout" className="w-full flex justify-center font-medium text-white bg-dark py-[13px] px-6 rounded-md transition-all duration-200 hover:bg-opacity-95">پرداخت</Link>
        </div>
      </div>

    </div>
  </div>
</div>

  );
};

export default CartSidebarModal;
