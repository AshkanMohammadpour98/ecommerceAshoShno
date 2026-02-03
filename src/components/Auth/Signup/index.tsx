"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  EyeIcon,
  EyeSlashIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

// ================== Helpers ==================
const toEnglishDigits = (s = "") =>
  String(s)
    .replace(/[۰-۹]/g, (c) => String(c.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 1632));

const getNowJalali = () =>
  toEnglishDigits(
    new DateObject({ calendar: persian, locale: persian_fa }).format("YYYY/MM/DD")
  );

const onlyDigitsEnglish = (val = "") => toEnglishDigits(val).replace(/\D/g, "");
// ===================================================

export default function RegisterPage() {
  const router = useRouter();

  const [registerMethod, setRegisterMethod] = useState("phone"); // 'phone' | 'email'
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    passwordConfirm: "",
    gender: "male", // ⭐ پیش‌فرض male
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // ⭐ آپدیت state فرم
  const handleChange = (e) => {
    // console.log(e.target.value);
    
    const { name, value } = e.target;
    if (name === "phone") {
      setFormData((prev) => ({ ...prev, phone: onlyDigitsEnglish(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ⭐ اعتبارسنجی فرم
  const validate = () => {
    if (!formData.name.trim() || !formData.lastName.trim()) {
      return { ok: false, msg: "نام و نام خانوادگی الزامی است." };
    }
    if (registerMethod === "phone") {
      const phone = onlyDigitsEnglish(formData.phone);
      if (!(phone.length === 11 && phone.startsWith("09"))) {
        return { ok: false, msg: "شماره تلفن نامعتبر است (مثال: 09303456789)." };
      }
    } else {
      if (!formData.email.trim() || !formData.email.includes("@")) {
        return { ok: false, msg: "ایمیل نامعتبر است." };
      }
    }
    if (formData.password.length < 6) {
      return { ok: false, msg: "رمز عبور باید حداقل ۶ کاراکتر باشد." };
    }
    if (formData.password !== formData.passwordConfirm) {
      return { ok: false, msg: "رمزهای عبور با یکدیگر مطابقت ندارند." };
    }
    return { ok: true };
  };

  // ⭐ ارسال فرم
 // ⭐ ارسال فرم
const handleSubmit = async (e) => {
  e.preventDefault();

  // ⛔ جلوگیری از کلیک چندباره
  if (loading) return;

  // ⭐ اعتبارسنجی اولیه
  const validation = validate();
  if (!validation.ok) {
    Swal.fire({ icon: "error", title: "خطا در فرم", text: validation.msg });
    return;
  }

  // ⭐ اگر email و phone هر دو خالی هستند → خطا
  if (!formData.phone.trim() && !formData.email.trim()) {
    Swal.fire({
      icon: "error",
      title: "خطا",
      text: "حداقل یکی از موارد ایمیل یا شماره موبایل باید وارد شود.",
    });
    return;
  }

  setLoading(true);

  // ⭐ بدنه‌ای که قرار است ارسال شود
  const payload = {
    id: Date.now().toString(),
    name: formData.name.trim(),
    lastName: formData.lastName.trim(),
    dateLogin: getNowJalali(),
    phone: registerMethod === "phone" ? onlyDigitsEnglish(formData.phone) : "",
    email: registerMethod === "email" ? formData.email.trim() : "",
    password: formData.password,
    gender: formData.gender || "male",
    role: "user",
    SuggestedCategories: [],
    PurchasedProducts: [],
    purchaseInvoice: [],
    img: "",
    address: "",
  };

  try {
    // =============================
    // ⭐ 1) قبل از ارسال اصلی، چک تکراری نبودن
    // =============================
    const checkRes = await fetch("/api/users/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: payload.phone || null,
        email: payload.email || null,
      }),
    });

    const checkData = await checkRes.json();

    if (checkData.exists) {
      Swal.fire({
        icon: "error",
        title: "ثبت‌نام ناموفق",
        text:
          checkData.field === "email"
            ? "این ایمیل قبلاً استفاده شده است."
            : "این شماره موبایل قبلاً ثبت شده است.",
      });

      setLoading(false);
      return;
    }

    // =============================
    // ⭐ 2) ارسال به API اصلی ثبت‌نام
    // =============================
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      Swal.fire({
        icon: "error",
        title: "خطا در ثبت‌نام",
        text: data?.error || "مشکلی پیش آمد، لطفاً دوباره تلاش کنید.",
      });
      setLoading(false);
      return;
    }

    // =============================
    // ⭐ 3) موفقیت
    // =============================
    Swal.fire({
      icon: "success",
      title: "ثبت‌نام موفق!",
      text: "حساب کاربری شما ایجاد شد.",
      timer: 2000,
      showConfirmButton: false,
    });

    router.push("/signin");
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "خطای ارتباط",
      text: "اتصال به سرور برقرار نشد.",
    });
  } finally {
    setLoading(false);
  }
};


  return (
    <section className="mt-24 sm:mt-11 md:mt-15 lg:mt-20 xl:mt-35 flex items-center justify-center min-h-screen bg-gray p-4 ">
      <div className="w-full max-w-md p-6 sm:p-8 bg-white rounded-2xl shadow-2 border border-gray-3">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-dark">ایجاد حساب کاربری جدید</h2>
          <p className="mt-2 text-sm text-gray-6">اطلاعات خود را برای ثبت‌نام وارد کنید.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* نام و نام خانوادگی */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-dark mb-1">
                نام
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-3 px-3 py-2 text-dark placeholder:body focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-dark mb-1">
                نام خانوادگی
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-3 px-3 py-2 text-dark placeholder:body focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue"
              />
            </div>
          </div>

          {/* ⭐ انتخاب جنسیت با Radio Button */}
          <div>
            <p className="block text-sm font-medium text-dark mb-2">جنسیت (اختیاری)</p>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === "male"}
                  onChange={handleChange}
                  className="accent-blue"
                />
                مرد
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === "female"}
                  onChange={handleChange}
                  className="accent-blue"
                />
                زن
              </label>
            </div>
            <p className="text-xs text-gray-6 mt-1">اگر انتخاب نکنید، پیش‌فرض مرد است.</p>
          </div>

          {/* ثبت‌نام با موبایل یا ایمیل */}
          <div>
            <p className="block text-sm font-medium text-dark mb-2">ثبت‌نام با</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRegisterMethod("phone")}
                className={`w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border text-sm transition ${
                  registerMethod === "phone"
                    ? "bg-blue text-white border-blue"
                    : "bg-white border-gray-3 text-dark hover:bg-gray-1"
                }`}
              >
                <DevicePhoneMobileIcon className="w-5 h-5" />
                موبایل
              </button>
              <button
                type="button"
                onClick={() => setRegisterMethod("email")}
                className={`w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border text-sm transition ${
                  registerMethod === "email"
                    ? "bg-blue text-white border-blue"
                    : "bg-white border-gray-3 text-dark hover:bg-gray-1"
                }`}
              >
                <EnvelopeIcon className="w-5 h-5" />
                ایمیل
              </button>
            </div>
          </div>

          {/* فیلد موبایل یا ایمیل */}
          <div>
            {registerMethod === "phone" ? (
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-dark mb-1">
                  شماره موبایل
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  dir="ltr"
                  placeholder="09123456789"
                  className="w-full rounded-md border border-gray-3 px-3 py-2 text-dark placeholder:body focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue"
                />
              </div>
            ) : (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-dark mb-1">
                  آدرس ایمیل
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@mail.com"
                  className="w-full rounded-md border border-gray-3 px-3 py-2 text-dark placeholder:body focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue"
                />
              </div>
            )}
          </div>

          {/* رمز عبور */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-dark mb-1">
              رمز عبور
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                className="w-full rounded-md border border-gray-3 pr-3 pl-10 py-2 text-dark placeholder:body focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                aria-label={showPassword ? "پنهان کردن رمز" : "نمایش رمز"}
                className="absolute inset-y-0 left-3 flex items-center text-gray-6 hover:text-dark transition"
              >
                {showPassword ? <EyeIcon className="w-5 h-5" /> : <EyeSlashIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* تکرار رمز عبور */}
          <div>
            <label htmlFor="passwordConfirm" className="block text-sm font-medium text-dark mb-1">
              تکرار رمز عبور
            </label>
            <div className="relative">
              <input
                id="passwordConfirm"
                name="passwordConfirm"
                type={showPasswordConfirm ? "text" : "password"}
                required
                value={formData.passwordConfirm}
                onChange={handleChange}
                autoComplete="new-password"
                className="w-full rounded-md border border-gray-3 pr-3 pl-10 py-2 text-dark placeholder:body focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue"
              />
              <button
                type="button"
                onClick={() => setShowPasswordConfirm((p) => !p)}
                aria-label={showPasswordConfirm ? "پنهان کردن رمز" : "نمایش رمز"}
                className="absolute inset-y-0 left-3 flex items-center text-gray-6 hover:text-dark transition"
              >
                {showPasswordConfirm ? <EyeIcon className="w-5 h-5" /> : <EyeSlashIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* دکمه ثبت‌نام */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-blue text-white font-semibold hover:bg-blue-dark transition disabled:bg-blue-light disabled:cursor-not-allowed"
            >
              {loading ? "در حال ارسال..." : "ایجاد حساب"}
            </button>
          </div>

          <div className="text-center text-sm text-gray-6">
            قبلا حساب کاربری ایجاد کرده‌اید؟{" "}
            <Link href="/signin" className="font-medium text-blue hover:underline">
              وارد شوید
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}
