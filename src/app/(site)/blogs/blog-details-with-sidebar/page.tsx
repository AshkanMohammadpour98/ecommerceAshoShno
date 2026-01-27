// ✅ این فایل مربوط به صفحه جزئیات بلاگ همراه با سایدبار است
// در این صفحه جزئیات یک مقاله بلاگ به همراه سایدبار نمایش داده می‌شود.

import React from "react";
// import BlogDetailsWithSidebar from "@/components/BlogDetailsWithSidebar"; // 🔑 کامپوننت جزئیات بلاگ با سایدبار

import { Metadata } from "next";

// 📝 متادیتا (metadata) برای سئو و مرورگر
export const metadata: Metadata = {
  title: "جزئیات بلاگ با سایدبار | آسو شنو", // 🏷️ عنوان فارسی
  description: "صفحه نمایش جزئیات یک مقاله بلاگ همراه با سایدبار",
};

const BlogDetailsWithSidebarPage = () => {
  return (
    <main dir="rtl">
      {/* 🔑 نمایش کامپوننت جزئیات بلاگ همراه با سایدبار */}
      {/* <BlogDetailsWithSidebar /> */}
    </main>
  );
};

export default BlogDetailsWithSidebarPage;
