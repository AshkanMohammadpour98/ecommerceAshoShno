// pages/forgot/index.jsx
"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import Link from "next/link";
import { DevicePhoneMobileIcon, EnvelopeIcon } from "@heroicons/react/24/outline";

const toEnglishDigits = (s = "") =>
  String(s)
    .replace(/[۰-۹]/g, (c) => String(c.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 1632));

const onlyDigitsEnglish = (val = "") => toEnglishDigits(val).replace(/\D/g, "");

export default function ForgotPage() {
  const [method, setMethod] = useState("phone");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (method === "phone") {
      const ph = onlyDigitsEnglish(value);
      if (!(ph.length === 11 && ph.startsWith("09"))) {
        return { ok: false, msg: "شماره موبایل معتبر نیست." };
      }
    } else {
      if (!value.trim() || !value.includes("@"))
        return { ok: false, msg: "ایمیل معتبر نیست." };
    }
    return { ok: true };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const v = validate();
    if (!v.ok) return Swal.fire({ icon: "error", text: v.msg });

    setLoading(true);

    try {
      const res = await fetch("/api/users/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: method === "phone" ? onlyDigitsEnglish(value) : "",
          email: method === "email" ? value.trim() : "",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        Swal.fire({ icon: "error", title: "خطا", text: data.error });
        setLoading(false);
        return;
      }

      Swal.fire({
        icon: "success",
        title: "ارسال شد!",
        text:
          method === "phone"
            ? "کد بازیابی برای شما ارسال شد."
            : "لینک بازیابی به ایمیل شما ارسال شد.",
      });

      // انتقال به صفحه وارد کردن کد
      window.location.href = "/forgot/verify";
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "خطای ارتباط",
        text: "ارتباط با سرور برقرار نشد.",
      });
    }

    setLoading(false);
  };

  return (
    <section className="flex items-center justify-center min-h-screen bg-gray p-4 mt-20">
      <div className="w-full max-w-md p-6 sm:p-8 bg-white rounded-2xl shadow-2 border border-gray-3">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-dark">بازیابی رمز عبور</h2>
          <p className="mt-2 text-sm text-gray-6">
            روش ارسال کد بازیابی را انتخاب کنید.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">

          {/* انتخاب روش */}
          <div>
            <p className="text-sm font-medium text-dark mb-2">بازیابی از طریق</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMethod("phone")}
                className={`w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border text-sm ${
                  method === "phone"
                    ? "bg-blue text-white border-blue"
                    : "bg-white border-gray-3 text-dark"
                }`}
              >
                <DevicePhoneMobileIcon className="w-5 h-5" />
                موبایل
              </button>

              <button
                type="button"
                onClick={() => setMethod("email")}
                className={`w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border text-sm ${
                  method === "email"
                    ? "bg-blue text-white border-blue"
                    : "bg-white border-gray-3 text-dark"
                }`}
              >
                <EnvelopeIcon className="w-5 h-5" />
                ایمیل
              </button>
            </div>
          </div>

          {/* ورودی */}
          <div>
            {method === "phone" ? (
              <input
                type="tel"
                dir="ltr"
                value={value}
                onChange={(e) => setValue(onlyDigitsEnglish(e.target.value))}
                placeholder="09123456789"
                className="w-full rounded-md border border-gray-3 px-3 py-2"
                required
              />
            ) : (
              <input
                type="email"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="example@mail.com"
                className="w-full rounded-md border border-gray-3 px-3 py-2"
                required
              />
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-blue text-white font-semibold"
          >
            {loading ? "در حال ارسال..." : "ارسال کد"}
          </button>

          <div className="text-center text-sm text-gray-6">
            بازگشت به{" "}
            <Link href="/signin" className="text-blue font-medium">
              صفحه ورود
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}
