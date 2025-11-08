// ✅ این فایل مربوط به صفحه ورود (Signin) است
// این صفحه برای ورود کاربران به حساب کاربری استفاده می‌شود.

import React from "react";
import Signin from "@/components/Auth/Signin"; // 🔑 کامپوننت فرم ورود

// 📝 متادیتا (metadata) برای سئو و مرورگر
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "ورود به حساب کاربری | آسو شنو", // 🏷️ عنوان فارسی
  description: "صفحه ورود کاربران به حساب کاربری",
};

const SigninPage = () => {
  return (
    <main dir="rtl">
      {/* 🔑 نمایش فرم ورود */}
      <Signin />
    </main>
  );
};

export default SigninPage;
