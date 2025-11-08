"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

// 🔹 تعریف نوع کانتکست
interface PreviewSliderType {
  isModalPreviewOpen: boolean;
  openPreviewModal: () => void;
  closePreviewModal: () => void;
}

// 🔹 ایجاد کانتکست با مقدار اولیه undefined
const PreviewSliderContext = createContext<PreviewSliderType | undefined>(
  undefined
);

// 🔹 hook برای دسترسی به کانتکست
export const usePreviewSlider = () => {
  const context = useContext(PreviewSliderContext);
  if (!context) {
    throw new Error(
      "usePreviewSlider must be used within a PreviewSliderProvider"
    );
  }
  return context;
};

// 🔹 تایپ props برای Provider
interface PreviewSliderProviderProps {
  children: ReactNode;
}

// 🔹 کامپوننت Provider
export const PreviewSliderProvider = ({ children }: PreviewSliderProviderProps) => {
  const [isModalPreviewOpen, setIsModalOpen] = useState(false);

  const openPreviewModal = () => setIsModalOpen(true);
  const closePreviewModal = () => setIsModalOpen(false);

  return (
    <PreviewSliderContext.Provider
      value={{ isModalPreviewOpen, openPreviewModal, closePreviewModal }}
    >
      {children}
    </PreviewSliderContext.Provider>
  );
};
