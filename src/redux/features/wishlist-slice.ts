// مدیریت لیست علاقه‌مندی‌های کاربر با استفاده از Redux Toolkit شامل افزودن، حذف یک آیتم و پاک‌کردن کل لیست

import { createSlice, PayloadAction } from "@reduxjs/toolkit"; 
// از Redux Toolkit برای ساخت slice و تعریف اکشن‌ها/ردیوسرها استفاده می‌کنیم
// PayloadAction برای تعریف نوع داده‌ای است که همراه هر اکشن ارسال می‌شود

// شکل اولیه state که در این slice ذخیره می‌شود
type InitialState = {
  items: WishListItem[]; // آرایه‌ای از آیتم‌های لیست علاقه‌مندی
};

// ساختار هر آیتم لیست علاقه‌مندی
type WishListItem = {
  id: number;                   // شناسه یکتا محصول
  title: string;                 // عنوان محصول
  price: number;                 // قیمت اصلی محصول
  discountedPrice: number;       // قیمت تخفیف خورده
  quantity: number;              // تعداد این محصول در wishlist
  status?: string;               // وضعیت محصول (مثلاً available)
  imgs?: {                       // تصاویر محصول
    thumbnails: string[];        // عکس‌های کوچک
    previews: string[];          // عکس‌های بزرگ/پیش‌نمایش
  };
};

// state اولیه که در ابتدای برنامه خالی است
const initialState: InitialState = {
  items: [],
};

// ساخت slice مربوط به wishlist
export const wishlist = createSlice({
  name: "wishlist",         // نام slice برای شناسایی در store
  initialState,             // state اولیه
  reducers: {               // اکشن‌ها و ردیوسرهای تغییر state

    // اکشن: افزودن آیتم به لیست علاقه‌مندی‌ها
    addItemToWishlist: (state, action: PayloadAction<WishListItem>) => {
      // جداکردن مقادیر از payload اکشن
      const { id, title, price, quantity, imgs, discountedPrice, status } =
        action.payload;
        
      // بررسی اینکه آیا محصول از قبل در لیست وجود دارد؟
      const existingItem = state.items.find((item) => item.id === id);

      if (existingItem) {
        // اگر قبلاً وجود دارد، فقط تعدادش را زیاد کن
        existingItem.quantity += quantity;
      } else {
        // در غیر این‌صورت، محصول را به لیست اضافه کن
        state.items.push({
          id,
          title,
          price,
          quantity,
          imgs,
          discountedPrice,
          status,
        });
      }
    },

    // اکشن: حذف یک آیتم از لیست علاقه‌مندی‌ها بر اساس id
    removeItemFromWishlist: (state, action: PayloadAction<number>) => {
      const itemId = action.payload;
      // فیلترکردن برای حذف آیتم با id داده‌شده
      state.items = state.items.filter((item) => item.id !== itemId);
    },

    // اکشن: پاک کردن کل لیست علاقه‌مندی
    removeAllItemsFromWishlist: (state) => {
      state.items = [];
    },
  },
});

// خروجی گرفتن اکشن‌ها برای استفاده در کامپوننت‌های دیگر
export const {
  addItemToWishlist,
  removeItemFromWishlist,
  removeAllItemsFromWishlist,
} = wishlist.actions;

// خروجی گرفتن reducer برای افزودن به store
export default wishlist.reducer;
