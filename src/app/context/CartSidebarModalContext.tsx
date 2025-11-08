"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

// 🔹 تعریف نوع کانتکست
interface CartModalContextType {
  isCartModalOpen: boolean;
  openCartModal: () => void;
  closeCartModal: () => void;
}

// 🔹 ایجاد کانتکست با مقدار اولیه undefined
const CartModalContext = createContext<CartModalContextType | undefined>(
  undefined
);

// 🔹 hook برای دسترسی آسان به کانتکست
export const useCartModalContext = () => {
  const context = useContext(CartModalContext);
  if (!context) {
    throw new Error(
      "useCartModalContext must be used within a CartModalProvider"
    );
  }
  return context;
};

// 🔹 تایپ props برای Provider
interface CartModalProviderProps {
  children: ReactNode;
}

// 🔹 کامپوننت Provider
export const CartModalProvider = ({ children }: CartModalProviderProps) => {
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);

  const openCartModal = () => setIsCartModalOpen(true);
  const closeCartModal = () => setIsCartModalOpen(false);

  return (
    <CartModalContext.Provider
      value={{ isCartModalOpen, openCartModal, closeCartModal }}
    >
      {children}
    </CartModalContext.Provider>
  );
};
