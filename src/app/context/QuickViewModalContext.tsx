"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

// 🔹 تعریف نوع کانتکست
interface ModalContextType {
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

// 🔹 ایجاد کانتکست با مقدار اولیه undefined
const ModalContext = createContext<ModalContextType | undefined>(undefined);

// 🔹 hook برای دسترسی به کانتکست
export const useModalContext = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModalContext must be used within a ModalProvider");
  }
  return context;
};

// 🔹 تایپ props برای Provider
interface ModalProviderProps {
  children: ReactNode;
}

// 🔹 کامپوننت Provider
export const ModalProvider = ({ children }: ModalProviderProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <ModalContext.Provider value={{ isModalOpen, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
};
