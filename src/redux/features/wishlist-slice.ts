// redux/features/wishlist-slice.ts
// مدیریت لیست علاقه‌مندی‌های کاربر با استفاده از Redux Toolkit شامل افزودن، حذف یک آیتم و پاک‌کردن کل لیست

// مدیریت لیست علاقه‌مندی‌ها با Redux Toolkit و پشتیبانی از LocalStorage

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// 🔹 نوع هر آیتم لیست علاقه‌مندی
export type WishListItem = {
  id: number;
  _id: any;
  title: string;
  count : number,
  price: number;
  discountedPrice: number;
  quantity: number;
  status?: string;
  hasDiscount?: boolean;
  reviews : number ;
  date? :any;
   categorie?: string;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};

// 🔹 نوع State که شامل آرایه آیتم‌هاست
type WishlistState = {
  items: WishListItem[];
};

// 🔹 کلید LocalStorage که داده‌ها با آن ذخیره می‌شوند
const LOCAL_STORAGE_KEY = "wishlistItems";

// 🔹 تابع کمکی برای گرفتن داده‌ها از LocalStorage
const loadWishlistFromLocalStorage = (): WishListItem[] => {
  try {
    const serializedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (serializedData === null) return []; // اگر چیزی ذخیره نشده بود، آرایه خالی برگردان
    return JSON.parse(serializedData) as WishListItem[];
  } catch (err) {
    console.error("Error loading wishlist from localStorage", err);
    return [];
  }
};

// 🔹 تابع کمکی برای ذخیره داده‌ها در LocalStorage
const saveWishlistToLocalStorage = (items: WishListItem[]) => {
  try {
    const serializedData = JSON.stringify(items);
    localStorage.setItem(LOCAL_STORAGE_KEY, serializedData);
  } catch (err) {
    console.error("Error saving wishlist to localStorage", err);
  }
};

// 🔹 state اولیه: بارگذاری از LocalStorage یا خالی
const initialState: WishlistState = {
  items: typeof window !== "undefined" ? loadWishlistFromLocalStorage() : [],
};

// 🔹 ایجاد Slice
export const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    // ➕ اضافه کردن آیتم به لیست علاقه‌مندی
    addItemToWishlist: (state, action: PayloadAction<WishListItem>) => {
      const item = action.payload;
      const existingItem = state.items.find((i) => i.id === item.id);

      if (existingItem) {
        existingItem.quantity += item.quantity; // اگر قبلاً بود، تعداد را زیاد کن
      } else {
        state.items.push(item); // در غیر این صورت، اضافه کن
      }

      saveWishlistToLocalStorage(state.items); // 🔄 همزمان در LocalStorage ذخیره کن
    },

    // ❌ حذف یک آیتم بر اساس id
    removeItemFromWishlist: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      saveWishlistToLocalStorage(state.items); // 🔄 بروزرسانی LocalStorage
    },

    // 🗑️ حذف همه آیتم‌ها
    removeAllItemsFromWishlist: (state) => {
      state.items = [];
      saveWishlistToLocalStorage(state.items); // 🔄 پاک کردن LocalStorage
    },
  },
});

// 🔹 خروجی گرفتن اکشن‌ها برای استفاده در کامپوننت‌ها
export const {
  addItemToWishlist,
  removeItemFromWishlist,
  removeAllItemsFromWishlist,
} = wishlistSlice.actions;

// 🔹 خروجی گرفتن reducer برای اضافه کردن به Store
export default wishlistSlice.reducer;
