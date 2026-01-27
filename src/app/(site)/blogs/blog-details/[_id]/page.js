import React from "react";
import BlogDetails from "@/components/BlogDetails";

// ثابت‌ها را از محیط سیستم می‌گیریم
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const BLOGS_URL = process.env.NEXT_PUBLIC_API_BLOGS_URL;

export async function generateMetadata({ params }) {
  const { _id } = await params;

  try {
    // واکشی اطلاعات مقاله با استفاده از _id
    const res = await fetch(`${BASE_URL}${BLOGS_URL}/${_id}`, {
      cache: "no-store", // اطمینان از تازگی اطلاعات سئو
    });
    
    if (!res.ok) return { title: "مقاله یافت نشد | آسو شنو" };
    
    const blog = await res.json();

    if (!blog || !blog.title) {
      return { title: "مقاله یافت نشد | آسو شنو" };
    }

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
        images: [{ url: blog.img, width: 1200, height: 630 }],
        locale: 'fa_IR',
        type: 'article',
        publishedTime: blog.date,
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