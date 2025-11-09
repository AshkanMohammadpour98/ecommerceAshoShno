"use client"
import React, { useEffect, useState } from "react";
import SingleItem from "./SingleItem";
import Image from "next/image";
import Link from "next/link";
// import shopData from "@/components/Shop/shopData";

const BestSeller = () => {
    const [products, setProducts] = useState([]);
    useEffect(() => {
    fetch("http://localhost:3001/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("خطا در دریافت محصولات:", err));
  }, []);
  return (
    <section className="overflow-hidden">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {/* <!-- عنوان بخش --> */}
        <div className="mb-10 flex items-center justify-between" dir="rtl">
          <div>
            <span className="flex items-center gap-2.5 font-medium text-dark mb-1.5">
              <Image
                src="/images/icons/icon-07.svg"
                alt="آیکون"
                width={17}
                height={17}
              />
              این ماه
            </span>
            <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">
              پرفروش‌ترین‌ها
            </h2>
          </div>
        </div>

        {/* <!-- محصولات پرفروش --> */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7.5">
          {products.slice(1, 7).map((item, key) => (
            <SingleItem item={item} key={key} />
          ))}
        </div>

        {/* <!-- دکمه مشاهده همه --> */}
        <div className="text-center mt-12.5">
          <Link
            href="/shop-without-sidebar"
            className="inline-flex font-medium text-custom-sm py-3 px-7 sm:px-12.5 rounded-md border-gray-3 border bg-gray-1 text-dark ease-out duration-200 hover:bg-dark hover:text-white hover:border-transparent"
          >
            مشاهده همه
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BestSeller;
