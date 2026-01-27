// 📌 این فایل "Provider" اصلی Redux هست.
// کاربرد: کل پروژه رو داخل Provider قرار می‌ده تا همه‌ی کامپوننت‌ها بتونن به state های Redux دسترسی داشته باشن.

"use client"; // ⚡ چون داریم در Next.js (App Router) از Redux استفاده می‌کنیم باید Client Component باشه

import { store } from "./store"; // 📦 ایمپورت استور اصلی Redux
import { Provider } from "react-redux"; // 📦 Provider برای اتصال استور به ری‌اکت
import React from "react";

// 🛠️ ReduxProvider: یک کامپوننت که کل پروژه رو داخل Provider قرار می‌ده
export function ReduxProvider({ children }: { children: React.ReactNode }) {
  // console.log({store} , 'store...');
  return (
    // 🎯 کل children (یعنی همه صفحات و کامپوننت‌ها) داخل Provider قرار می‌گیرن
    <Provider store={store}>
      {children}
    </Provider>
  );
}
