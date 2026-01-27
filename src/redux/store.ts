// redux/store.ts
// 📌 این فایل "Store" یا مرکز اصلی مدیریت State با Redux Toolkit است
// کاربرد: همه‌ی Slice ها (سبد خرید، لیست علاقه‌مندی، جزئیات محصول و ...) در اینجا به هم متصل می‌شوند
// این فایل مانند یک "مغز مرکزی" عمل می‌کند که تمام داده‌های برنامه را مدیریت می‌کند

import { configureStore } from "@reduxjs/toolkit";

// 📦 ایمپورت کردن Reducer های مختلف که با createSlice ساختیم
// هر کدام از این reducer ها یک بخش خاص از state برنامه را مدیریت می‌کنند
import quickViewReducer from "./features/quickView-slice";
import cartReducer from "./features/cart-slice";
import wishlistReducer from "./features/wishlist-slice";
import productDetailsReducer from "./features/product-details";

// 🎣 ایمپورت هوک‌ها و تایپ‌های مورد نیاز برای TypeScript
import { TypedUseSelectorHook, useSelector, useDispatch } from "react-redux";

// 🛠️ ساخت Store اصلی با ترکیب همه‌ی Reducer ها
// این Store مانند یک پایگاه داده سمت کلاینت است که تمام state برنامه را نگه می‌دارد
export const store = configureStore({
  reducer: {
    quickViewReducer,       // 👁️ مدیریت حالت "نمایش سریع محصول" (Quick View Modal)
    cartReducer,            // 🛒 مدیریت سبد خرید (افزودن، حذف، آپدیت محصولات)
    wishlistReducer,        // ❤️ مدیریت لیست علاقه‌مندی‌ها (Wishlist)
    productDetailsReducer,  // 📦 مدیریت جزئیات محصول (رنگ، سایز، تصاویر و ...)
  },
  
  // ⚙️ تنظیمات اضافی (اختیاری)
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // در صورت استفاده از Date یا Function در state
    }),
  
  // 🔧 فعال‌سازی DevTools فقط در محیط Development
  devTools: process.env.NODE_ENV !== "production",
});

// 📌 تعریف Type های TypeScript برای استفاده در کل پروژه

// 🎯 RootState: نوع کامل State برنامه (شامل تمام reducer ها)
// این Type به ما کمک می‌کند تا با IntelliSense دقیقاً بدونیم چه property هایی در state داریم
export type RootState = ReturnType<typeof store.getState>;

// 🎯 AppDispatch: نوع Dispatch برای فراخوانی Action ها
// این Type اطمینان می‌دهد که فقط Action های معتبر را dispatch کنیم
export type AppDispatch = typeof store.dispatch;

// 🎣 هوک‌های سفارشی با Type Safety برای استفاده در کامپوننت‌ها

// ✅ useAppSelector: جایگزین تایپ‌شده برای useSelector
// استفاده: const cartItems = useAppSelector(state => state.cartReducer.items)
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// ✅ useAppDispatch: جایگزین تایپ‌شده برای useDispatch
// استفاده: const dispatch = useAppDispatch()
export const useAppDispatch = () => useDispatch<AppDispatch>();