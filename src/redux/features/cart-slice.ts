// redux/features/cart-slice.ts
// 📌 این فایل مربوط به مدیریت سبد خرید (Cart) با استفاده از Redux Toolkit است.
// در اینجا اکشن‌ها و سلکتورها + مدیریت تخفیف کوپن اضافه شده‌اند.
// + پشتیبانی کامل از LocalStorage مشابه wishlist-slice

import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
// import { showToast } from "./toast-slice";


// 🎯 نوع آیتم‌های داخل سبد
type CartItem = {
  id: number;           // آیدی محصول front id
  _id:  string;           // آیدی محصول database id
  title: string;        // نام محصول
  price: number;        // قیمت اصلی
  discountedPrice: number; // قیمت بعد از تخفیف محصول
  quantity: number;     //    افزایش تعداد
  count: number;     //     محصول تعداد
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};

// 🎫 نوع کوپن ذخیره شده
type Coupon = {
  code: string;   // کد کوپن
  amount: number; // مبلغ تخفیف (واحد پولی)
};

// 📦 استیت اولیه + فیلدهای تخفیف کوپن
type InitialState = {
  items: CartItem[];
  discount: number;              // مبلغ تخفیف اعمال‌شده
  appliedCoupon: Coupon | null; // اطلاعات کوپن اعمال‌شده
};


// 🔹 کلید ذخیره در LocalStorage
const LOCAL_STORAGE_KEY = "cartState";

// 🔹 گرفتن داده از LocalStorage
const loadCartFromLocalStorage = (): InitialState => {
  try {
    const serializedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!serializedData) {
      return { items: [], discount: 0, appliedCoupon: null };
    }
    return JSON.parse(serializedData) as InitialState;
  } catch (err) {
    console.error("Error loading cart from localStorage", err);
    return { items: [], discount: 0, appliedCoupon: null };
  }
};

// 🔹 ذخیره داده در LocalStorage
const saveCartToLocalStorage = (state: InitialState) => {
  try {
    const serializedData = JSON.stringify(state);
    localStorage.setItem(LOCAL_STORAGE_KEY, serializedData);
  } catch (err) {
    console.error("Error saving cart to localStorage", err);
  }
};

// 🔹 مقدار اولیه state با پشتیبانی از SSR (Next.js safe)
const initialState: InitialState =
  typeof window !== "undefined"
    ? loadCartFromLocalStorage()
    : { items: [], discount: 0, appliedCoupon: null };

// 🛒 ایجاد Slice مربوط به سبد خرید
export const cart = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // ➕ افزودن محصول
 addItemToCart: (state, action: PayloadAction<CartItem>) => {
  const { id, _id, title, price, quantity, discountedPrice, imgs, count } =
    action.payload;

  const existingItem = state.items.find((item) => item.id === id);

  // 🧠 سقف مجاز خرید = موجودی واقعی محصول
  const maxAllowed = count;

  if (existingItem) {
    // اگر محصول قبلا داخل سبد بوده

    const newQuantity = existingItem.quantity + quantity;

    if (newQuantity > maxAllowed) {
      // ❗ اگر بیشتر از موجودی شد → محدودش کن
      existingItem.quantity = maxAllowed;

      console.warn(
        `حداکثر موجودی این محصول ${maxAllowed} عدد است — همان مقدار به سبد اضافه شد`
      );
//       dispatch(showToast({
//   message: `حداکثر موجودی این محصول ${maxAllowed} عدد است — همان مقدار به سبد اضافه شد`,
//   type: "error",
// }));

    } else {
      existingItem.quantity = newQuantity;
    }
  } else {
    // اگر محصول جدید بود

    const finalQuantity =
      quantity > maxAllowed ? maxAllowed : quantity;

    state.items.push({
      id,
      _id,
      title,
      price,
      quantity: finalQuantity,
      discountedPrice,
      imgs,
      count,
    });

    if (quantity > maxAllowed) {
      console.warn(
        `شما ${quantity} عدد انتخاب کردید ولی موجودی ${maxAllowed} عدد است — همان ${maxAllowed} عدد به سبد اضافه شد`
      );
    }
  }

  saveCartToLocalStorage(state);
},


    
    // ❌ حذف یک محصول خاص
    removeItemFromCart: (state, action: PayloadAction<number>) => {
      const itemId = action.payload;
      state.items = state.items.filter((item) => item.id !== itemId);

      // 🔄 بروزرسانی LocalStorage
      saveCartToLocalStorage(state);
    },

    // 🔄 تغییر تعداد محصول
   updateCartItemQuantity: (
  state,
  action: PayloadAction<{ id: number; _id: any; quantity: number }>
) => {
  const { id, quantity } = action.payload;
  const existingItem = state.items.find((item) => item.id === id);

  if (existingItem) {
    const maxAllowed = existingItem.count;

    // 🧠 جلوگیری از over-order
    if (quantity > maxAllowed) {
      existingItem.quantity = maxAllowed;

      console.warn(
        `حداکثر موجودی این محصول ${maxAllowed} عدد است`
      );
    } else {
      existingItem.quantity = quantity;
    }
  }

  saveCartToLocalStorage(state);
},


    // 🧹 خالی کردن سبد + پاک کردن کوپن
    removeAllItemsFromCart: (state) => {
      state.items = [];
      state.discount = 0;
      state.appliedCoupon = null;

      // 🔄 پاکسازی LocalStorage
      saveCartToLocalStorage(state);
    },

    // ✅ اعمال کوپن (مبلغ تخفیف ثابت)
    applyCoupon: (
      state,
      action: PayloadAction<{ code: string; amount: number }>
    ) => {
      state.discount = action.payload.amount;
      state.appliedCoupon = {
        code: action.payload.code,
        amount: action.payload.amount,
      };

      // 🔄 ذخیره کوپن در LocalStorage
      saveCartToLocalStorage(state);
    },

    // 🚫 حذف/غیرفعال‌سازی کوپن
    removeCoupon: (state) => {
      state.discount = 0;
      state.appliedCoupon = null;

      // 🔄 بروزرسانی LocalStorage
      saveCartToLocalStorage(state);
    },
  },
});

// 🔍 سلکتورهای داده
export const selectCartItems = (state: RootState) =>
  state.cartReducer.items;

// 💰 مجموع قیمت کالاها (قبل از کوپن)
export const selectTotalPrice = createSelector(
  [selectCartItems],
  (items) =>
    items.reduce(
      (total, item) =>
        total +
        (item.discountedPrice
          ? item.discountedPrice
          : item.price) *
          item.quantity,
      0
    )
);

// 💳 مبلغ تخفیف کوپن
export const selectDiscount = (state: RootState) =>
  state.cartReducer.discount;

// 🧾 کوپن اعمال شده
export const selectAppliedCoupon = (state: RootState) =>
  state.cartReducer.appliedCoupon;

// ✅ مبلغ قابل پرداخت = مجموع - تخفیف (حداقل صفر)
export const selectPayableTotal = createSelector(
  [selectTotalPrice, selectDiscount],
  (total, discount) => Math.max(0, total - discount)
);

// 📤 اکسپورت اکشن‌ها
export const {
  addItemToCart,
  removeItemFromCart,
  updateCartItemQuantity,
  removeAllItemsFromCart,
  applyCoupon,
  removeCoupon,
} = cart.actions;

// 📤 ریدوسر اصلی
export default cart.reducer;
