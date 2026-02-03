"use client";

import { useUser } from "@/app/context/UserContext";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation"; // برای هدایت کاربر بعد از خروج
import Swal from "sweetalert2"; // برای نمایش پیام تایید
import toast from "react-hot-toast"; // برای نمایش نوتیفیکیشن موفقیت
import Link from "next/link";
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import {
  XMarkIcon,
  TrashIcon,
  ShoppingCartIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
// Toast
// 🎣 هوک‌های تایپ‌شده Redux (طبق store خودت)
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { addItemToCart } from "@/redux/features/cart-slice";

// ❤️ اکشن‌های wishlist
import {
  removeItemFromWishlist,
  removeAllItemsFromWishlist,
} from "@/redux/features/wishlist-slice";

// URLS
const USERS_URL = process.env.NEXT_PUBLIC_API_USERS_URL

// ------- TYPES (بدون تغییر) -------
interface QRConfig { value: string; ecc: string; colors: { fg: string; bg: string }; }
interface QRData { id: string; name: string; config: { v: number } & QRConfig; preview: { url: string; width: number; height: number; mime: string }; dateAddQrCode: string; }
interface ProductImages { thumbnails: string[]; previews: string[]; }
interface PurchasedProduct { id: string; title: string; reviews: number; price: number; discountedPrice: number; categorie: string; date: string; imgs: ProductImages; hasDiscount: boolean; QRDatas?: QRData; }
interface UserData { _id: string; id: string; name: string; lastName: string; gender: string; role: string; dateLogin: string; phone: string; email: string; password?: string; SuggestedCategories: string[]; PurchasedProducts: PurchasedProduct[]; purchaseInvoice: { id: string; countProducts: number }[]; img: string; address: string; }
interface MyAccountClientProps { user: UserData; }
interface AddressModalProps {
  isOpen: boolean;
  closeModal: () => void;
  addressData: { recipient: string; address: string; phone: string };
  setAddressData: React.Dispatch<React.SetStateAction<{ recipient: string; address: string; phone: string }>>;
  onSave: (data: { recipient: string; address: string; phone: string }) => void;
}

type TabKey = "dashboard" | "orders" | "downloads" | "addresses" | "favrate" | "account-details";

// ------- ICONS (بدون تغییر) --------
const Icons = {
  dashboard: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>),
  orders: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>),
  downloads: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>),
  addresses: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>),
  account: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>),
  logout: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>),
  favrate: (
    <svg className="fill-current" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3.74949 2.94946C2.6435 3.45502 1.83325 4.65749 1.83325 6.0914C1.83325 7.55633 2.43273 8.68549 3.29211 9.65318C4.0004 10.4507 4.85781 11.1118 5.694 11.7564C5.89261 11.9095 6.09002 12.0617 6.28395 12.2146C6.63464 12.491 6.94747 12.7337 7.24899 12.9099C7.55068 13.0862 7.79352 13.1667 7.99992 13.1667C8.20632 13.1667 8.44916 13.0862 8.75085 12.9099C9.05237 12.7337 9.3652 12.491 9.71589 12.2146C9.90982 12.0617 10.1072 11.9095 10.3058 11.7564C11.142 11.1118 11.9994 10.4507 12.7077 9.65318C13.5671 8.68549 14.1666 7.55633 14.1666 6.0914C14.1666 4.65749 13.3563 3.45502 12.2503 2.94946C11.1759 2.45832 9.73214 2.58839 8.36016 4.01382C8.2659 4.11175 8.13584 4.16709 7.99992 4.16709C7.864 4.16709 7.73393 4.11175 7.63967 4.01382C6.26769 2.58839 4.82396 2.45832 3.74949 2.94946ZM7.99992 2.97255C6.45855 1.5935 4.73256 1.40058 3.33376 2.03998C1.85639 2.71528 0.833252 4.28336 0.833252 6.0914C0.833252 7.86842 1.57358 9.22404 2.5444 10.3172C3.32183 11.1926 4.2734 11.9253 5.1138 12.5724C5.30431 12.7191 5.48911 12.8614 5.66486 12.9999C6.00636 13.2691 6.37295 13.5562 6.74447 13.7733C7.11582 13.9903 7.53965 14.1667 7.99992 14.1667C8.46018 14.1667 8.88401 13.9903 9.25537 13.7733C9.62689 13.5562 9.99348 13.2691 10.335 12.9999C10.5107 12.8614 10.6955 12.7191 10.886 12.5724C11.7264 11.9253 12.678 11.1926 13.4554 10.3172C14.4263 9.22404 15.1666 7.86842 15.1666 6.0914C15.1666 4.28336 14.1434 2.71528 12.6661 2.03998C11.2673 1.40058 9.54129 1.5935 7.99992 2.97255Z"
      fill=""
    />
    </svg>
  )
};

/**
 * محاسبه مدت زمان عضویت کاربر از تاریخ عضویت تا امروز (شمسی)
 * @param dateLogin تاریخ عضویت به فرمت 1404/07/04
 */
const getMembershipDuration = (dateLogin: string) => {
  // تاریخ عضویت
  const start = new DateObject({
    date: dateLogin,
    format: "YYYY/MM/DD",
    calendar: persian,
    locale: persian_fa,
  });

  // تاریخ امروز شمسی
  const now = new DateObject({
    calendar: persian,
    locale: persian_fa,
  });

  // اختلاف کل روزها
  const diffDays = Math.floor((now.toUnix() - start.toUnix()) / 86400);

  // اگر کمتر از 30 روز بود
  if (diffDays < 30) {
    return `${diffDays} روز`;
  }

  // تبدیل روز به ماه و روز
  const months = Math.floor(diffDays / 30);
  const days = diffDays % 30;

  // اگر کمتر از یک سال
  if (months < 12) {
    return days === 0
      ? `${months} ماه`
      : `${months} ماه و ${days} روز`;
  }

  // اگر بیشتر از یک سال
  const years = Math.floor(months / 12);
  const remainMonths = months % 12;

  if (remainMonths === 0 && days === 0) {
    return `${years} سال`;
  }

  if (days === 0) {
    return `${years} سال و ${remainMonths} ماه`;
  }

  return `${years} سال و ${remainMonths} ماه و ${days} روز`;
};



const tabs = [
  { key: "dashboard", title: "داشبورد", icon: Icons.dashboard },
  // { key: "panel", title: "پنل", icon: Icons.dashboard },
  { key: "orders", title: "سفارش‌ها", icon: Icons.orders },
  { key: "downloads", title: "کدهای دیجیتال (QR)", icon: Icons.downloads },
  { key: "addresses", title: "آدرس‌ها", icon: Icons.addresses },
  { key: "favrate", title: "علاقه مندی ها", icon: Icons.favrate },
  { key: "account-details", title: "جزئیات حساب", icon: Icons.account },
];

// ------- MODAL COMPONENT (بدون تغییر) --------
// ------- MODAL COMPONENT (اصلاح شده) --------
const AddressModal: React.FC<AddressModalProps> = ({
  isOpen,
  closeModal,
  addressData,
  setAddressData,
  onSave
}) => {
  // 🎯 بستن مودال با کلیک خارج از محتوای آن
  const handleOutside = useCallback((e: MouseEvent) => {
    if (!(e.target as HTMLElement).closest(".modal-content")) closeModal();
  }, [closeModal]);

  useEffect(() => {
    if (isOpen) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isOpen, handleOutside]);

  // اگر مودال بسته است، چیزی رندر نشود
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm flex justify-center items-center z-99999">
      <div className="modal-content bg-white dark:bg-dark-2 p-8 rounded-xl shadow-2 w-full max-w-lg relative animate-fadeIn">

        {/* دکمه بستن */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-body hover:text-red transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-heading-6 font-bold text-dark dark:text-white mb-6">افزودن آدرس جدید</h2>

        <form onSubmit={(e) => {
          e.preventDefault();
          // 🔴 ذخیره آدرس با تابع پاس داده شده از parent
          onSave(addressData);
          closeModal();
        }}>
          <div className="space-y-4">

            {/* نام گیرنده */}
            <div>
              <label className="block text-sm font-medium text-body mb-1">نام گیرنده</label>
              <input
                type="text"
                value={addressData.recipient}
                readOnly // نام گیرنده خودکار از name است
                className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:outline-none focus:border-blue bg-gray-1"
              />
            </div>

            {/* آدرس */}
            <div>
              <label className="block text-sm font-medium text-body mb-1">آدرس کامل</label>
              <textarea
                value={addressData.address}
                onChange={(e) => setAddressData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:outline-none focus:border-blue bg-gray-1"
                rows={3}
                required
              />
            </div>

            {/* شماره تلفن */}
            <div>
              <label className="block text-sm font-medium text-body mb-1">شماره تماس</label>
              <input
                type="tel"
                value={addressData.phone}
                onChange={(e) => setAddressData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full border border-gray-3 rounded-lg px-4 py-3 focus:outline-none focus:border-blue bg-gray-1"
                required
                pattern="^09\d{9}$" // 🔹 اعتبارسنجی شماره موبایل ایران
                title="شماره موبایل باید ۰۹xxxxxxxxx باشد"
              />
            </div>
          </div>

          {/* دکمه ذخیره */}
          <button
            type="submit"
            className="bg-blue hover:bg-blue-dark text-white font-medium px-6 py-3 rounded-lg mt-6 w-full transition-colors shadow-1"
          >
            ذخیره آدرس
          </button>
        </form>
      </div>
    </div>
  );
};


// ------- MAIN COMPONENT --------
const MyAccountClient: React.FC<MyAccountClientProps> = () => {
  const user = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 🏠 State داینامیک آدرس
  const [addressData, setAddressData] = useState({
    recipient: user.name || "",
    address: user.address || "",
    phone: user.phone || "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:3000${USERS_URL}/${user._id}`);
        if (res.ok) {
          const data = await res.json();
          // اگر address نداشت، خالی میذاریم
          setAddressData({
            recipient: data.name || "",
            address: data.address || "",
            phone: data.phone || "",
          });
        }
      } catch (err) {
        console.log("خطا در دریافت اطلاعات کاربر", err);
      }
    };

    fetchUser();
  }, [user._id]);

  // 🎯 dispatch برای صدا زدن اکشن‌ها
  const dispatch = useAppDispatch();

  // ❤️ گرفتن لیست علاقه‌مندی‌ها از Redux
  // دقت کن: اسم reducer دقیقاً wishlistReducer هست (طبق store خودت)
  const wishlistItems = useAppSelector(
    (state) => state.wishlistReducer.items
  );


  // 🔔 حذف تکی با toast
  const handleRemoveItem = (id: number) => {
    dispatch(removeItemFromWishlist(id));
    toast.success("از علاقه‌مندی‌ها حذف شد");
  };

  // 🗑️ حذف همه
  const handleRemoveAll = () => {
    dispatch(removeAllItemsFromWishlist());
    toast("همه علاقه‌مندی‌ها پاک شد", {
      icon: "🗑️",
    });
  };

  // ➕ افزودن به سبد خرید
  const handleAddToCart = (item: any) => {
    dispatch(addItemToCart({ ...item, quantity: 1 }));
    toast.success("به سبد خرید اضافه شد");
  };;

  // 🔴 تابع خروج از حساب (مشابه هدر)
  const handleLogout = async () => {
    // نمایش پنجره تایید با SweetAlert2
    const result = await Swal.fire({
      title: "خروج از حساب",
      text: "آیا برای خروج از حساب کاربری اطمینان دارید؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "بله، خارج شو",
      cancelButtonText: "انصراف",
      reverseButtons: true, // برای قرار گرفتن دکمه تایید در سمت راست طبق استایل فارسی
    });

    if (result.isConfirmed) {
      try {
        // فراخوانی API خروج برای پاک کردن کوکی توکن
        const res = await fetch("/api/auth/logout");
        if (res.ok) {
          toast.success("خروج با موفقیت انجام شد");
          router.push("/"); // هدایت به صفحه اصلی
          router.refresh(); // رفرش کردن برای آپدیت شدن وضعیت هدر
        }
      } catch (error) {
        toast.error("خطا در برقراری ارتباط با سرور");
      }
    }
  };

  const formatPrice = (price: number) => price.toLocaleString();
  // 🔹 ذخیره یا ویرایش آدرس در سرور
  const handleSaveAddress = async (data: { recipient: string; address: string; phone: string }) => {
    // اگر آدرس وجود داشت ویرایش، اگر نبود ایجاد
    try {
      const res = await fetch(`${USERS_URL}/${user._id}`, {
  method: 'PUT', // ✅ بک‌اند فقط PUT قبول می‌کنه
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    address: data.address,
    phone: data.phone,
  }),
});


      if (res.ok) {
        toast.success("آدرس با موفقیت ذخیره شد");
        // 🔄 به‌روزرسانی local state
        setAddressData(data);
        router.refresh(); // رفرش برای گرفتن آدرس جدید از API
      } else {
        toast.error("خطا در ذخیره آدرس");
      }
    } catch (err) {
      toast.error("ارتباط با سرور برقرار نشد");
    }
  };

  return (
    <section className="mt-18 sm:mt-12 md:mt-12 lg:mt-15 xl:mt-25 bg-gray-1 min-h-screen py-10 px-4 md:px-6" dir="rtl">
      <div className="container mx-auto max-w-7xl">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 bg-white p-6 rounded-xl shadow-1">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-light-5 flex items-center justify-center text-blue text-2xl font-bold uppercase overflow-hidden">
              {user.img ? <img src={user.img} alt={user.name} className="w-full h-full object-cover" /> : user.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-heading-6 font-bold text-dark">سلام، {user.name} {user.lastName} 👋</h1>
              <p className="text-body text-sm mt-1">{user.email}</p>
            </div>
          </div>
          <div className="mt-4 md:mt-0 text-right md:text-left">
            <span className="inline-block bg-green-light-6 text-green-dark px-3 py-1 rounded-full text-xs font-semibold">
              {user.role === 'user' ? 'کاربر عادی' : 'مدیر'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

          {/* ---- Sidebar Navigation ---- */}
          <aside className="col-span-12 lg:col-span-3">
            <div className="bg-white rounded-xl shadow-2 overflow-hidden sticky top-4">

              <nav className="flex flex-col p-2">
                {tabs.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key as TabKey)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-lg transition-all duration-200 text-sm font-medium ${activeTab === t.key
                      ? "bg-blue text-white shadow-1"
                      : "text-body hover:bg-gray-1 hover:text-dark"
                      }`}
                  >
                    <span>{t.icon}</span>
                    {t.title}
                  </button>
                ))}
                <div className="h-px bg-gray-2 my-2 mx-4"></div>

                {/* 🔵 دکمه خروج اصلاح شده */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-lg text-red hover:bg-red-light-6 transition-all duration-200 text-sm font-medium w-full text-right"
                >
                  {Icons.logout}
                  خروج از حساب
                </button>
              </nav>
            </div>
          </aside>

          {/* ---- بقیه محتوا (بدون تغییر) ---- */}
          <div className="col-span-12 lg:col-span-9">
            <div className="bg-white rounded-xl shadow-2 p-6 md:p-8 min-h-[500px]">

              {/* DASHBOARD TAB */}
              {activeTab === "dashboard" && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="mt-2 md:mt-0 text-right md:text-left">
                    {/* PANEL */}
                    {
                      user.role === "admin" && (
                        <Link href={'/panel'} className="  border rounded-md border-blue-dark p-2 ml-3 bg-blue font-bold text-white mb-4"> ورود به پنل مدیریتی</Link>
                      )
                    }

                  </div>
                  <h2 className="text-heading-5 font-bold text-dark mb-4">داشبورد شما</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="bg-blue-light-5 p-5 rounded-xl border border-blue-light-4">
                      <span className="text-blue text-3xl font-bold block mb-1">{user.PurchasedProducts.length}</span>
                      <span className="text-body text-sm">سفارش‌های تکمیل شده</span>
                    </div>
                    <div className="bg-yellow-light-2 p-5 rounded-xl border border-yellow-light-1">
                      <span className="text-yellow-dark-2 text-3xl font-bold block mb-1">{user.purchaseInvoice.length}</span>
                      <span className="text-body text-sm">فاکتورهای پرداخت شده</span>
                    </div>
                    <div className="bg-green-light-6 p-5 rounded-xl border border-green-light-4">
                      <span className="text-green-dark text-xl font-bold block mb-1">
                        {getMembershipDuration(user.dateLogin)}
                      </span>
                      <span className="text-body text-sm">مدت عضویت در سایت</span>
                    </div>

                  </div>

                  <div className="mt-8">
                    <h3 className="text-lg font-bold text-dark mb-3">آخرین خریدها</h3>
                    {user.PurchasedProducts.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-right text-sm text-body">
                          <thead className="bg-gray-1 text-dark font-medium">
                            <tr>
                              <th className="px-4 py-3 rounded-r-lg">محصول</th>
                              <th className="px-4 py-3">تاریخ</th>
                              <th className="px-4 py-3">قیمت</th>
                              <th className="px-4 py-3 rounded-l-lg">وضعیت</th>
                            </tr>
                          </thead>
                          <tbody>
                            {user.PurchasedProducts.slice(0, 3).map((prod) => (
                              <tr key={prod.id} className="border-b border-gray-2 last:border-0">
                                <td className="px-4 py-4 font-medium text-dark">{prod.title}</td>
                                <td className="px-4 py-4">{prod.date}</td>
                                <td className="px-4 py-4">{formatPrice(prod.discountedPrice || prod.price)} $</td>
                                <td className="px-4 py-4">
                                  <span className="bg-green-light-6 text-green-dark px-2 py-1 rounded text-xs">تکمیل شده</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-body">هیچ خریدی انجام نشده است.</p>
                    )}
                  </div>
                </div>
              )}
              {/*پنل رو تو مپ زدن قرار ندادم چون فعلا ایکون مناسبی نداشتم و تستی اینجا گزاشتم */}


              {/* ORDERS TAB */}
              {activeTab === "orders" && (
                <div className="space-y-6 animate-fadeIn">
                  <h2 className="text-heading-6 font-bold text-dark mb-6">لیست سفارش‌های من</h2>
                  <div className="flex flex-col gap-4">
                    {user.PurchasedProducts.map((product) => (
                      <div key={product.id} className="flex flex-col sm:flex-row gap-5 border border-gray-2 rounded-xl p-4 hover:shadow-1 transition-all bg-white">
                        <div className="w-full sm:w-32 h-32 bg-gray-1 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                          <img src={product.imgs.thumbnails[0]} alt={product.title} className="w-full h-full object-contain hover:scale-105 transition-transform" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <h3 className="text-lg font-bold text-dark line-clamp-1">{product.title}</h3>
                              <span className="text-xs bg-blue-light-5 text-blue px-2 py-1 rounded">{product.categorie}</span>
                            </div>
                            <p className="text-sm text-body mt-2">تاریخ خرید: {product.date}</p>
                          </div>
                          <div className="flex justify-between items-end mt-4">
                            <div className="flex flex-col">
                              {product.hasDiscount && <span className="text-xs text-red line-through decoration-red">{formatPrice(product.price)} $</span>}
                              <span className="text-xl font-bold text-dark">{formatPrice(product.discountedPrice)} $</span>
                            </div>
                            <button className="text-blue text-sm font-medium hover:underline">مشاهده فاکتور</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* DOWNLOADS TAB */}
              {activeTab === "downloads" && (
                <div className="space-y-6 animate-fadeIn">
                  <h2 className="text-heading-6 font-bold text-dark mb-4">کدهای دیجیتال (QR)</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {user.PurchasedProducts.filter(p => p.QRDatas).map((product) => (
                      <div key={`qr-${product.id}`} className="border border-gray-3 rounded-xl p-5 flex flex-col items-center text-center bg-gray-1/30">
                        <h4 className="font-bold text-dark mb-2">{product.title}</h4>
                        <div className="bg-white p-3 rounded-lg shadow-1 border border-gray-2 mb-4">
                          <img src={product.QRDatas?.preview.url} alt="QR Code" className="w-40 h-40 object-contain" />
                        </div>
                        <button className="mt-4 w-full bg-blue text-white py-2 rounded-lg text-sm hover:bg-blue-dark transition-colors">دانلود تصویر QR</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ADDRESSES TAB */}

              {activeTab === "addresses" && (
                <div className="animate-fadeIn">

                  {/* Header بخش آدرس‌ها */}
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-heading-6 font-bold text-dark">آدرس‌های ثبت شده</h2>
                    <button
                      onClick={() => setIsModalOpen(true)} // باز کردن مودال
                      className="bg-green text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                    >
                      افزودن آدرس
                    </button>
                  </div>

                  {/* کارت آدرس فعلی */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-blue rounded-xl p-5 bg-blue-light-5/20 relative group">
                      {user.address && (
                        <span className="absolute top-4 left-4 bg-blue text-white text-[10px] px-2 py-0.5 rounded-full">پیش‌فرض</span>
                      )}
                      <h4 className="font-bold text-dark mb-2">منزل</h4>
                      <p className="text-body text-sm leading-relaxed mb-4">{user.address || "هنوز آدرسی ثبت نشده"}</p>
                      <p className="text-dark text-sm font-medium">{user.phone || "شماره تماس موجود نیست"}</p>
                    </div>
                  </div>

                  {/* مودال افزودن/ویرایش آدرس */}
                  <AddressModal
                    isOpen={isModalOpen}
                    closeModal={() => setIsModalOpen(false)}
                    addressData={addressData} // 🏠 state داینامیک آدرس
                    setAddressData={setAddressData}
                    onSave={handleSaveAddress} // تابع ذخیره آدرس
                  />
                </div>
              )}


              {/* favrate TAB */}
              {activeTab === "favrate" && (
                <div className="animate-fadeIn">
                  {/* 📱 Sticky Header (Mobile only) */}
                  <div className=" sticky top-0 z-20 bg-white border-b mb-3">
                    <div className="flex items-center justify-between px-2 py-3">
                      <div className="flex items-center gap-2">
                        <HeartIcon className="w-5 h-5 text-red-500" />
                        <span className="font-bold text-sm">
                          علاقه‌مندی‌ها ({wishlistItems.length})
                        </span>
                      </div>

                      {wishlistItems.length > 0 && (
                        <button
                          onClick={handleRemoveAll}
                          className="flex items-center gap-1 text-xs text-red-500"
                        >
                          <TrashIcon className="w-4 h-4" />
                          حذف همه
                        </button>
                      )}
                    </div>
                  </div>
                  {/* ---------------------------- */}
                  {/* 📱 Mobile View (Table-like) */}
                  <div className="md:hidden space-y-2">
                    {wishlistItems.map((item) => (
                      <div
                        key={item.id}
                        className="
        grid grid-cols-12 items-center gap-2
        bg-white p-2 rounded-lg shadow-sm
        transition-all duration-300
        animate-[fadeSlide_.3s_ease]
      "
                      >
                        {/* Image + title */}
                        <div className="col-span-5 flex items-center gap-2">
                          <img
                            src={item.imgs?.thumbnails?.[0]}
                            className="w-12 h-12 rounded-md object-cover"
                          />
                          <span className="text-xs line-clamp-2">
                            {item.title}
                          </span>
                        </div>

                        {/* Price */}
                        <div className="col-span-3 text-center text-xs font-bold">
                          {item.hasDiscount ? item.discountedPrice : item.price}
                        </div>

                        {/* Add to cart */}
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="col-span-2 text-green-600"
                        >
                          <ShoppingCartIcon className="w-5 h-5 mx-auto" />
                        </button>

                        {/* Remove */}
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="col-span-2 text-red-500"
                        >
                          <XMarkIcon className="w-5 h-5 mx-auto" />
                        </button>
                      </div>
                    ))}
                  </div>


                  {/* 🖥️ Desktop View */}
                  <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlistItems.map((item) => (
                      <div
                        key={item.id}
                        className="
        group relative bg-white border rounded-2xl p-4
        shadow-sm hover:shadow-xl
        transition-all duration-300
      "
                      >
                        {/* Remove */}
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="z-30 border-red-light-2 bg-red-light-5 border rounded-full p-1 absolute top-3 left-3 text-red hover:text-red hover:border-red-dark"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>

                        {/* Image */}
                        <div className="overflow-hidden rounded-xl mb-3">
                          <img
                            src={item.imgs?.thumbnails?.[0]}
                            className="h-44 w-full object-cover group-hover:scale-105 transition"
                          />
                        </div>

                        {/* Title */}
                        <h4 className="text-sm font-semibold line-clamp-2 mb-2">
                          {item.title}
                        </h4>

                        {/* Price */}
                        <div className="mb-3">
                          {item.hasDiscount ? (
                            <>
                              <span className="text-red-500 font-bold">
                                {item.discountedPrice}
                              </span>
                              <span className="line-through text-gray-400 text-sm ml-2">
                                {item.price}
                              </span>
                            </>
                          ) : (
                            <span className="font-bold">{item.price}</span>
                          )}
                        </div>

                        {/* Add to cart */}
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="
          w-full flex items-center justify-center gap-2
          bg-dark text-white text-sm py-2 rounded-xl
          hover:bg-black transition
        "
                        >
                          <ShoppingCartIcon className="w-5 h-5" />
                          افزودن به سبد
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}


              {/* ACCOUNT DETAILS TAB */}
              {activeTab === "account-details" && (
                <div className="animate-fadeIn">
                  <h2 className="text-heading-6 font-bold text-dark mb-6">ویرایش اطلاعات حساب</h2>
                  <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1"><label className="text-sm font-medium text-body">نام</label><input type="text" defaultValue={user.name} className="w-full border border-gray-3 rounded-lg px-4 py-3 bg-white" /></div>
                    <div className="space-y-1"><label className="text-sm font-medium text-body">نام خانوادگی</label><input type="text" defaultValue={user.lastName} className="w-full border border-gray-3 rounded-lg px-4 py-3 bg-white" /></div>
                    <div className="col-span-1 md:col-span-2 flex justify-end mt-4">
                      <button type="button" className="bg-blue hover:bg-blue-dark text-white px-8 py-3 rounded-lg font-medium shadow-2">ذخیره تغییرات</button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MyAccountClient;