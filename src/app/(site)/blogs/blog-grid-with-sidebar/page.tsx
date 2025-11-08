// ✅ این فایل مربوط به صفحه گرید بلاگ با سایدبار است
// در این صفحه مقالات بلاگ همراه با سایدبار نمایش داده می‌شوند.

import React from "react";
import BlogGridWithSidebar from "@/components/BlogGridWithSidebar"; // 🔑 کامپوننت گرید بلاگ با سایدبار

import { Metadata } from "next";

// 📝 متادیتا (metadata) برای سئو و مرورگر
export const metadata: Metadata = {
  title: "گرید بلاگ با سایدبار | آسو شنو", // 🏷️ عنوان فارسی
  description: "صفحه نمایش مقالات بلاگ همراه با سایدبار",
};

const BlogGridWithSidebarPage = () => {
  return (
    <main dir="rtl">
      {/* 🔑 نمایش کامپوننت گرید بلاگ با سایدبار */}
      <BlogGridWithSidebar />
    </main>
  );
};

export default BlogGridWithSidebarPage;
