import React from "react";
import Breadcrumb from "../Common/Breadcrumb";
import BlogItem from "../Blog/BlogItem";
import SearchForm from "../Blog/SearchForm";
import LatestPosts from "../Blog/LatestPosts";
import LatestProducts from "../Blog/LatestProducts";
import Categories from "../Blog/Categories";

// آدرس‌های API از متغیرهای محیطی خوانده می‌شوند
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const BLOGS_URL = process.env.NEXT_PUBLIC_API_BLOGS_URL;
const PRODUCTS_URL = process.env.NEXT_PUBLIC_API_PRODUCTS_URL;
const CATEGORYS_URL = process.env.NEXT_PUBLIC_API_CATEGORYS_URL;
const TAGS_URL = process.env.NEXT_PUBLIC_API_TAGS_URL;

const BlogGridWithSidebar = async ({ searchParams }) => {
  // 1. استخراج پارامترها به صورت ایمن (هماهنگ با Next.js 15)
  // پارامتر searchParams در سرور کامپوننت یک Promise است و باید await شود.
  const params = await searchParams;
  const search = params?.search || "";
  
  // 2. مدیریت دسته‌بندی‌های انتخاب شده (آرایه‌ای کردن پارامترها)
  // در URL اگر چند دسته انتخاب شود (?cat=A&cat=B)، به صورت آرایه می‌آید.
  // اگر یک دسته باشد، به صورت رشته (String) می‌آید؛ پس با این شرط همه را به آرایه تبدیل می‌کنیم.
  const selectedCats = Array.isArray(params?.cat)
    ? params.cat
    : params?.cat
    ? [params.cat]
    : [];

  // 3. ساخت کوئری استرینگ برای ارسال به سمت API
  const apiQueryParams = new URLSearchParams();
  if (search) apiQueryParams.append("search", search);
  
  // برای هر دسته بندی انتخاب شده، یک پارامتر 'cat' به URL اضافه می‌کنیم
  selectedCats.forEach((cat) => apiQueryParams.append("cat", cat));

  // 4. دریافت داده‌ها از API (SSR - Server Side Rendering)
  // از cache: "no-store" استفاده شده تا نتایج جستجو همیشه تازه باشند.
  const resBlogs = await fetch(`${BASE_URL}${BLOGS_URL}?${apiQueryParams.toString()}`, {
    cache: "no-store",
  });
  const blogData = await resBlogs.json();

  // دریافت اطلاعات سایدبار (محصولات، دسته بندی‌ها و تگ‌ها)
  const [resProducts, resCategories, resTags] = await Promise.all([
    fetch(`${BASE_URL}${PRODUCTS_URL}`, { cache: "no-store" }),
    fetch(`${BASE_URL}${CATEGORYS_URL}`, { cache: "no-store" }),
    fetch(`${BASE_URL}${TAGS_URL}`, { cache: "no-store" }),
  ]);

  const productsData = await resProducts.json();
  const categoriesData = await resCategories.json();
  const tagsData = await resTags.json();

  return (
    <>
      <Breadcrumb title={"وبلاگ ها"} pages={["وبلاگ ها"]} />

      <section className="overflow-hidden py-20 bg-gray-2" dir="rtl">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col lg:flex-row-reverse gap-7.5 rtl:text-right">
            
            {/* 📌 محتوای اصلی: لیست بلاگ‌ها */}
            <div className="lg:max-w-[770px] w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-10 gap-x-7.5">
                {blogData.data?.length > 0 ? (
                  blogData.data.map((blog) => (
                    <BlogItem blog={blog} key={blog._id} />
                  ))
                ) : (
                  <p className="text-center col-span-2 py-10">مطلبی یافت نشد.</p>
                )}
              </div>

              {/* بخش Pagination (فعلاً استاتیک) */}
              {/* در آینده می‌توانید پارامتر page را هم به API اضافه کنید */}
              <div className="flex justify-center mt-15">
                 {/* ... کدهای مربوط به صفحه‌بندی */}
              </div>
            </div>

            {/* 📌 سایدبار: فیلترها و مطالب اخیر */}
            <div className="lg:max-w-[370px] w-full rtl:text-right">
              <SearchForm />
              
              <LatestPosts blogs={blogData.data?.slice(0, 3)} />
              
              <LatestProducts products={productsData.data?.slice(0, 3)} />
              
              {/* ارسال دسته‌بندی‌های انتخاب شده به کامپوننت Categories برای نمایش وضعیت Checked */}
              <Categories 
                categories={categoriesData.data} 
                 
              />

              {/* بخش تگ‌ها */}
              <div className="shadow-1 bg-white rounded-xl mt-7.5">
                <div className="px-4 sm:px-6 py-4.5 border-b border-gray-3">
                  <h2 className="font-medium text-lg text-dark">برچسب‌ها</h2>
                </div>
                <div className="p-4 sm:p-6 flex flex-wrap gap-3.5">
                    {tagsData.data?.map((tag, index) => (
                      <a key={index} href={`?tag=${tag.name}`} className="inline-flex hover:text-white border border-gray-3 py-2 px-4 rounded-md ease-out duration-200 hover:bg-blue hover:border-blue">
                        {tag.name}
                      </a>
                    ))}
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