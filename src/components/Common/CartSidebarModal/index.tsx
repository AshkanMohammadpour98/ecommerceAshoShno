"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { useAppSelector } from "@/redux/store";
import { useSelector } from "react-redux";
import { selectTotalPrice, removeItemFromCart } from "@/redux/features/cart-slice";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import SingleItem from "./SingleItem";
import EmptyCart from "./EmptyCart";

const CartSidebarModal: React.FC = () => {
  const { isCartModalOpen, closeCartModal } = useCartModalContext();
  const cartItems = useAppSelector((state) => state.cartReducer.items);
  const totalPrice = useSelector(selectTotalPrice);

  // 🔹 اصلاح شده: بستن مودال با کلیک خارج از پنل
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      
      // اگر کلیک روی خود پنل مودال نبود
      // و اگر کلیک روی دکمه سبد خرید در هدر هم نبود (با استفاده از ID یا Class)
      if (!target.closest(".modal-content") && !target.closest(".cart-button-header")) {
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
    <div className={`fixed top-0 left-0 w-full h-screen z-999999 bg-dark/70 transition-opacity duration-300 ${isCartModalOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>
      <div className="flex justify-start h-full">
        <div className={`modal-content w-full max-w-[500px] h-full bg-white shadow-lg flex flex-col text-right transform transition-transform duration-300 ease-in-out ${isCartModalOpen ? "translate-x-0" : "-translate-x-full"}`}>
          
          {/* هدر مودال */}
          <div className="sticky top-0 bg-white flex items-center justify-between border-b border-gray-3 pb-7 pt-4 sm:pt-7.5 lg:pt-11 px-4 sm:px-7.5 lg:px-11">
            <h2 className="font-medium text-dark text-lg sm:text-2xl">سبد خرید</h2>
            <button onClick={closeCartModal} className="flex items-center justify-center bg-gray-2 text-dark hover:text-red p-2 rounded transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* لیست آیتم‌ها */}
          <div className="flex-1 overflow-y-auto no-scrollbar px-4 sm:px-7.5 lg:px-11 pt-4">
            {cartItems.length > 0 ? cartItems.map((item) => (
              <SingleItem key={item.id} item={item} removeItemFromCart={removeItemFromCart}/>
            )) : <EmptyCart />}
          </div>

          {/* فوتر مودال */}
          <div className="border-t border-gray-3 bg-white pt-5 pb-4 sm:pb-7.5 lg:pb-11 px-4 sm:px-7.5 lg:px-11 sticky bottom-0">
            <div className="flex items-center justify-between gap-5 mb-6">
              <p className="font-medium text-xl text-dark">جمع کل:</p>
              <p className="font-medium text-xl text-dark font-euclid">{totalPrice.toLocaleString()} ت</p>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/cart" onClick={closeCartModal} className="w-full flex justify-center font-medium text-white bg-blue py-[13px] px-6 rounded-md transition-all hover:bg-blue-dark">مشاهده سبد</Link>
              <Link href="/checkout" onClick={closeCartModal} className="w-full flex justify-center font-medium text-white bg-dark py-[13px] px-6 rounded-md transition-all hover:bg-opacity-90">پرداخت</Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CartSidebarModal;