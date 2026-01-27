// ✅ این فایل مربوط به صفحه جزئیات بلاگ است
// در این صفحه جزئیات یک مطلب یا مقاله بلاگ نمایش داده می‌شود.

// import React from "react";
// import BlogDetails from "@/components/BlogDetails"; // 🔑 کامپوننت جزئیات بلاگ

import { Metadata } from "next";

// 📝 متادیتا (metadata) برای سئو و مرورگر
export const metadata: Metadata = {
  title: "جزئیات بلاگ | آسو شنو", // 🏷️ عنوان فارسی
  description: "صفحه نمایش جزئیات یک مقاله بلاگ",
};

const BlogDetailsPage = () => {
  return (
    <main dir="rtl">
      {/* 🔑 نمایش کامپوننت جزئیات بلاگ */}
      {/* <BlogDetails /> */}
    </main>
  );
};

export default BlogDetailsPage;
