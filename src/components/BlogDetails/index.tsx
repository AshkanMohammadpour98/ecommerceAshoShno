import React from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import { notFound } from "next/navigation";

const BlogDetails = async ({ _id }) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/blogs/${_id}`, {
      cache: "no-store",
    });

    if (!res.ok) return notFound();

    // 🔴 نکته مهم: اینجا خروجی مستقیما خودِ مقاله است
    const blog = await res.json(); 

    // چک کنید که فیلدی مثل title وجود داشته باشد تا مطمئن شویم دیتا درست است
    if (!blog || !blog.title) {
      return notFound();
    }

    return (
      <>
        <Breadcrumb title={blog.title} pages={["وبلاگ", blog.categorie]} />

        <section dir="rtl" className="overflow-hidden py-20 bg-gray-2 text-right">
          <div className="max-w-[750px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            
            <div className="rounded-[10px] overflow-hidden mb-7.5 shadow-sm bg-white">
              <Image
                className="rounded-[10px] w-full h-auto object-cover"
                src={blog.img || "/images/blog/blog-details-01.jpg"}
                alt={blog.title}
                width={750}
                height={477}
                priority
              />
            </div>

            <div>
              <span className="flex items-center gap-3 mb-4 text-gray-600 text-sm">
                <span>{blog.date}</span>
                <span className="block w-px h-4 bg-gray-4"></span>
                <span>{blog.views?.toLocaleString()} بازدید</span>
                <span className="block w-px h-4 bg-gray-4"></span>
                <span className="text-blue">{blog.categorie}</span>
              </span>

              <h1 className="font-bold text-dark text-xl lg:text-2xl xl:text-4xl mb-6">
                {blog.title}
              </h1>

              <div className="text-dark leading-8 text-lg mb-10 whitespace-pre-line">
                {blog.content}
              </div>

              {/* بخش‌های استاتیک بعدی... */}
            </div>
          </div>
        </section>
      </>
    );
  } catch (error) {
    console.error("Error fetching blog:", error);
    return notFound();
  }
};

export default BlogDetails;