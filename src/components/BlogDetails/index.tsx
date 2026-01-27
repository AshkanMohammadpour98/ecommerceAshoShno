import React from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import { notFound } from "next/navigation";
import LatestPosts from "../Blog/LatestPosts";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const BLOGS_URL = process.env.NEXT_PUBLIC_API_BLOGS_URL;

const BlogDetails = async ({ _id }) => {
  try {
    // واکشی دیتای مقاله
    const res = await fetch(`${BASE_URL}${BLOGS_URL}/${_id}`, { cache: "no-store" });
    if (!res.ok) return notFound();
    const blog = await res.json();

    // واکشی لیست بلاگ‌ها برای سایدبار
    const resAll = await fetch(`${BASE_URL}${BLOGS_URL}`, { cache: "no-store" });
    const allBlogsData = await resAll.json();
    const otherBlogs = (allBlogsData.data || allBlogsData)
      .filter((item) => item._id !== _id)
      .slice(0, 3);

    return (
      <>
        <Breadcrumb title={blog.title} pages={["وبلاگ", blog.categorie]} />

        {/* بخش اصلی با فواصل استاندارد در موبایل و دسکتاپ (py-12 تا py-25) */}
        <section dir="rtl" className="overflow-hidden py-12 lg:py-25 bg-gray-2 text-right">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            
            {/* flex-col-reverse: در موبایل باعث می‌شود ابتدا محتوا و سپس سایدبار بیاید
               lg:flex-row: در دسکتاپ کنار هم قرار می‌گیرند
            */}
            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-12.5">
  
  {/* ۱. سایدبار: در کد دوم است اما در دسکتاپ با order-first به سمت راست (اول) می‌رود */}
  <aside className="lg:w-1/3 xl:w-[370px] w-full order-last lg:order-first">
    <div className="lg:sticky lg:top-30"> 
      <LatestPosts blogs={otherBlogs} />
      {/* SearchForm یا بخش‌های دیگر سایدبار اینجا قرار بگیرند */}
    </div>
  </aside>

  {/* ۲. محتوای اصلی: در موبایل اول است و در دسکتاپ با order-last به سمت چپ (دوم) می‌رود */}
  <div className="lg:w-2/3 xl:w-[750px] w-full order-first lg:order-last">
    {/* تصویر و محتوای اصلی مقاله */}
    <div className="rounded-[10px] overflow-hidden mb-7.5 shadow-sm bg-white">
      <Image
        className="w-full h-auto object-cover"
        src={blog.img || "/images/blog/blog-details-01.jpg"}
        alt={blog.title}
        width={750}
        height={477}
        priority
      />
    </div>

    <div className="bg-white p-6 sm:p-10 rounded-[10px] shadow-sm">
      <h1 className="font-bold text-dark text-xl lg:text-2xl xl:text-4xl mb-6">
        {blog.title}
      </h1>
      <div className="text-dark leading-8 text-lg whitespace-pre-line">
        {blog.content}
      </div>
    </div>
  </div>

</div>
          </div>
        </section>
      </>
    );
  } catch (error) {
    return notFound();
  }
};

export default BlogDetails;