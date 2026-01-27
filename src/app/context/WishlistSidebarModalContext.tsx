// app/context/WishlistSidebarModalProvider

"use client";

import { createContext, useContext, useState } from "react";

const WishlistModalContext = createContext<any>(null);

export const WishlistSidebarModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);

  const toggleWishlistModal = () => {
    setIsWishlistModalOpen((prev) => !prev);
  };

  return (
    <WishlistModalContext.Provider value={{ isWishlistModalOpen, toggleWishlistModal }}>
      {children}
    </WishlistModalContext.Provider>
  );
};

export const useWishlistModalContext = () => useContext(WishlistModalContext);
