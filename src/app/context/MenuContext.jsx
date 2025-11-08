"use client";
import { createContext, useContext, useState } from "react";

const MenuContext = createContext();

export function MenuProvider({ children }) {
  const [valueMenu, setValueMenu] = useState("addProudt");

  return (
    <MenuContext.Provider value={{ valueMenu, setValueMenu }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  return useContext(MenuContext);
}