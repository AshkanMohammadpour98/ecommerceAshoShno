// 📄 این صفحه لیست همه مقالات را برای ویرایش (بلاگ) را به صورت شبکه‌ای همراه با صفحه‌بندی نمایش می‌دهد
import Link from "next/link";

const EditBlogs = async () => {

     // اینجا مستقیم fetch میکنیم → SSR گرفتن دیتای همه مقالات
   const resBlogs = await fetch("http://localhost:3000/blogData", {
     cache: "no-store", // برای اینکه هر بار رفرش شه (معادل getServerSideProps)
   });
   const blogData = await resBlogs.json();
  
  return (
    <>


      <section dir="rtl" className="overflow-y-scroll  h-screen relative pb-20 pt-2 lg:pt-10xl:pt-12 bg-[#f3f4f6]">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          {/*  لیست مقالات در حالت گرید (شبکه‌ای) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-7.5">
            {blogData.map((blog, key) => (
              <div key={key} className="shadow-1 bg-white rounded-xl px-4 sm:px-5 pt-5 pb-4 text-right">
                    {/* لینک تصویر بلاگ */}
                    <Link href="/blogs/blog-details" className="rounded-md overflow-hidden block">
                      <img
                        src={blog.img}
                        alt="تصویر بلاگ"
                        className="rounded-md w-full"
                        width={330}
                        height={210}
                      />
                    </Link>
              
                    <div className="mt-5.5">
                      {/* تاریخ و تعداد بازدید */}
                      <span className="flex items-center gap-3 mb-2.5 text-gray-600 text-sm">
                        <a
                          href="#"
                          className="ease-out duration-200 hover:text-blue"
                        >
                          {blog.date} {/* تاریخ انتشار */}
                        </a>
              
                        {/* جداکننده عمودی */}
                        <span className="block w-px h-4 bg-gray-400"></span>
              
                        <a
                          href="#"
                          className="ease-out duration-200 hover:text-blue"
                        >
                          {blog.views} بازدید
                        </a>
                      </span>
              
                      {/* عنوان مقاله */}
                      <h2 className="font-medium text-dark text-lg sm:text-xl ease-out duration-200 mb-4 hover:text-blue">
                        <Link href={`/panel/editBlog/${blog.id}`}>{blog.title}</Link>
                      </h2>
              
                      {/* لینک ادامه مطلب */}
                      <Link
                        href={`/panel/editBlog/${blog.id}`}
                        className="text-sm inline-flex items-center gap-2 py-2 ease-out duration-200 hover:text-blue"
                      >
                        بیشتر
                        <svg
                          className="fill-current rotate-180" // برعکس شدن فلش برای راست‌چین
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M10.1023 4.10225C10.3219 3.88258 10.6781 3.88258 10.8977 4.10225L15.3977 8.60225C15.6174 8.82192 15.6174 9.17808 15.3977 9.39775L10.8977 13.8977C10.6781 14.1174 10.3219 14.1174 10.1023 13.8977C9.88258 13.6781 9.88258 13.3219 10.1023 13.1023L13.642 9.5625H3C2.68934 9.5625 2.4375 9.31066 2.4375 9C2.4375 8.68934 2.68934 8.4375 3 8.4375H13.642L10.1023 4.89775C9.88258 4.67808 9.88258 4.32192 10.1023 4.10225Z"
                            fill=""
                          />
                        </svg>
                      </Link>
                    </div>
                  </div>
            ))}
          </div>

          {/*  شروع بخش صفحه‌بندی */}
          <div className="flex justify-center mt-15">
            <div className="bg-white shadow-1 rounded-md p-2">
              <ul className="flex items-center">
                {/* دکمه قبلی (غیرفعال) */}
                <li>
                  <button
                    id="paginationLeft"
                    aria-label="دکمه صفحه قبلی"
                    type="button"
                    disabled
                    className="flex items-center justify-center w-8 h-9 ease-out duration-200 rounded-[3px] disabled:text-gray-4"
                  >
                    <svg
                      className="fill-current"
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12.1782 16.1156C12.0095 16.1156 11.8407 16.0594 11.7282 15.9187L5.37197 9.45C5.11885 9.19687 5.11885 8.80312 5.37197 8.55L11.7282 2.08125C11.9813 1.82812 12.3751 1.82812 12.6282 2.08125C12.8813 2.33437 12.8813 2.72812 12.6282 2.98125L6.72197 9L12.6563 15.0187C12.9095 15.2719 12.9095 15.6656 12.6563 15.9187C12.4876 16.0312 12.347 16.1156 12.1782 16.1156Z"
                        fill=""
                      />
                    </svg>
                  </button>
                </li>

                {/* شماره صفحات */}
                <li>
                  <a
                    href="#"
                    className="flex py-1.5 px-3.5 duration-200 rounded-[3px] bg-blue text-white hover:text-white hover:bg-blue"
                  >
                    ۱
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex py-1.5 px-3.5 duration-200 rounded-[3px] hover:text-white hover:bg-blue"
                  >
                    ۲
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex py-1.5 px-3.5 duration-200 rounded-[3px] hover:text-white hover:bg-blue"
                  >
                    ۳
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex py-1.5 px-3.5 duration-200 rounded-[3px] hover:text-white hover:bg-blue"
                  >
                    ۴
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex py-1.5 px-3.5 duration-200 rounded-[3px] hover:text-white hover:bg-blue"
                  >
                    ۵
                  </a>
                </li>
                <li>
                  <span className="flex py-1.5 px-3.5">...</span>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex py-1.5 px-3.5 duration-200 rounded-[3px] hover:text-white hover:bg-blue"
                  >
                    ۱۰
                  </a>
                </li>

                {/* دکمه بعدی */}
                <li>
                  <button
                    id="paginationRight"
                    aria-label="دکمه صفحه بعدی"
                    type="button"
                    className="flex items-center justify-center w-8 h-9 ease-out duration-200 rounded-[3px] hover:text-white hover:bg-blue disabled:text-gray-4"
                  >
                    <svg
                      className="fill-current"
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5.82197 16.1156C5.65322 16.1156 5.5126 16.0594 5.37197 15.9469C5.11885 15.6937 5.11885 15.3 5.37197 15.0469L11.2782 9L5.37197 2.98125C5.11885 2.72812 5.11885 2.33437 5.37197 2.08125C5.6251 1.82812 6.01885 1.82812 6.27197 2.08125L12.6282 8.55C12.8813 8.80312 12.8813 9.19687 12.6282 9.45L6.27197 15.9187C6.15947 16.0312 5.99072 16.1156 5.82197 16.1156Z"
                        fill=""
                      />
                    </svg>
                  </button>
                </li>
              </ul>
            </div>
          </div>
          {/* ✅ پایان بخش صفحه‌بندی */}
        </div>
      </section>
    </>
  );
};

export default EditBlogs;
