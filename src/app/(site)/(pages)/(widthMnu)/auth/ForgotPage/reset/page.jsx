// pages/forgot/reset.jsx
"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    if (password.length < 6)
      return Swal.fire({
        icon: "error",
        text: "رمز عبور باید حداقل ۶ کاراکتر باشد.",
      });

    if (password !== password2)
      return Swal.fire({ icon: "error", text: "رمزها یکسان نیستند." });

    setLoading(true);

    try {
      const res = await fetch("/api/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        Swal.fire({ icon: "error", title: "خطا", text: data.error });
        setLoading(false);
        return;
      }

      Swal.fire({
        icon: "success",
        title: "رمز تغییر کرد!",
        text: "اکنون میتوانید وارد شوید.",
      });

      window.location.href = "/signin";
    } catch {
      Swal.fire({ icon: "error", text: "ارتباط با سرور برقرار نشد." });
    }

    setLoading(false);
  };

  return (
    <section className="flex items-center justify-center min-h-screen bg-gray p-4 mt-20">
      <div className="w-full max-w-md p-6 sm:p-8 bg-white rounded-2xl shadow-2 border border-gray-3">
        <h2 className="text-2xl font-bold text-center text-dark">
          ساخت رمز عبور جدید
        </h2>

        <form onSubmit={submit} className="mt-8 space-y-6">

          {/* رمز جدید */}
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              className="w-full border border-gray-3 rounded-md pr-3 pl-10 py-2"
              placeholder="رمز جدید"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute left-3 inset-y-0 flex items-center"
              onClick={() => setShow(!show)}
            >
              {show ? <EyeIcon className="w-5 h-5" /> : <EyeSlashIcon className="w-5 h-5" />}
            </button>
          </div>

          {/* تکرار */}
          <div className="relative">
            <input
              type={show2 ? "text" : "password"}
              className="w-full border border-gray-3 rounded-md pr-3 pl-10 py-2"
              placeholder="تکرار رمز"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
            />
            <button
              type="button"
              className="absolute left-3 inset-y-0 flex items-center"
              onClick={() => setShow2(!show2)}
            >
              {show2 ? <EyeIcon className="w-5 h-5" /> : <EyeSlashIcon className="w-5 h-5" />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-blue text-white font-semibold"
            disabled={loading}
          >
            {loading ? "در حال ذخیره..." : "ذخیره رمز جدید"}
          </button>
        </form>
      </div>
    </section>
  );
}
