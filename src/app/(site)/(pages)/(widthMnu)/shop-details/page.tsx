"use client"
// pages/shop-details/index.tsx
import React, { useEffect, useState } from "react";
import Link from "next/link";

const ShopIndex = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // استفاده از متغیر محیطی برای دریافت لیست تمام محصولات
    const fetchAllProducts = async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}${process.env.NEXT_PUBLIC_API_PRODUCTS_URL}`);
      const result = await response.json();
      if (result.success) {
        setProducts(result.data);
      }
    };
    fetchAllProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-black text-gray-800 mb-10 border-r-4 border-blue-600 pr-4">محصولات فروشگاه</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product: any) => (
            <Link 
              key={product._id} 
              href={`/shop-details/${product._id}`} // استفاده از _id برای لینک داینامیک
              className="group bg-white rounded-3xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="aspect-square mb-4 overflow-hidden rounded-2xl bg-gray-50">
                <img 
                  src={product.imgs?.thumbnails[0]} 
                  alt={product.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <h2 className="font-bold text-gray-700 text-lg mb-2 group-hover:text-blue-600 transition-colors">
                {product.title}
              </h2>
              <div className="flex justify-between items-center mt-4 border-t pt-4">
                <span className="text-blue-600 font-extrabold">{product.price.toLocaleString()} تومان</span>
                <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-lg">مشاهده</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShopIndex;