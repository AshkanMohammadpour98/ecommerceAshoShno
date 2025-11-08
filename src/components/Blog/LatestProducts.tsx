import React from "react";
import Image from "next/image";
import Link from "next/link";

// ✅ این کامپوننت آخرین محصولات فروشگاه را نمایش می‌دهد
// props → آرایه products شامل { imgs, title, price } دریافت می‌کند

const LatestProducts = ({ products }) => {
  return (
    <div className="shadow-1 bg-white rounded-xl mt-7.5">
      {/* 🔹 هدر بخش */}
      <div className="px-4 sm:px-6 py-4.5 border-b border-gray-3">
        <h2 className="font-medium text-lg text-dark">آخرین محصولات</h2>
      </div>

      {/* 🔹 لیست محصولات */}
      <div className="p-4 sm:p-6">
        <div className="flex flex-col gap-6">
          {/* ⚡ فقط ۳ محصول اول نمایش داده می‌شود */}
          {products.slice(0, 3).map((product, key) => (
            <div className="flex items-center gap-6" key={key}>
              {/* تصویر محصول */}
              <div className="flex items-center justify-center rounded-[10px] bg-gray-3 max-w-[90px] w-full h-22.5">
                <Image
                  src={product.imgs?.thumbnails?.[0]}
                  alt="product"
                  width={74}
                  height={74}
                />
              </div>

              {/* عنوان و قیمت */}
              <div>
                <h3 className="font-medium text-dark mb-1 ease-out duration-200 hover:text-blue">
                  <Link href="/shop-details">{product.title}</Link>
                </h3>
                <p className="text-custom-sm">قیمت: ${product.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LatestProducts;
