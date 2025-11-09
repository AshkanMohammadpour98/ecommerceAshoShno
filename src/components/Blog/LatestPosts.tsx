import Link from "next/link";
import React from "react";
import Image from "next/image";

// ✅ این کامپوننت آخرین پست‌های وبلاگ را نمایش می‌دهد
// props → آرایه blogs شامل { img, title, date, views } دریافت می‌کند

const LatestPosts = ({ blogs }) => {
  return (
    <div className="shadow-1 bg-white rounded-xl mt-7.5">
      {/* 🔹 هدر بخش */}
      <div className="px-4 sm:px-6 py-4.5 border-b border-gray-3">
        <h2 className="font-medium text-lg text-dark">آخرین پست‌ها</h2>
      </div>

      {/* 🔹 لیست پست‌ها */}
      <div className="p-4 sm:p-6">
        <div className="flex flex-col gap-6">
          {/* ⚡ نمایش فقط ۳ پست اول */}
          {blogs.slice(0, 3).map((blog, key) => (
            <div className="flex items-center gap-4" key={key}>
              {/* تصویر پست */}
              <Link
                href="/blogs/blog-details-with-sidebar"
                className="max-w-[110px] w-full rounded-[10px] overflow-hidden"
              >
                <Image
                  src={blog.img || null}
                  alt="blog"
                  className="rounded-[10px] w-full"
                  width={110}
                  height={80}
                />
              </Link>

              {/* اطلاعات پست */}
              <div>
                {/* عنوان پست */}
                <h3 className="text-dark leading-[22px] ease-out duration-200 mb-1.5 hover:text-blue">
                  <Link href="/blogs/blog-details-with-sidebar">{blog.title}</Link>
                </h3>

                {/* تاریخ و تعداد بازدید */}
                <span className="flex items-center gap-3">
                  <a
                    href="#"
                    className="text-custom-xs ease-out duration-200 hover:text-blue"
                  >
                    {blog.date}
                  </a>

                  {/* خط جداکننده */}
                  <span className="block w-px h-4 bg-gray-4"></span>

                  <a
                    href="#"
                    className="text-custom-xs ease-out duration-200 hover:text-blue"
                  >
                    {blog.views}k بازدید
                  </a>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LatestPosts;
