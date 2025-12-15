// pages/forgot/verify.jsx
"use client";

import { useState } from "react";
import Swal from "sweetalert2";

export default function VerifyCodePage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (code.trim().length < 4)
      return Swal.fire({ icon: "error", text: "کد صحیح نیست." });

    setLoading(true);

    try {
      const res = await fetch("/api/users/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (!res.ok) {
        Swal.fire({ icon: "error", title: "خطا", text: data.error });
        setLoading(false);
        return;
      }

      Swal.fire({
        icon: "success",
        title: "تایید شد!",
        text: "اکنون رمز جدید بسازید.",
      });

      window.location.href = "/forgot/reset";
    } catch {
      Swal.fire({ icon: "error", text: "عدم اتصال به سرور" });
    }

    setLoading(false);
  };

  return (
    <section className="flex items-center justify-center min-h-screen bg-gray p-4 mt-20">
      <div className="w-full max-w-md p-6 sm:p-8 bg-white rounded-2xl shadow-2 border border-gray-3">
        <h2 className="text-2xl font-bold text-center text-dark">
          تایید کد ارسال شده
        </h2>
        <p className="text-gray-6 text-center mt-2 text-sm">
          کد چهار رقمی را وارد کنید.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-6">
          <input
            type="text"
            dir="ltr"
            maxLength="6"
            className="w-full border border-gray-3 rounded-md px-3 py-2 text-dark"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-blue text-white font-semibold"
          >
            {loading ? "در حال بررسی..." : "تایید کد"}
          </button>
        </form>
      </div>
    </section>
  );
}
