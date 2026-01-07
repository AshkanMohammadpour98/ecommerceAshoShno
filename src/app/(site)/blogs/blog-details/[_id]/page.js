import React from "react";
import BlogDetails from "@/components/BlogDetails";
import { notFound } from "next/navigation";

// ✅ بخش جادویی سئو (Dynamic Metadata)
export async function generateMetadata({ params }) {
  const { _id } = await params;

  try {
    // واکشی اطلاعات مقاله برای استفاده در متا تگ‌ها
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/blogs/${_id}`);
    const blog = await res.json();

    if (!blog || !blog.title) {
      return { title: "مقاله یافت نشد | آسو شنو" };
    }

    // تمیز کردن محتوا برای توضیحات (Description) - حذف کاراکترهای اضافی و محدود کردن به 160 کاراکتر
    const shortDesc = blog.content ? blog.content.substring(0, 160).replace(/\n/g, ' ') : "";

    return {
      title: `${blog.title} | وبلاگ آسو شنو`,
      description: shortDesc,
      alternates: {
        canonical: `/blogs/blog-details/${_id}`,
      },
      openGraph: {
        title: blog.title,
        description: shortDesc,
        url: `/blogs/blog-details/${_id}`,
        siteName: 'آسو شنو',
        images: [
          {
            url: blog.img, // تصویری که در شبکه‌های اجتماعی هنگام اشتراک‌گذاری لود می‌شود
            width: 1200,
            height: 630,
          },
        ],
        locale: 'fa_IR',
        type: 'article',
        publishedTime: blog.date, // سئو برای تاریخ انتشار اهمیت زیادی دارد
      },
      twitter: {
        card: 'summary_large_image',
        title: blog.title,
        description: shortDesc,
        images: [blog.img],
      },
    };
  } catch (error) {
    return { title: "جزئیات مقاله | آسو شنو" };
  }
}

const BlogDetailsPage = async ({ params }) => {
  const { _id } = await params;

  return (
    <main dir="rtl">
      <BlogDetails _id={_id} />
    </main>
  );
};

export default BlogDetailsPage;