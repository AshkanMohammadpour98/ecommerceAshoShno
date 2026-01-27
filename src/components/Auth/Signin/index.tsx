// components/Auth/Signin/index.tsx
"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import Link from "next/link";
import {
  EyeIcon,
  EyeSlashIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

// ================== Helpers ==================
const toEnglishDigits = (s = "") =>
  String(s)
    .replace(/[۰-۹]/g, (c) => String(c.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 1632));

const onlyDigitsEnglish = (val = "") => toEnglishDigits(val).replace(/\D/g, "");

// کوکی با انقضای پیش‌فرض 1 روز (86400 ثانیه)
// const setCookie = (name, value, { maxAgeSec = 86400 } = {}) => {
//   const secure =
//     typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
//   document.cookie = `${name}=${encodeURIComponent(
//     value
//   )}; Path=/; Max-Age=${maxAgeSec}; SameSite=Lax${secure}`;
// };


// ===================================================

export default function SigninPage() {
  const [loginMethod, setLoginMethod] = useState("phone"); // 'phone' | 'email'
  const [identifier, setIdentifier] = useState(""); // phone or email
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!identifier.trim()) {
      return {
        ok: false,
        msg: `لطفاً ${loginMethod === "phone" ? "شماره موبایل" : "ایمیل"} را وارد کنید.`,
      };
    }
    if (!password) return { ok: false, msg: "لطفاً رمز عبور را وارد کنید." };
    return { ok: true };
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  // ============= بررسی اولیه ورودی‌ها =============
  const v = validate();
  if (!v.ok) {
    Swal.fire({ icon: "error", title: "خطا در فرم", text: v.msg });
    return;
  }

  setLoading(true);

  try {
    // ============= نرمال‌سازی مقدار ورودی =============
    // اگر کاربر گوشی بزند → فقط رقم‌ها را انگلیسی و بدون فاصله تبدیل می‌کنیم
    // اگر ایمیل بزند → تبدیل به حروف کوچک
    const normalizedIdentifier =
      loginMethod === "phone"
        ? onlyDigitsEnglish(identifier)
        : identifier.trim().toLowerCase();

    // ============= ساختن payload ارسالی به API =============
    // API شما گفته فقط "یکی" از این دو باید پر باشد
    const payload = {
      phone: loginMethod === "phone" ? normalizedIdentifier : "",
      email: loginMethod === "email" ? normalizedIdentifier : "",
      password: password,
      role : "user"
    };

    console.log("🔵 PAYLOAD ارسال به API:", payload);

    // ============= ارسال درخواست POST به API =============
    const res = await fetch("/api/users/signin", {
      method: "POST",
       credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log("🟣 پاسخ API:", data);

    // ============= بررسی خطاهای سرور =============
    if (!res.ok) {
      Swal.fire({
        icon: "error",
        title: "ورود ناموفق",
        text: data.message || "اطلاعات وارد شده صحیح نیست.",
      });
      return;
    }

    // ============= نمایش پیام موفقیت =============
    Swal.fire({
      icon: "success",
      title: "ورود موفق!",
      text: "در حال انتقال به پنل کاربری...",
      timer: 1200,
      showConfirmButton: false,
    });

    // ============= ریدایرکت به پنل =============

    setTimeout(() => {
      // window.location.href = `/my-account/${data.userId || ""}`;
      window.location.href = `/my-account`;
    }, 1300);

  } catch (error) {
    // ============= خطا در وصل شدن به سرور =============
    Swal.fire({
      icon: "error",
      title: "مشکل در ارتباط",
      text: "سرور پاسخ نداد. لطفاً دوباره تلاش کنید.",
    });
  } finally {
    setLoading(false);
  }
};


  return (
    <section className="mt-10 sm:mt-11 md:mt-15 lg:mt-14 xl:mt-23 flex items-center justify-center min-h-screen bg-gray p-4">
      <div className="w-full max-w-md p-6 sm:p-8 bg-white rounded-2xl shadow-2 border border-gray-3">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-dark">ورود به حساب کاربری</h2>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* انتخاب روش ورود */}
          <div>
            <p className="block text-sm font-medium text-dark mb-2">ورود با</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLoginMethod("phone")}
                className={`w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border text-sm transition ${
                  loginMethod === "phone"
                    ? "bg-blue text-white border-blue"
                    : "bg-white border-gray-3 text-dark hover:bg-gray-1"
                }`}
              >
                <DevicePhoneMobileIcon className="w-5 h-5" />
                موبایل
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod("email")}
                className={`w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border text-sm transition ${
                  loginMethod === "email"
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
            <label htmlFor="identifier" className="block text-sm font-medium text-dark mb-1">
              {loginMethod === "phone" ? "شماره موبایل" : "آدرس ایمیل"}
            </label>
            <input
              id="identifier"
              name="identifier"
              type={loginMethod === "phone" ? "tel" : "email"}
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value) }
              dir={loginMethod === "phone" ? "ltr" : "auto"}
              placeholder={loginMethod === "phone" ? "09123456789" : "example@mail.com"}
              className="w-full rounded-md border border-gray-3 px-3 py-2 text-dark placeholder:body focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue"
            />
          </div>

          {/* رمز عبور + چشم */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-dark">
                رمز عبور
              </label>
              <Link href="/auth/ForgotPage" className="text-xs font-medium text-blue hover:underline">
                رمز عبور خود را فراموش کرده‌اید؟
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full rounded-md border border-gray-3 pr-3 pl-10 py-2 text-dark placeholder:body focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                aria-label={showPassword ? "پنهان کردن رمز" : "نمایش رمز"}
                className="absolute inset-y-0 left-3 flex items-center text-gray-6 hover:text-dark transition"
              >
                {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* دکمه ورود */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-blue text-white font-semibold hover:bg-blue-dark transition disabled:bg-blue-light disabled:cursor-not-allowed"
          >
            {loading ? "در حال بررسی..." : "ورود"}
          </button>

          {/* لینک ثبت‌نام */}
          <p className="text-center text-sm text-gray-6">
            حساب کاربری ندارید؟{" "}
            <Link href="/signup" className="font-medium text-blue hover:underline">
              ثبت‌نام کنید
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}