// 📌 این صفحه برای نمایش وبلاگ‌ها به صورت گرید (شبکه‌ای) همراه با سایدبار طراحی شده است.
// سایدبار شامل جستجو، آخرین مطالب، آخرین محصولات، دسته‌بندی‌ها و برچسب‌ها می‌باشد.

import React from "react";
import Breadcrumb from "../Common/Breadcrumb";
import BlogItem from "../Blog/BlogItem";
// import blogData from "../BlogGrid/blogData";
import SearchForm from "../Blog/SearchForm";
import LatestPosts from "../Blog/LatestPosts";
import LatestProducts from "../Blog/LatestProducts";
import Categories from "../Blog/Categories";
// import shopData from "../Shop/shopData";
// import { productsData } from "@/app/api/products/route";
// import { tags } from "@/app/api/tags/route"
// import {categories} from "@/app/api/categories/route"

const BlogGridWithSidebar = async () => {
  // ✅ تعریف دسته‌بندی‌ها (نام‌ها انگلیسی باقی می‌مانند)
  // const categories = [
  //   { name: "Desktop", products: 10 },
  //   { name: "Laptop", products: 12 },
  //   { name: "Monitor", products: 30 },
  //   { name: "UPS", products: 23 },
  //   { name: "Phone", products: 10 },
  //   { name: "Watch", products: 13 },
  // ];

  // ✅ تعریف برچسب‌ها (انگلیسی)
  // const tags = [
  //   "Desktop",
  //   "MacBook",
  //   "PC",
  //   "Watch",
  //   "USB Cable",
  //   "Mouse",
  //   "Windows PC",
  //   "Monitor",
  // ];

  // اینجا مستقیم fetch میکنیم → SSR
  const resBlogs = await fetch("http://localhost:3000/blogData", {
    cache: "no-store", // برای اینکه هر بار رفرش شه (معادل getServerSideProps)
  });
  const blogData = await resBlogs.json();
  
  // اینجا مستقیم fetch میکنیم → SSR
  const resProducts = await fetch("http://localhost:3000/products", {
    cache: "no-store", // برای اینکه هر بار رفرش شه (معادل getServerSideProps)
  });
  const productsData = await resProducts.json();

  // اینجا مستقیم fetch میکنیم → SSR
  const resCategories = await fetch("http://localhost:3000/categories", {
    cache: "no-store", // برای اینکه هر بار رفرش شه (معادل getServerSideProps)
  });
  const categories = await resCategories.json();

    // اینجا مستقیم fetch میکنیم → SSR
  const resTags = await fetch("http://localhost:3000/tags", {
    cache: "no-store", // برای اینکه هر بار رفرش شه (معادل getServerSideProps)
  });
  const tags = await resTags.json();

  console.log("این صفحه برای نمایش وبلاگ‌ها به صورت گرید (شبکه‌ای) همراه با سایدبار طراحی شده است.");


  return (
    <>
      {/* 📌 Breadcrumb یا مسیر صفحه - برای نمایش موقعیت کاربر در سایت */}
      <Breadcrumb title={"وبلاگ ها با نوار کناری"} pages={["وبلاگ ها با نوارد کناری"]} />

      {/* 📌 بخش اصلی محتوا (لیست بلاگ‌ها) */}
      <section className="overflow-hidden py-20 bg-gray-2" dir="rtl">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col lg:flex-row-reverse gap-7.5 rtl:text-right">
            <div className="lg:max-w-[770px] w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-10 gap-x-7.5">
                {blogData.map((blog, key) => (
                  <BlogItem blog={blog} key={key} />
                ))}
              </div>

              {/* 📌 بخش صفحه‌بندی (Pagination) */}
              <div className="flex justify-center mt-15">
                <div className="bg-white shadow-1 rounded-md p-2">
                  <ul className="flex items-center">
                    <li>
                      <button
                        id="paginationLeft"
                        aria-label="button for pagination left"
                        type="button"
                        disabled
                        className="flex items-center justify-center w-16 h-9 ease-out duration-200 rounded-[3px] disabled:text-gray-4"
                      >
                        قبلی
                      </button>
                    </li>

                    {[1, 2, 3, 4, 5, "...", 10].map((page, index) => (
                      <li key={index}>
                        <a
                          href="#"
                          className={`flex py-1.5 px-3.5 duration-200 rounded-[3px] ${page === 1
                              ? "bg-blue text-white"
                              : "hover:text-white hover:bg-blue"
                            }`}
                        >
                          {page}
                        </a>
                      </li>
                    ))}

                    <li>
                      <button
                        id="paginationRight"
                        aria-label="button for pagination right"
                        type="button"
                        className="flex items-center justify-center w-16 h-9 ease-out duration-200 rounded-[3px] hover:text-white hover:bg-blue disabled:text-gray-4"
                      >
                        بعدی
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 📌 بخش سایدبار (کنار صفحه) */}
            <div className="lg:max-w-[370px] w-full rtl:text-right">
              <SearchForm />
              <LatestPosts blogs={blogData} />
              <LatestProducts products={productsData} />
              <Categories categories={categories} />

              <div className="shadow-1 bg-white rounded-xl mt-7.5">
                <div className="px-4 sm:px-6 py-4.5 border-b border-gray-3">
                  <h2 className="font-medium text-lg text-dark">برچسب‌ها</h2>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="flex flex-wrap gap-3.5">
                    {tags.map((tag, index) => (
                      <a
                        key={index}
                        href="#"
                        className="inline-flex hover:text-white border border-gray-3 py-2 px-4 rounded-md ease-out duration-200 hover:bg-blue hover:border-blue"
                      >
                        {tag.name}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  );
};

export default BlogGridWithSidebar;
