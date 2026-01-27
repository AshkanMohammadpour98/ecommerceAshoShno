// صفحه همه محصولات بدون نوار کناری
"use client";
import React, { useEffect, useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import SingleGridItem from "../Shop/SingleGridItem";
import SingleListItem from "../Shop/SingleListItem";
// import CustomSelect from "../ShopWithSidebar/CustomSelect";
import InfiniteScroll from "react-infinite-scroll-component";

// URLS
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL
const PRODUCTS_URL = process.env.NEXT_PUBLIC_API_PRODUCTS_URL

const ShopWithoutSidebar = () => {
  const [productStyle, setProductStyle] = useState("grid"); // حالت نمایش (grid یا list)
  const [productsData, setProductsData] = useState([]); // همه محصولات
  const [visibleProducts, setVisibleProducts] = useState([]); // محصولات قابل نمایش در صفحه
  // const [selectedOption, setSelectedOption] = useState(null);

  // گرفتن اطلاعات محصولات از API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${BASE_URL}${PRODUCTS_URL}`);
        if (!res.ok) throw new Error("خطا در دریافت اطلاعات");

        const data = await res.json();
        setProductsData(data.data); // ذخیره همه داده‌ها
        setVisibleProducts(data.data); 
      } catch (err) {
        console.error(err);
        setProductsData([]); // اگر خطا بود، state خالی بمونه
      }
    };

    fetchProducts();
  }, []); // فقط یک بار وقتی کامپوننت mount میشه اجرا میشه

  // تابع برای لود کردن محصولات بیشتر در InfiniteScroll
  const fetchMoreData = () => {
    const nextProducts = productsData.slice(
      visibleProducts.length,
      visibleProducts.length + 10
    );
    setVisibleProducts([...visibleProducts, ...nextProducts]);
  };

  // گزینه‌های مرتب‌سازی
  const options = [
    { label: "جدید ترین محصولات", value: "0" },
    { label: "پرفروش ترین ها", value: "1" },
    { label: "محصولات قدیمی", value: "2" },
  ];

  return (
    <>
      {/* مسیر صفحات */}
      <Breadcrumb
        title={"نمایش همه محصولات"}
        pages={["فروشگاه", "/", "فروشگاه بدون نوار کناری"]}
      />

      {/* بخش اصلی */}
      <section className="overflow-hidden relative pb-20 pt-5 lg:pt-20 xl:pt-28 bg-[#f3f4f6]">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex gap-7.5">
            {/* محتوای اصلی */}
            <div className="w-full">
              {/* نوار بالا */}
              <div className="rounded-lg bg-white shadow-1 pl-3 pr-2.5 py-2.5 mb-6">
                <div className="flex items-center justify-between">
                  {/* سمت چپ */}
                  <div className="flex flex-wrap items-center gap-4">
                    {/* <CustomSelect options={options} selectedOption={selectedOption} setSelectedOption={setSelectedOption} /> */}
                    <p>
                      <span className="text-dark">{visibleProducts.length} از {productsData.length}</span>{" "}
                      همه محصولات
                    </p>
                  </div>

                  {/* سمت راست (دکمه‌های تغییر حالت نمایش) */}
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setProductStyle("grid")}
                      aria-label="grid view"
                      className={`${productStyle === "grid"
                        ? "bg-blue border-blue text-white"
                        : "text-dark bg-gray-1 border-gray-3"
                        } flex items-center justify-center w-10.5 h-9 rounded-[5px] border ease-out duration-200`}
                    >
                      {/* آیکون grid */}
                      <svg
                        className="fill-current"
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M4 2h3v3H4V2zm7 0h3v3h-3V2zM4 9h3v3H4V9zm7 0h3v3h-3V9z" />
                      </svg>
                    </button>

                    <button
                      onClick={() => setProductStyle("list")}
                      aria-label="list view"
                      className={`${productStyle === "list"
                        ? "bg-blue border-blue text-white"
                        : "text-dark bg-gray-1 border-gray-3"
                        } flex items-center justify-center w-10.5 h-9 rounded-[5px] border ease-out duration-200`}
                    >
                      {/* آیکون list */}
                      <svg
                        className="fill-current"
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M3 4h12v2H3V4zm0 4h12v2H3V8zm0 4h12v2H3v-2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* بخش محصولات با اسکرول بی‌نهایت */}
              <InfiniteScroll
                dataLength={visibleProducts.length} // تعداد محصولاتی که لود شده
                next={fetchMoreData} // تابع برای لود بیشتر
                hasMore={visibleProducts.length < productsData.length} // بررسی اینکه آیا محصول بیشتری وجود دارد
                loader={
                  <h4 className="text-center text-blue-600 font-medium animate-pulse py-4">
                     در حال بارگذاری...
                  </h4>
                }
                endMessage={
                  <p className="text-center text-green-600 font-semibold py-4 border-t border-gray-200 mt-6">
                     همه محصولات نمایش داده شدند
                  </p>
                }
              >
                <div
                  className={`${productStyle === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-7.5 gap-y-9"
                    : "flex flex-col gap-7.5"
                    }`}
                >
                  {visibleProducts.map((item, key) =>
                    productStyle === "grid" ? (
                      <SingleGridItem item={item} key={key} />
                    ) : (
                      <SingleListItem item={item} key={key} />
                    )
                  )}
                </div>
              </InfiniteScroll>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ShopWithoutSidebar;
