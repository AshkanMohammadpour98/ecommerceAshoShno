"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ProductItem from "@/components/Common/ProductItem";

// URLS
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL
const PRODUCTS_URL = process.env.NEXT_PUBLIC_API_PRODUCTS_URL

const NewArrival = () => {
  const [productsData , setProductsData] = useState([])

        useEffect(() => {
        const fetchProducts = async () => {
          try {
            const res = await fetch(`${BASE_URL}${PRODUCTS_URL}`);
            if (!res.ok) throw new Error("خطا در دریافت اطلاعات");
    
            const data = await res.json();
            setProductsData(data.data.slice(0, 10)); // فقط 10 محصول اول نمایش داده میشه
          } catch (err) {
            console.error(err);
            setProductsData([]); // اگه خطا بود، state خالی بمونه
          }
        };
    
        fetchProducts();
      }, []); // فقط یک بار وقتی کامپوننت mount میشه اجرا میشه

  return (
    <section className="overflow-hidden pt-15">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        
        {/* ===========================
            بخش عنوان بخش محصولات جدید
        ============================ */}
        <div className="mb-7 flex items-center justify-between">
          <div>
            <span className="flex items-center gap-2.5 font-medium text-dark mb-1.5">
              {/* آیکون بخش */}
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* ... مسیر svg مشابه قبلی ... */}
              </svg>
              این هفته
            </span>
            <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">
              محصولات جدید
            </h2>
          </div>

          {/* دکمه مشاهده همه */}
          <Link
            href="/shop-with-sidebar"
            className="inline-flex font-medium text-custom-sm py-2.5 px-7 rounded-md border-gray-3 border bg-gray-1 text-dark ease-out duration-200 hover:bg-dark hover:text-white hover:border-transparent"
          >
            مشاهده همه
          </Link>
        </div>

        {/* نمایش محصولات به صورت گرید */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-7.5 gap-y-9">
          {productsData.map((item, key) => (
            <ProductItem item={item} key={key} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewArrival;
