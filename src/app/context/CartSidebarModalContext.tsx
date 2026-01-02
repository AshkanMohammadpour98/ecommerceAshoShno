"use client";
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";

// 🔹 تعریف ساختار داده‌ای کانتکست
interface CartModalContextType {
  isCartModalOpen: boolean;
  openCartModal: () => void;
  closeCartModal: () => void;
  toggleCartModal: () => void;
}

const CartModalContext = createContext<CartModalContextType | undefined>(undefined);

export const useCartModalContext = () => {
  const context = useContext(CartModalContext);
  if (!context) {
    throw new Error("useCartModalContext must be used within a CartModalProvider");
  }
  return context;
};

export const CartModalProvider = ({ children }: { children: ReactNode }) => {
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);

  // استفاده از useCallback برای جلوگیری از رندرهای بیهوده و تداخل منطقی
  const openCartModal = useCallback(() => setIsCartModalOpen(true), []);
  const closeCartModal = useCallback(() => setIsCartModalOpen(false), []);
  const toggleCartModal = useCallback(() => {
    setIsCartModalOpen((prev) => !prev);
  }, []);

  // 🔹 قفل کردن اسکرول بدنه سایت هنگام باز بودن سبد خرید برای UX بهتر
  useEffect(() => {
    if (isCartModalOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = "0px"; // جلوگیری از پرش صفحه در ویندوز
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isCartModalOpen]);

  return (
    <CartModalContext.Provider
      value={{ isCartModalOpen, openCartModal, closeCartModal, toggleCartModal }}
    >
      {children}
    </CartModalContext.Provider>
  );
};