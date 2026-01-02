import React, { useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import SearchForm from "../Blog/SearchForm";
import LatestPosts from "../Blog/LatestPosts";
import LatestProducts from "../Blog/LatestProducts";
// import blogData from "../BlogGrid/blogData";
import Image from "next/image";
// import { productsData } from "@/app/api/products/route";

// URLS
const PRODUCTS_URL = process.env.NEXT_PUBLIC_API_PRODUCTS_URL
const BLOGS_URL = process.env.NEXT_PUBLIC_API_BLOGS_URL
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

const BlogDetailsWithSidebar = async () => {
  // اینجا مستقیم fetch میکنیم → SSR
  const resBlogs = await fetch(`${BASE_URL}${BLOGS_URL}`, {
    cache: "no-store", // برای اینکه هر بار رفرش شه (معادل getServerSideProps)
  });
  const blogData = await resBlogs.json();

  // اینجا مستقیم fetch میکنیم → SSR
  const resProducts = await fetch(`${BASE_URL}${PRODUCTS_URL}`, {
    cache: "no-store", // برای اینکه هر بار رفرش شه (معادل getServerSideProps)
  });
  const productsData = await resProducts.json();
  console.log("جزئیات مقاله با نوارکناری");
  
  return (
    <>
      {/* مسیر ناوبری بالای صفحه */}
      <Breadcrumb
        title={"جزئیات مقاله با نوارکناری"}
        pages={["جزئیات مقاله با نوارکناری"]}
      />

      <section dir="rtl" className="overflow-hidden py-20 bg-gray-2 text-right">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-12.5">

            {/* جزئیات مقاله */}
            <div className="lg:max-w-[750px] w-full">
              <div className="rounded-[10px] overflow-hidden mb-7.5">
                <Image
                  className="rounded-[10px]"
                  src="/images/blog/blog-details-01.jpg"
                  alt="جزئیات مقاله"
                  width={750}
                  height={477}
                />
              </div>

              <div>
                {/* تاریخ و بازدید */}
                <span className="flex items-center gap-3 mb-4">
                  <a href="#" className="ease-out duration-200 hover:text-blue">
                    ۲۷ اسفند ۱۴۰۰
                  </a>
                  <span className="block w-px h-4 bg-gray-4"></span>
                  <a href="#" className="ease-out duration-200 hover:text-blue">
                    ۳۰۰ هزار بازدید
                  </a>
                </span>

                {/* عنوان مقاله */}
                <h2 className="font-medium text-dark text-xl lg:text-2xl xl:text-custom-4xl mb-4">
                  چه اطلاعاتی برای ارسال محصول لازم است؟
                </h2>

                {/* پاراگراف‌ها */}
                <p className="mb-6">
                  این متن نمونه‌ای است برای پر کردن فضای مقاله. هدف نمایش
                  ظاهر واقعی صفحه است و محتوای واقعی بعداً جایگزین خواهد شد.
                </p>

                <p className="mb-6">
                  این بخش می‌تواند شامل توضیحات تکمیلی درباره مقاله باشد
                  و تجربه کاربر را شبیه‌سازی کند.
                </p>

                <p>
                  لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و
                  با استفاده از طراحان گرافیک است. این متن فقط برای تست ظاهر
                  مقاله نوشته شده است.
                </p>

                {/* بخش لیست نکات */}
                <div className="mt-7.5">
                  <h3 className="font-medium text-dark text-lg xl:text-[26px] xl:leading-[34px] mb-6">
                    نکات مهم برای طراحان Ui/Ux
                  </h3>
                  <ul className="list-disc pl-6">
                    <li>تجربه کاربری خوب باعث افزایش رضایت مشتری می‌شود.</li>
                    <li>طراحی رابط کاربری نیاز به خلاقیت و دقت دارد.</li>
                    <li>سادگی و کاربردپذیری از اصول اصلی هستند.</li>
                    <li>هماهنگی رنگ‌ها و فونت‌ها تاثیر زیادی دارد.</li>
                  </ul>
                </div>

                {/* نقل قول */}
                <div className="rounded-xl bg-white pt-7.5 pb-6 px-4 sm:px-7.5 my-7.5">
                  <p className="italic text-dark text-center">
                    ‘‘یک نقل‌قول انگیزشی یا توضیح کوتاه از نویسنده مقاله.’’
                  </p>
                  <a
                    href="#"
                    className="flex items-center justify-center gap-3 mt-5.5"
                  >
                    <div className="flex w-12 h-12 rounded-full overflow-hidden">
                      <Image
                        src="/images/users/user-04.jpg"
                        alt="نویسنده"
                        width={48}
                        height={48}
                      />
                    </div>
                    <div>
                      <h4 className="text-dark text-custom-sm">جان درینو</h4>
                      <p className="text-custom-xs">کارآفرین</p>
                    </div>
                  </a>
                </div>

                {/* پاراگراف‌های تکمیلی */}
                <p className="mb-6">
                  توضیحات بیشتر درباره مقاله و اطلاعات مفید برای کاربران.
                </p>
                <p className="mb-6">
                  بررسی نکات کلیدی و تجربه کاربری مناسب باعث جذابیت صفحه می‌شود.
                </p>

                {/* تگ‌ها و شبکه‌های اجتماعی */}
                <div className="flex flex-wrap items-center justify-between gap-10 mt-10">
                  <div className="flex flex-wrap items-center gap-5">
                    <p>تگ‌های محبوب :</p>
                    <ul className="flex flex-wrap items-center gap-3.5">
                      <li>
                        <a className="inline-flex hover:text-white border border-gray-3 bg-white py-2 px-4 rounded-md ease-out duration-200 hover:bg-blue hover:border-blue" href="#">دسکتاپ</a>
                      </li>
                      <li>
                        <a className="inline-flex hover:text-white border border-gray-3 bg-white py-2 px-4 rounded-md ease-out duration-200 hover:bg-blue hover:border-blue" href="#">مک‌بوک</a>
                      </li>
                      <li>
                        <a className="inline-flex hover:text-white border border-gray-3 bg-white py-2 px-4 rounded-md ease-out duration-200 hover:bg-blue hover:border-blue" href="#">پی‌سی</a>
                      </li>
                    </ul>
                  </div>

                  {/* لینک شبکه‌های اجتماعی */}
                  <div className="flex items-center gap-3">
                    {/* این بخش svg های شبکه‌ها است */}
                  </div>
                </div>
              </div>
            </div>

            {/* سایدبار */}
            <div className="lg:max-w-[370px] w-full">
              <SearchForm />
              <LatestPosts blogs={blogData} />
              <LatestProducts products={productsData} />

              {/* دسته‌بندی‌های محبوب */}
              <div className="shadow-1 bg-white rounded-xl mt-7.5">
                <div className="px-4 sm:px-6 py-4.5 border-b border-gray-3">
                  <h2 className="font-medium text-lg text-dark">دسته‌بندی‌های محبوب</h2>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col gap-3">
                    <button className="group flex items-center justify-between ease-out duration-200 text-dark hover:text-blue">
                      دسکتاپ
                      <span className="inline-flex rounded-[30px] bg-gray-2 text-custom-xs px-1.5 ease-out duration-200 group-hover:text-white group-hover:bg-blue">
                        ۱۲
                      </span>
                    </button>
                    <button className="group flex items-center justify-between ease-out duration-200 text-dark hover:text-blue">
                      لپ‌تاپ
                      <span className="inline-flex rounded-[30px] bg-gray-2 text-custom-xs px-1.5 ease-out duration-200 group-hover:text-white group-hover:bg-blue">
                        ۲۵
                      </span>
                    </button>
                    <button className="group flex items-center justify-between ease-out duration-200 text-dark hover:text-blue">
                      مانیتور
                      <span className="inline-flex rounded-[30px] bg-gray-2 text-custom-xs px-1.5 ease-out duration-200 group-hover:text-white group-hover:bg-blue">
                        ۲۳
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* تگ‌ها */}
              <div className="shadow-1 bg-white rounded-xl mt-7.5">
                <div className="px-4 sm:px-6 py-4.5 border-b border-gray-3">
                  <h2 className="font-medium text-lg text-dark">تگ‌ها</h2>
                </div>
                <div className="p-4 sm:p-6 flex flex-wrap gap-3.5">
                  <a className="inline-flex hover:text-white border border-gray-3 py-2 px-4 rounded-md ease-out duration-200 hover:bg-blue hover:border-blue" href="#">دسکتاپ</a>
                  <a className="inline-flex hover:text-white border border-gray-3 py-2 px-4 rounded-md ease-out duration-200 hover:bg-blue hover:border-blue" href="#">مک‌بوک</a>
                  <a className="inline-flex hover:text-white border border-gray-3 py-2 px-4 rounded-md ease-out duration-200 hover:bg-blue hover:border-blue" href="#">پی‌سی</a>
                  <a className="inline-flex hover:text-white border border-gray-3 py-2 px-4 rounded-md ease-out duration-200 hover:bg-blue hover:border-blue" href="#">ساعت</a>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default BlogDetailsWithSidebar;
