// src/app/my-account/[userId].js
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  HomeIcon,
  ShoppingBagIcon,
  ArrowDownTrayIcon,
  MapPinIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  // --- آیکن‌های جدید برای نمایش/مخفی‌سازی رمز ---
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

// SweetAlert2 برای هشدارهای بدون دکمه و تایمردار
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

/* --- گارد احراز هویت (جدید) ---
   - این کمک‌تابع‌ها برای خواندن/حذف کوکی auth استفاده می‌شوند.
   - کوکی شما با setCookie(... { maxAgeSec: 86400 }) و Path=/ و SameSite=Lax ساخته می‌شود.
*/
const AUTH_COOKIE_NAME = "auth";

function getCookieValue(name) {
  if (typeof document === "undefined") return null;
  const raw = document.cookie.split("; ").find((r) => r.startsWith(`${name}=`));
  if (!raw) return null;
  const val = raw.substring(name.length + 1);
  try { return decodeURIComponent(val); } catch { return val; }
}

function deleteCookie(name) {
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=; Path=/; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${secure}`;
}

// ابزارهای کمکی
const toToman = (num) => {
  if (typeof num !== "number") return "۰ تومان";
  try {
    return `${num.toLocaleString("fa-IR")} تومان`;
  } catch {
    return `${num} تومان`;
  }
};

const getEmailFromRegister = (arr = []) => {
  const found = arr.find((x) => x.email);
  return found?.email || "";
};
const getPhoneFromRegister = (arr = []) => {
  const found = arr.find((x) => x.phone);
  return found?.phone || "";
};

// --- کمکی جدید: گرفتن رمز از registerWith ---
// توضیح: طبق نمونه دیتایی که فرستادی، رمز داخل آرایه registerWith به شکل { password: "..." } ذخیره شده.
const getPasswordFromRegister = (arr = []) => {
  const found = arr.find((x) => x.password);
  return found?.password || "";
};

// --- داده‌های تب‌ها با Heroicons ---
const tabsData = [
  { title: "dashboard", label: "داشبورد", icon: <HomeIcon className="w-5 h-5" /> },
  { title: "orders", label: "سفارش‌ها", icon: <ShoppingBagIcon className="w-5 h-5" /> },
  { title: "downloads", label: "دانلودها", icon: <ArrowDownTrayIcon className="w-5 h-5" /> },
  { title: "addresses", label: "آدرس‌ها", icon: <MapPinIcon className="w-5 h-5" /> },
  { title: "account-details", label: "جزئیات اکانت", icon: <UserCircleIcon className="w-5 h-5" /> },
];

// --- مودال ویرایش ---
const AddressModal = ({ isOpen, closeModal, user, onSave, saving }) => {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });

  useEffect(() => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
    });
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (isOpen && !event.target.closest(".modal-content")) {
        closeModal();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, closeModal]);

  const handleChange = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(formData);
    closeModal();
  };

  if (!isOpen) return null;

  return (
    <div className=" fixed top-0 left-0 overflow-y-auto no-scrollbar w-full h-screen sm:py-20 xl:py-40 2xl:py-50 bg-dark/70 sm:px-8 px-4 py-5 z-99999">
      <div className="flex items-center justify-center">
        <div className="w-full max-w-[900px] rounded-xl shadow-3 bg-white p-7.5 relative modal-content">
          <button
            onClick={closeModal}
            aria-label="بستن مودال"
            className="absolute top-0 right-0 sm:top-3 sm:right-3 flex items-center justify-center w-10 h-10 rounded-full ease-in duration-150 bg-meta text-body hover:text-dark"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-5">
            <PencilSquareIcon className="w-5 h-5 text-blue" />
            <h3 className="text-custom-xl font-semibold">ویرایش اطلاعات</h3>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
              <div className="w-full">
                <label htmlFor="name" className="block mb-2.5">نام و نام خانوادگی</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  placeholder="مثلا: متین لیطانی"
                  value={formData.name}
                  onChange={handleChange}
                  className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                />
              </div>
              <div className="w-full">
                <label htmlFor="email" className="block mb-2.5">ایمیل</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                />
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
              <div className="w-full">
                <label htmlFor="phone" className="block mb-2.5">شماره تلفن</label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  placeholder="0912xxxxxxx"
                  value={formData.phone}
                  onChange={handleChange}
                  className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                />
              </div>
              <div className="w-full">
                <label htmlFor="address" className="block mb-2.5">آدرس</label>
                <input
                  type="text"
                  name="address"
                  id="address"
                  placeholder="تهران، ..."
                  value={formData.address}
                  onChange={handleChange}
                  className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-70"
              >
                <CheckCircleIcon className="w-5 h-5" />
                {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex items-center gap-2 font-medium text-blue bg-blue/10 py-3 px-7 rounded-md ease-out.duration-200 hover:bg-blue/20"
              >
                انصراف
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// --- کامپوننت اصلی ---
const MyAccount = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userData, setUserData] = useState(null); // داده نگاشته شده برای UI
  const [rawApi, setRawApi] = useState(null); // داده خام API برای ذخیره تغییرات
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- state های مربوط به فرم تغییر رمز عبور ---
  // نکته: این state‌ها فقط برای UI تب "جزئیات حساب" استفاده می‌شوند.
  const [passForm, setPassForm] = useState({ current: "", next: "", confirm: "" });
  const [passShow, setPassShow] = useState({ current: false, next: false, confirm: false });
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState("");

  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const routeUserId =
    (params && (params.userId || params.id)) ||
    (searchParams ? searchParams.get("userId") || searchParams.get("id") : null);

  // --- گارد احراز هویت (جدید) ---
  // توضیحات:
  // 1) کوکی auth خوانده می‌شود: { id, password, rool }
  // 2) id کوکی باید با userId انتهای آدرس برابر باشد.
  // 3) پسورد داخل کوکی با پسورد موجود در API (registerWith) تطبیق داده می‌شود.
  // 4) اگر هر کدام غلط بود => نمایش هشدار SweetAlert2 و سپس ریدایرکت به /signin
  const [authChecked, setAuthChecked] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  // نمایش هشدار و ریدایرکت پس از پایان تایمر
  const warnAndRedirect = (msg) => {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "warning",
      title: msg || "آیدی یا رمز عبور شما با این اکانت مطابقت ندارد.",
      showConfirmButton: false,
      timer: 1800,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener("mouseenter", Swal.stopTimer);
        toast.addEventListener("mouseleave", Swal.resumeTimer);
      },
      willClose: () => router.replace("/signin"),
    });
  };

  // اطلاع به Header و تب‌های دیگر که Auth تغییر کرده (برای sync فوری Navbar)
  const notifyAuthChanged = (type = "logout") => {
    try {
      window.dispatchEvent(new Event("auth:changed"));
    } catch {}
    try {
      if ("BroadcastChannel" in window) {
        const bc = new BroadcastChannel("auth");
        bc.postMessage({ type, at: Date.now() });
        bc.close();
      }
    } catch {}
    try {
      localStorage.setItem("auth:broadcast", String(Date.now()));
    } catch {}
  };

  useEffect(() => {
    let ignore = false;

    async function checkAuth() {
      try {
        // نبودن userId در آدرس => عدم دسترسی
        if (!routeUserId) {
          throw new Error("NO_USER_ID_IN_ROUTE");
        }

        // خواندن و پارس کوکی
        const cookieStr = getCookieValue(AUTH_COOKIE_NAME);
        if (!cookieStr) throw new Error("NO_COOKIE");

        let cred = null;
        try {
          cred = JSON.parse(cookieStr); // { id, password, rool }
        } catch {
          throw new Error("BAD_COOKIE_JSON");
        }

        // اعتبار اولیه کوکی: وجود id/password/rool و برابر بودن id با آدرس
        if (!cred?.id || !cred?.password || !cred?.rool || cred.id !== routeUserId) {
          throw new Error("INVALID_COOKIE_OR_ID_MISMATCH");
        }

        // فراخوانی API برای گرفتن رمز واقعی و تطبیق با کوکی
        const res = await fetch(
          `http://localhost:3000/usersData/${encodeURIComponent(cred.id)}`,
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error("USER_NOT_FOUND");
        const data = await res.json();

        const passFromServer = Array.isArray(data?.registerWith)
          ? data.registerWith.find((x) => typeof x?.password === "string")?.password
          : undefined;

        if (!passFromServer || passFromServer !== cred.password) {
          throw new Error("PASSWORD_MISMATCH");
        }

        if (!ignore) {
          setAuthorized(true);
          setAuthChecked(true);
        }
      } catch (e) {
        if (!ignore) {
          setAuthorized(false);
          setAuthChecked(true);

          // فقط برای عدم تطبیق آیدی/پسورد یا نبودن کاربر، پیام هشدار نشان بده
          const msg = e?.message || "";
          if (
            msg === "INVALID_COOKIE_OR_ID_MISMATCH" ||
            msg === "PASSWORD_MISMATCH"
          ) {
            warnAndRedirect("آیدی یا رمز عبور شما با این اکانت مطابقت ندارد.");
          } else if (msg === "USER_NOT_FOUND") {
            warnAndRedirect("کاربری با این آیدی یافت نشد.");
          } else {
            // سایر حالات (بدون کوکی/بدون userId/بدفرمت) => ریدایرکت بی‌صدا
            router.replace("/signin");
          }
        }
      }
    }

    checkAuth();
    return () => {
      ignore = true;
    };
  }, [routeUserId, router]);

  // نگاشت داده API به ساختار UI
  const mapApiToUi = (apiData) => {
    const fullName = [apiData?.name, apiData?.lastName].filter(Boolean).join(" ").trim() || "کاربر مهمان";
    const email = getEmailFromRegister(apiData?.registerWith);
    const phone = getPhoneFromRegister(apiData?.registerWith);

    const products = Array.isArray(apiData?.PurchasedProducts) ? apiData.PurchasedProducts : [];
    const totalPrice = products.reduce((sum, p) => {
      const unit = typeof p?.discountedPrice === "number" ? p.discountedPrice : (typeof p?.price === "number" ? p.price : 0);
      const qty = typeof p?.qty === "number" ? p.qty : 1;
      return sum + unit * qty;
    }, 0);

    const orders =
      Array.isArray(apiData?.purchaseInvoice) && apiData.purchaseInvoice.length > 0
        ? apiData.purchaseInvoice.map((inv, idx) => ({
            id: inv.id || `INV-${idx + 1}`,
            date: products?.[0]?.date || apiData?.dateLogin || "—",
            status: "تکمیل شده",
            total: toToman(totalPrice),
            countProducts: inv.countProducts || products.length || 0,
          }))
        : products.length
        ? [
            {
              id: products?.[0]?.id || "ORD-1",
              date: products?.[0]?.date || apiData?.dateLogin || "—",
              status: "تکمیل شده",
              total: toToman(totalPrice),
              countProducts: products.length,
            },
          ]
        : [];

    return {
      id: apiData?.id || routeUserId || "—",
      name: fullName || "کاربر مهمان",
      email: email || "user@example.com",
      phone: phone || "09123456789",
      address: apiData?.address || "تهران، میدان آزادی، خیابان آزادی، پلاک ۱",
      dateLogin: apiData?.dateLogin || "—",
      suggestedCategories: apiData?.SuggestedCategories || [],
      purchasedProducts: products,
      orders,
      img:
        typeof apiData?.img === "string" && apiData.img
          ? apiData.img
          : "https://via.placeholder.com/150",
    };
  };

  /* --- نکته مهم: گرفتن داده کاربر فقط پس از تایید احراز هویت ---
     - قبلاً روی routeUserId fetch می‌شد؛ حالا به authorized وابسته است.
     - باعث می‌شود تا قبل از تایید، دیتایی لود نشود و محافظت واقعی باشد.
  */
  useEffect(() => {
    const fetchUserData = async () => {
      if (!authorized || !routeUserId) return; // فقط اگر مجاز شد

      setLoading(true);
      setError(null);

      const ctrl = new AbortController();
      try {
        const res = await fetch(`http://localhost:3000/usersData/${routeUserId}`, { signal: ctrl.signal });
        if (!res.ok) throw new Error("خطا در برقراری ارتباط با سرور یا کاربر یافت نشد");

        const apiData = await res.json();

        setRawApi(apiData);
        setUserData(mapApiToUi(apiData));
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err?.message || "مشکلی پیش آمد");
        // fallback دیتای پیش‌فرض در صورت خطا
        const fallback = {
          id: routeUserId,
          name: "کاربر نمونه",
          email: "test@example.com",
          phone: "09000000000",
          address: "آدرس پیش‌فرض در زمان خطا",
          dateLogin: "1403/01/01",
          suggestedCategories: ["Phone", "Desktop"],
          purchasedProducts: [],
          orders: [{ id: "err-01", date: "1403/01/01", status: "نامشخص", total: toToman(0), countProducts: 0 }],
          img: "https://via.placeholder.com/150",
        };
        setUserData(fallback);
      } finally {
        setLoading(false);
      }
      return () => ctrl.abort();
    };

    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorized, routeUserId]);

  const handleSaveChanges = async (updatedUser) => {
    // آماده‌سازی داده‌ها برای UI
    setUserData((prev) => ({ ...prev, ...updatedUser }));

    // آماده‌سازی PATCH به API (در صورت وجود API واقعی)
    try {
      setSaving(true);

      // ساخت payload جزئی برای PATCH بر اساس rawApi
      const patch = {};

      // نام را به name/lastName بشکنیم
      if (typeof updatedUser?.name === "string") {
        const parts = updatedUser.name.trim().split(" ");
        patch.name = parts[0] || rawApi?.name || "";
        patch.lastName = parts.slice(1).join(" ") || rawApi?.lastName || "";
      }

      // ایمیل/تلفن => registerWith
      const newRegisterWith = Array.isArray(rawApi?.registerWith) ? [...rawApi.registerWith] : [];
      const currentEmail = getEmailFromRegister(newRegisterWith);
      const currentPhone = getPhoneFromRegister(newRegisterWith);

      if (updatedUser?.email && updatedUser.email !== currentEmail) {
        const idx = newRegisterWith.findIndex((x) => x.email);
        if (idx > -1) newRegisterWith[idx] = { email: updatedUser.email };
        else newRegisterWith.push({ email: updatedUser.email });
      }

      if (updatedUser?.phone && updatedUser.phone !== currentPhone) {
        const idx = newRegisterWith.findIndex((x) => x.phone);
        if (idx > -1) newRegisterWith[idx] = { phone: updatedUser.phone };
        else newRegisterWith.push({ phone: updatedUser.phone });
      }

      if (newRegisterWith.length) patch.registerWith = newRegisterWith;

      // آدرس را اضافه/آپدیت کنیم حتی اگر در API اولیه نبود
      if (typeof updatedUser?.address === "string") {
        patch.address = updatedUser.address;
      }

      try {
        const res = await fetch(`http://localhost:3000/usersData/${routeUserId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });

        if (!res.ok) {
          console.warn("PATCH failed, UI state updated locally");
        } else {
          const newRaw = await res.json();
          setRawApi(newRaw);
          setUserData((prev) => mapApiToUi(newRaw));
        }
      } catch (err) {
        console.warn("PATCH request error:", err?.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const logout = () => {
    //حذف کوکی 
    deleteCookie(AUTH_COOKIE_NAME);

    // اطلاع به Navbar و تب‌های دیگر
    notifyAuthChanged("logout");

    // پیام خروج موفقیت‌آمیز و سپس ریدایرکت
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "با موفقیت خارج شدید",
      showConfirmButton: false,
      timer: 1600,
      timerProgressBar: true,
      willClose: () => {
        router.replace("/signin");
      },
    });
  };

  // --- اعتبارسنجی رمز جدید (ساده و آموزشی) ---
  // نکته: می‌تونید قواعد رو سخت‌گیرانه‌تر کنید.
  const validateNewPassword = (pwd) => {
    if (!pwd || pwd.length < 6) return "رمز جدید باید حداقل ۶ کاراکتر باشد.";
    if (/\s/.test(pwd)) return "رمز عبور نباید فاصله (Space) داشته باشد.";
    const hasDigit = /\d/.test(pwd);
    const hasLetter = /[A-Za-z]/.test(pwd);
    if (!hasDigit || !hasLetter) return "رمز جدید باید ترکیبی از حروف و اعداد باشد.";
    return "";
  };

  // --- هندلر تغییر رمز عبور ---
  // توضیح: این تابع، رمز فعلی را با مقدار داخل rawApi.registerWith مقایسه می‌کند.
  // سپس در صورت صحت، مقدار password را در registerWith به‌روزرسانی و PATCH می‌کند.
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassError("");
    setPassSuccess("");

    // ۱) بررسی وجود داده خام API
    if (!rawApi) {
      setPassError("داده کاربر یافت نشد. لطفا صفحه را رفرش کنید.");
      return;
    }

    // ۲) اعتبارسنجی ورودی‌ها
    const { current, next, confirm } = passForm;
    if (!current || !next || !confirm) {
      setPassError("لطفا همه فیلدها را تکمیل کنید.");
      return;
    }
    const currentPassword = getPasswordFromRegister(rawApi?.registerWith);
    if (!currentPassword) {
      // اگر کاربر با رمز وارد نشده (یا رمز در دیتای فعلی نیست)
      setPassError("رمز فعلی در سیستم ثبت نشده است.");
      return;
    }
    if (current !== currentPassword) {
      setPassError("رمز فعلی نادرست است.");
      return;
    }
    if (next !== confirm) {
      setPassError("رمز جدید و تکرار آن یکسان نیستند.");
      return;
    }
    if (next === current) {
      setPassError("رمز جدید نباید با رمز فعلی یکسان باشد.");
      return;
    }
    const ruleError = validateNewPassword(next);
    if (ruleError) {
      setPassError(ruleError);
      return;
    }

    // ۳) ساخت payload برای PATCH
    try {
      setPassLoading(true);

      // کپی registerWith و اعمال رمز جدید
      const newRegisterWith = Array.isArray(rawApi?.registerWith) ? [...rawApi.registerWith] : [];
      const passIdx = newRegisterWith.findIndex((x) => x.password);
      if (passIdx > -1) newRegisterWith[passIdx] = { password: next };
      else newRegisterWith.push({ password: next });

      const patch = { registerWith: newRegisterWith };

      const res = await fetch(`http://localhost:3000/usersData/${routeUserId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });

      if (!res.ok) {
        setPassError("خطا در ذخیره رمز جدید. لطفا دوباره تلاش کنید.");
        return;
      }

      // ۴) به‌روزرسانی state خام و پاک کردن فرم
      const newRaw = await res.json();
      setRawApi(newRaw);
      setPassSuccess("رمز عبور با موفقیت تغییر کرد.");
      setPassForm({ current: "", next: "", confirm: "" });
    } catch (err) {
      console.error("Change password error:", err);
      setPassError("مشکلی در تغییر رمز عبور پیش آمد.");
    } finally {
      setPassLoading(false);
    }
  };

  // --- لودر گارد: تا وقتی احراز هویت تایید نشده یا غیرمجاز است، چیزی از صفحه را نده ---
  if (!authChecked || !authorized) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="flex items-center gap-3 text-gray-600">
          <span className="h-6 w-6 rounded-full border-2 border-gray-300 border-t-blue animate-spin" />
          <span>در حال بررسی دسترسی...</span>
        </div>
      </div>
    );
  }

  if (loading) return <div className="text-center p-10">در حال بارگذاری اطلاعات...</div>;

  if (error && !userData) return <div className="text-center p-10 text-red">خطا: {error}</div>;

  const renderTabContent = () => {
    if (!userData) return null;

    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-heading-6 font-bold mb-2">داشبورد</h2>
              <p className="text-custom-lg">
                سلام <strong className="text-blue">{userData.name}</strong>! خوش آمدید.
              </p>
               ثبت نام شما در: <span className="font-medium">{userData.dateLogin || "—"}</span>
            </div>

            {!!userData.suggestedCategories?.length && (
              <div>
                <p className="mb-2.font-medium">دسته‌بندی‌های پیشنهادی برای شما:</p>
                <div className="flex flex-wrap gap-2">
                  {userData.suggestedCategories.map((c) => (
                    <span key={c} className="bg-blue/10 text-blue px-3 py-1 rounded-full text-sm">{c}</span>
                  ))}
                </div>
              </div>
            )}

            {userData.purchasedProducts?.length ? (
              <div>
                <p className="mb-3 font-medium">آخرین خریدها:</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userData.purchasedProducts.slice(0, 6).map((p) => {
                    const price = typeof p?.discountedPrice === "number" ? p.discountedPrice : p?.price || 0;
                    const thumb = p?.imgs?.thumbnails?.[0] || p?.imgs?.previews?.[0] || "/images/placeholder.png";
                    return (
                      <div key={p?.id} className="border border-gray-3 rounded-lg p-3 bg-gray-1">
                        <img src={thumb} alt={p?.title || "product"} className="w-full h-28 object-contain rounded mb-2 bg-white" />
                        <div className="space-y-1">
                          <p className="font-medium line-clamp-2">{p?.title || "محصول"}</p>
                          <p className="text-dark-4">{p?.categorie || "—"}</p>
                          <p className="font-semibold">{toToman(price)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-dark-4">فعلا محصولی خریداری نشده است.</p>
            )}
          </div>
        );

      case "orders":
        return (
          <div>
            <h2 className="text-heading-6 font-bold mb-4">سفارش‌ها</h2>
            {userData.orders?.length ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-3 rounded-md">
                  <thead>
                    <tr className="bg-gray-2">
                      <th className="py-3 px-4 border-b border-gray-3 text-right">شماره سفارش</th>
                      <th className="py-3 px-4 border-b border-gray-3 text-right">تاریخ</th>
                      <th className="py-3 px-4 border-b.border-gray-3 text-right">وضعیت</th>
                      <th className="py-3 px-4 border-b border-gray-3 text-right">تعداد آیتم</th>
                      <th className="py-3 px-4 border-b border-gray-3 text-right">مجموع</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userData.orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-1">
                        <td className="py-3 px-4 border-b border-gray-3">{order.id}</td>
                        <td className="py-3 px-4 border-b border-gray-3">{order.date}</td>
                        <td className="py-3 px-4 border-b border-gray-3">{order.status}</td>
                        <td className="py-3 px-4 border-b border-gray-3">{order.countProducts ?? "—"}</td>
                        <td className="py-3 px-4 border-b border-gray-3">{order.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-dark-4">شما تاکنون هیچ سفارشی ثبت نکرده‌اید.</p>
            )}
          </div>
        );

      case "downloads":
        return (
          <div>
            <h2 className="text-heading-6 font-bold mb-4">دانلودها</h2>
            <p className="text-dark-4">شما هیچ فایل قابل دانلودی ندارید.</p>
          </div>
        );

      case "addresses":
        return (
          <div>
            <h2 className="text-heading-6 font-bold mb-4">آدرس‌ها</h2>
            <p className="mb-4 text-dark-4">آدرس زیر برای ارسال سفارشات استفاده می‌شود.</p>
            <div className="p-4 border border-gray-3 rounded-md bg-gray-1">
              <p className="font-semibold">{userData.name}</p>
              <p className="mt-1">{userData.address}</p>
              <p className="mt-1">تلفن: {userData.phone}</p>
              <p className="mt-1">ایمیل: {userData.email}</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 inline-flex items-center gap-2 font-medium text-white bg-blue py-2.5 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark"
            >
              <PencilSquareIcon className="w-5 h-5" />
              ویرایش آدرس/اطلاعات
            </button>
          </div>
        );

      case "account-details":
        return (
          <div>
            <h2 className="text-heading-6 font-bold mb-4">جزئیات حساب کاربری</h2>
            <div className="space-y-4">
              <div>
                <label className="font-semibold">شناسه کاربر:</label>
                <p className="p-2 border border-gray-3 rounded-md bg-gray-1 mt-1">{userData.id}</p>
              </div>
              <div>
                <label className="font-semibold">نام و نام خانوادگی:</label>
                <p className="p-2 border border-gray-3 rounded-md bg-gray-1 mt-1">{userData.name}</p>
              </div>
              <div>
                <label className="font-semibold">ایمیل:</label>
                <p className="p-2 border border-gray-3 rounded-md bg-gray-1 mt-1">{userData.email}</p>
              </div>
              <div>
                <label className="font-semibold">تلفن:</label>
                <p className="p-2 border border-gray-3 rounded-md bg-gray-1 mt-1">{userData.phone}</p>
              </div>
              <div>
                <label className="font-semibold">تاریخ ثبت نام:</label>
                <p className="p-2 border border-gray-3 rounded-md bg-gray-1 mt-1">{userData.dateLogin || "—"}</p>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-6 inline-flex items-center gap-2 font-medium text-white.bg-blue py-2.5 px-6 rounded-md ease-out.duration-200 hover:bg-blue-dark"
            >
              <PencilSquareIcon className="w-5 h-5" />
              ویرایش اطلاعات
            </button>

            {/* --- فرم تغییر رمز عبور (جدید) --- */}
            {/* توضیح آموزشی:
               - این فرم در تب "جزئیات حساب" نمایش داده می‌شود.
               - رمز فعلی با مقدار موجود در rawApi.registerWith چک می‌شود (سمت کلاینت).
               - در نهایت با PATCH، فیلد password داخل registerWith به‌روزرسانی می‌گردد.
            */}
            <div className="mt-10 p-5 border border-gray-3 rounded-xl bg-gray-1">
              <h3 className="font-semibold text-custom-lg mb-4">تغییر رمز عبور</h3>

              {/* پیام‌های خطا/موفقیت */}
              {passError ? (
                <div className="mb-4 p-3 rounded-md border border-red/20 bg-red/10 text-red">
                  {passError}
                </div>
              ) : null}
              {passSuccess ? (
                <div className="mb-4 p-3 rounded-md border border-green/20 bg-green/10 text-green inline-flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5" />
                  <span>{passSuccess}</span>
                </div>
              ) : null}

              <form onSubmit={handleChangePassword} className="space-y-4">
                {/* رمز فعلی */}
                <div>
                  <label htmlFor="current-pass" className="block mb-2.5 font-medium">رمز فعلی</label>
                  <div className="relative">
                    <input
                      id="current-pass"
                      type={passShow.current ? "text" : "password"}
                      value={passForm.current}
                      onChange={(e) => setPassForm((p) => ({ ...p, current: e.target.value }))}
                      placeholder="رمز فعلی را وارد کنید"
                      autoComplete="current-password"
                      className="rounded-md border border-gray-3 bg-white placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setPassShow((s) => ({ ...s, current: !s.current }))}
                      className="absolute inset-y-0 right-0 px-3 text-dark-5 hover:text-dark"
                      aria-label={passShow.current ? "مخفی کردن رمز" : "نمایش رمز"}
                      tabIndex={-1}
                    >
                      {passShow.current ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* رمز جدید */}
                <div>
                  <label htmlFor="new-pass" className="block mb-2.5 font-medium">رمز جدید</label>
                  <div className="relative">
                    <input
                      id="new-pass"
                      type={passShow.next ? "text" : "password"}
                      value={passForm.next}
                      onChange={(e) => setPassForm((p) => ({ ...p, next: e.target.value }))}
                      placeholder="رمز جدید را وارد کنید"
                      autoComplete="new-password"
                      className="rounded-md border border-gray-3 bg-white placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setPassShow((s) => ({ ...s, next: !s.next }))}
                      className="absolute inset-y-0 right-0 px-3 text-dark-5 hover:text-dark"
                      aria-label={passShow.next ? "مخفی کردن رمز" : "نمایش رمز"}
                      tabIndex={-1}
                    >
                      {passShow.next ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-dark-4 text-sm mt-1">حداقل ۶ کاراکتر، شامل حروف و اعداد، بدون فاصله.</p>
                </div>

                {/* تکرار رمز جدید */}
                <div>
                  <label htmlFor="confirm-pass" className="block mb-2.5 font-medium">تکرار رمز جدید</label>
                  <div className="relative">
                    <input
                      id="confirm-pass"
                      type={passShow.confirm ? "text" : "password"}
                      value={passForm.confirm}
                      onChange={(e) => setPassForm((p) => ({ ...p, confirm: e.target.value }))}
                      placeholder="تکرار رمز جدید"
                      autoComplete="new-password"
                      className="rounded-md border border-gray-3 bg-white placeholder:text-dark-5 w-full py-2.5 px-5 outline-none.duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setPassShow((s) => ({ ...s, confirm: !s.confirm }))}
                      className="absolute inset-y-0 right-0 px-3 text-dark-5 hover:text-dark"
                      aria-label={passShow.confirm ? "مخفی کردن رمز" : "نمایش رمز"}
                      tabIndex={-1}
                    >
                      {passShow.confirm ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={passLoading}
                    className="inline-flex items-center gap-2 font-medium text-white bg-blue py-2.5 px-6 rounded-md ease-out.duration-200 hover:bg-blue-dark disabled:opacity-70"
                  >
                    <CheckCircleIcon className="w-5 h-5" />
                    {passLoading ? "در حال تغییر رمز..." : "ثبت رمز جدید"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <AddressModal
        isOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
        user={userData}
        onSave={handleSaveChanges}
        saving={saving}
      />

      <section className="mt-50 py-10 md:py-16 lg:py-20">
        <div className="container">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="w-full lg:w-1/3 xl:w-1/4">
              <div className="bg-white p-5 rounded-xl shadow-3">
                <div className="flex items-center gap-4 mb-6">
                  <img src={userData.img} alt="آواتار کاربر" className="w-16 h-16 rounded-full object-cover bg-gray-2" />
                  <div>
                    <h3 className="font-bold text-custom-xl">{userData.name}</h3>
                    <p className="text-custom-sm text-dark-4">{userData.email}</p>
                  </div>
                </div>
                <nav>
                  <ul>
                    {tabsData.map((tab) => (
                      <li key={tab.title}>
                        <button
                          onClick={() => setActiveTab(tab.title)}
                          className={`w-full text-right flex items-center gap-3 p-3 rounded-md mb-2 capitalize duration-200 ease-in-out ${
                            activeTab === tab.title ? "bg-blue text-white" : "hover:bg-gray-2"
                          }`}
                        >
                          {tab.icon}
                          <span>{tab.label}</span>
                        </button>
                      </li>
                    ))}
                    <li>
                      <button
                        onClick={logout}
                        className="w-full text-right flex items-center gap-3 p-3 rounded-md mb-2 capitalize duration-200 ease-in-out hover:bg-gray-2 text-red"
                      >
                        <ArrowRightOnRectangleIcon className="w-5 h-5" />
                        <span>خروج</span>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </aside>

            {/* Content */}
            <main className="w-full lg:w-2/3 xl:w-3/4">
              <div className="bg-white p-6 md:p-8 rounded-xl shadow-3">
                {renderTabContent()}
              </div>
            </main>
          </div>
        </div>
      </section>
    </>
  );
};

export default MyAccount;