"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Swal from "sweetalert2";
// اضافه کردن آیکون‌ها از پکیج مورد نظر شما
import {
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  EyeIcon
} from '@heroicons/react/24/solid';

import {
  StarIcon as StarSolid
} from "@heroicons/react/24/solid";

import {
  StarIcon as StarOutline
} from "@heroicons/react/24/outline";

// URLS
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL
const PRODUCTS_URL = process.env.NEXT_PUBLIC_API_PRODUCTS_URL
const CATEGORYS_URL = process.env.NEXT_PUBLIC_API_CATEGORYS_URL

export default function EditProducts() {
  const [productsData, setProductsData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [categories, setCategories] = useState([]);
  // ذخیره ID محصولی که در حال حذف است برای نمایش لودر اختصاصی
  const [deletingId, setDeletingId] = useState(null);

  // --- استیت‌های مربوط به مودال مشاهده سریع ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activePreview, setActivePreview] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const fetchProducts = async () => {
    try {
      // دریافت همزمان محصولات و دسته‌بندی‌ها
      const [prodRes, catRes] = await Promise.all([
        fetch(`${BASE_URL}${PRODUCTS_URL}`),
        fetch(`${BASE_URL}${CATEGORYS_URL}`)
      ]);

      if (!prodRes.ok || !catRes.ok) throw new Error("خطا در دریافت اطلاعات");

      const prodData = await prodRes.json();
      const catData = await catRes.json();

      setProductsData(Array.isArray(prodData.data) ? prodData.data : []);
      setCategories(Array.isArray(catData.data) ? catData.data : []);
      setTotalCount(prodData.count || prodData.data?.length || 0);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // تابع باز کردن مودال و ست کردن محصول انتخاب شده
  const openQuickView = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
    setActivePreview(0); // ریست کردن اسلایدر تصویر
    setQuantity(1);      // ریست کردن تعداد
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  // --- منطق مدیریت تعداد با بررسی موجودی محصول ---
  const handleIncrease = () => {
    // گرفتن موجودی از خود محصول (selectedProduct.count)
    if (quantity < selectedProduct.count) {
      setQuantity(prev => prev + 1);
    } else {
      Swal.fire({
        title: 'موجودی کافی نیست',
        text: `حداکثر موجودی این کالا ${selectedProduct.count} عدد است.`,
        icon: 'error',
        confirmButtonText: 'متوجه شدم'
      });
    }
  };

  const handleDecrease = () => {
    setQuantity(q => Math.max(1, q - 1));
  };

  // تابع کمکی برای کاهش تعداد محصولات در دسته‌بندی
  const decrementCategoryCount = async (categoryName) => {
    const category = categories.find(cat => cat.name === categoryName);
    if (!category) return;

    try {
      await fetch(`${BASE_URL}${CATEGORYS_URL}/${category._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          products: Math.max(0, (category.products || 0) - 1),
          id: category.id // طبق دستور شما برای مقایسه/جستجو id ارسال می‌شود
        }),
      });
    } catch (err) {
      console.error("خطا در به‌روزرسانی تعداد دسته‌بندی:", err);
    }
  };

  return (
    <section className="overflow-y-scroll h-screen relative pb-20 pt-2 lg:pt-10 xl:pt-12 bg-[#f3f4f6]">
      <div className="w-full mx-auto px-4 sm:px-8 xl:px-10">
        <div className="flex gap-7.5">
          <div className="w-full">
            <div className="rounded-lg bg-white shadow-1 pl-3 pr-2.5 py-2.5 mb-6 flex items-center justify-between">
              <span className="text-dark font-medium">
                تعداد کل محصولات: {totalCount}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-7.5 gap-y-9">
              {productsData.map((item) => {
                // محاسبه امتیاز ستاره‌ها
                const rating = Math.min(5, Math.max(0, Number(item.reviews) || 0));

                return (
                  <div key={item._id} className="group relative flex flex-col overflow-hidden rounded-lg bg-white shadow-sm transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">

                    <div className="relative flex h-[280px] w-full items-center justify-center overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <Image
                        src={item.imgs?.previews?.[0] || "/images/notImg.png"}
                        alt={item.title || "product image"}
                        width={250}
                        height={250}
                        className="object-contain transition-transform duration-300 group-hover:scale-105"
                      />

                      <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-3">
                        <button
                          disabled={deletingId === item._id} // غیرفعال کردن دکمه در حال حذف
                          onClick={async () => {
                            const confirm = await Swal.fire({
                              title: 'آیا مطمئن هستید؟',
                              icon: 'warning',
                              showCancelButton: true,
                              confirmButtonText: 'بله، حذف کن',
                              cancelButtonText: 'انصراف'
                            });

                            if (!confirm.isConfirmed) return;

                            setDeletingId(item._id); // شروع لودینگ برای این محصول خاص

                            try {
                              const res = await fetch(`${BASE_URL}${PRODUCTS_URL}/${item._id}`, { method: 'DELETE' });
                              if (!res.ok) throw new Error('حذف محصول ناموفق بود');

                              await decrementCategoryCount(item.categorie);

                              Swal.fire({ icon: "success", title: "حذف شد", timer: 1500, showConfirmButton: false });
                              fetchProducts();
                            } catch (err) {
                              Swal.fire('خطا!', err.message, 'error');
                            } finally {
                              setDeletingId(null); // پایان لودینگ
                            }
                          }}
                          className={`flex h-10 w-10 items-center justify-center rounded-full text-white shadow-md transition-all 
    ${deletingId === item._id ? "bg-gray-400" : "bg-red lg:opacity-0 lg:translate-y-4 lg:group-hover:opacity-100 lg:group-hover:translate-y-0"}`}
                        >
                          {deletingId === item._id ? (
                            // لودر چرخشی کوچک
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <TrashIcon className="size-5" />
                          )}
                        </button>

                        {/* دکمه مشاهده سریع */}
                        <button
                          onClick={() => openQuickView(item)}
                          className="flex h-10 w-10 items-center justify-center rounded-full text-white bg-blue shadow-md lg:opacity-0 lg:translate-y-4 lg:group-hover:opacity-100 lg:group-hover:translate-y-0 transition-all duration-200 delay-200"
                        >
                          <EyeIcon className="size-5" />
                        </button>

                        {/* دکمه ویرایش */}
                        <Link href={`/panel/editProduct/${item._id}`} className="flex h-10 w-10 items-center justify-center rounded-full text-white bg-green shadow-md lg:opacity-0 lg:translate-y-4 lg:group-hover:opacity-100 lg:group-hover:translate-y-0 transition-all duration-200 delay-300">
                          <PencilSquareIcon className="size-5" />
                        </Link>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="mb-2 font-medium text-lg text-dark line-clamp-1">
                        {item.title}
                      </h3>

                      {/* بخش ستاره ها و نظرات با استفاده از آیکون های پکیج */}
                      <div className="flex items-center justify-between mb-3">

                        <div className="flex items-center gap-1">
                          {[0, 1, 2, 3, 4].map((index) =>
                            index < rating ? (
                              <StarSolid
                                key={index}
                                className="h-4 w-4 sm:h-5 sm:w-5 text-yellow"
                              />
                            ) : (
                              <StarOutline
                                key={index}
                                className="h-4 w-4 sm:h-5 sm:w-5 text-yellow"
                              />
                            )
                          )}

                          <span className="ml-1 text-xs sm:text-sm text-gray-600">
                            {rating}
                          </span>
                        </div>

                        {/* اگه بعدا کامنتی داشتیم میتونیم اضافه کنیم */}
                        {/* <div className="flex items-center gap-1 text-blue">
                          <ChatBubbleLeftEllipsisIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span className="text-xs sm:text-sm">
                            {item.commentsCount || 0}
                          </span>
                        </div> */}

                      </div>

                      <div className="mt-auto">
                        {item.hasDiscount ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-blue">
                              ${item.discountedPrice.toLocaleString()}
                            </span>
                            <span className="text-base text-gray-400 line-through">
                              ${item.price.toLocaleString()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xl font-bold text-blue">
                            ${item.price.toLocaleString()}
                          </span>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* --- کامپوننت مودال (کاملاً ریسپانسیو شده) --- */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-[99999] bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-[1100px] rounded-xl shadow-lg bg-white p-4 sm:p-10 relative animate-fade-in my-auto">
            {/* دکمه بستن */}
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-dark hover:bg-red hover:text-white transition-all z-10"
            >
              <XMarkIcon className="size-6" />
            </button>

            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-10">

              {/* بخش تصاویر مودال - ریسپانسیو شده */}
              <div className="w-full lg:max-w-[500px] flex flex-col sm:flex-row gap-4">
                {/* بند انگشتی‌ها (Thumbnails) */}
                <div className="flex flex-row sm:flex-col gap-3 order-2 sm:order-1 overflow-x-auto pb-2 sm:pb-0">
                  {selectedProduct.imgs?.thumbnails?.map((img, key) => (
                    img && (
                      <button
                        key={key}
                        onClick={() => setActivePreview(key)}
                        className={`w-16 h-16 sm:w-18 sm:h-18 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${activePreview === key ? "border-blue" : "border-transparent bg-gray-100"}`}
                      >
                        <Image src={img} alt="thumb" width={70} height={70} className="object-cover h-full w-full" />
                      </button>
                    )
                  ))}
                </div>

                {/* تصویر اصلی (Preview) */}
                <div className="flex-1 order-1 sm:order-2 bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
                  {selectedProduct.imgs?.previews?.[activePreview] ? (
                    <Image
                      src={selectedProduct.imgs.previews[activePreview]}
                      alt="preview img"
                      width={350}
                      height={350}
                      className="object-contain p-2"
                    />
                  ) : (
                    <span className="text-gray-400">تصویری موجود نیست</span>
                  )}
                </div>
              </div>

              {/* بخش اطلاعات محصول */}
              <div className="flex-1 w-full max-w-[450px]">
                <div className="flex justify-between items-start mb-4">
                  <span className="inline-block text-xs font-bold text-white py-1 px-3 bg-green rounded">تخفیف</span>
                  <span className="text-xs text-gray-400">موجودی انبار: {selectedProduct.count}</span>
                </div>

                <h3 className="font-bold text-2xl text-dark mb-4">{selectedProduct.title}</h3>
                <p className="text-gray-600 mb-6 text-sm sm:text-base leading-relaxed">
                  این محصول از دسته بندی <span className="text-blue font-semibold">{selectedProduct.categorie}</span> می باشد.
                </p>

                <div className="mb-6">
                  <h4 className="font-bold text-lg mb-2">قیمت:</h4>
                  <div className="flex items-center gap-3">
                    {selectedProduct.hasDiscount ? (
                      <>
                        <span className="text-2xl font-bold text-dark">${selectedProduct.discountedPrice.toLocaleString()}</span>
                        <span className="text-lg text-gray-400 line-through">${selectedProduct.price.toLocaleString()}</span>
                      </>
                    ) : (
                      <span className="text-2xl font-bold text-dark">${selectedProduct.price.toLocaleString()}</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
                  {/* بخش تعداد با کنترل موجودی */}
                  <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden w-full sm:w-auto justify-between">
                    <button onClick={handleDecrease} className="px-5 py-2 hover:bg-gray-100 text-xl">-</button>
                    <span className="px-5 py-2 font-bold border-x border-gray-300">{quantity}</span>
                    <button onClick={handleIncrease} className="px-5 py-2 hover:bg-gray-100 text-xl">+</button>
                  </div>
                  <button className="w-full sm:flex-1 bg-blue text-white px-8 py-3 rounded-lg hover:bg-opacity-90 transition-all font-bold">
                    افزودن به سبد
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </section>
  );
}