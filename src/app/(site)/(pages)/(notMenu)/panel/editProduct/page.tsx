// صفحه همه محصولات بدون نوار کناری ویرایش محصولات
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import { AppDispatch } from "@/redux/store";
import { useDispatch } from "react-redux";
import { updateQuickView } from "@/redux/features/quickView-slice";
import Swal from "sweetalert2";

export default function EditProducts() {

  // استیت برای ذخیره لیست محصولات
  const [productsData, setProductsData] = useState([]);
  // useEffect(() => {
  //   console.log(productsData);

  // }, [productsData])

  // کانتکست برای باز کردن مودال
  const { openModal } = useModalContext();

  // اتصال به Redux برای ارسال اکشن‌ها
  const dispatch = useDispatch<AppDispatch>();

  // دریافت داده‌ها از API (یک‌بار بعد از mount)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:3001/products");
        if (!res.ok) throw new Error("خطا در دریافت اطلاعات");

        const data = await res.json();
        // اگر در داده‌ها فیلد reviews وجود نداشت، پیش‌فرض بدیم
        const withReviews = data.map((p) => ({
          ...p,
          reviews: p.reviews ?? 0,
        }));

        setProductsData(withReviews);
      } catch (err) {
        console.error(err);
        setProductsData([]); // خطا → لیست خالی
      }
    };

    fetchProducts();
  }, []);



  return (
    <section className="overflow-y-scroll  h-screen relative pb-20 pt-2 lg:pt-10xl:pt-12 bg-[#f3f4f6]">
      <div className="w-full mx-auto px-4 sm:px-8 xl:px10">
        <div className="flex gap-7.5">
          <div className="w-full">
            {/* نوار بالا: کلید تغییر استایل نمایش */}
            <div className="rounded-lg bg-white shadow-1 pl-3 pr-2.5 py-2.5 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">


                </div>
              </div>
            </div>

            {/* نمایش محتوا */}
            <div
              className={"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-7.5 gap-y-9"}>
              {productsData.map((item, key) => {
                // منطق ستاره‌ها برای هر محصول
                const totalStars = 5;
                const ratingValue = Number(item.reviews) || 0;
                const safeFilled = Math.min(
                  Math.max(ratingValue, 0),
                  totalStars
                );

                return (
                  // کامپوننت کارت محصول بهبود یافته
                  // key={key} را به div اصلی اضافه کنید

                  <div key={item.id} className="group relative flex flex-col overflow-hidden rounded-lg  bg-white shadow-sm transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    {/* بخش تصویر محصول */}
                    <div className="relative flex h-[280px] w-full items-center justify-center overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <Image
                        src={item.imgs?.previews?.[0] || "/placeholder.png"}
                        alt={item.title || "product image"}
                        width={250}
                        height={250}
                        className="object-contain transition-transform duration-300 group-hover:scale-105"
                      />

                      {/* دکمه‌های روی تصویر (Action Buttons) */}
                      <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-3">

                        {/* دکمه حذف */}
                        <button
                          onClick={async () => {

                            // console.log(item.id);
                            const confirm = await Swal.fire({
                              title: 'آیا مطمئن هستید؟',
                              text: 'این محصول بعد از حذف قابل بازیابی نخواهد بود!',
                              icon: 'warning',
                              showCancelButton: true,
                              confirmButtonText: 'بله، حذف کن',
                              cancelButtonText: 'انصراف',
                              didOpen: () => {
                                const confirmBtn = Swal.getConfirmButton();
                                const cancelBtn = Swal.getCancelButton();

                                // رنگ اولیه
                                confirmBtn.style.backgroundColor = '#3085d6';
                                confirmBtn.style.color = '#fff';
                                cancelBtn.style.backgroundColor = '#d33';
                                cancelBtn.style.color = '#fff';

                                // اضافه کردن CSS برای hover با جاوااسکریپت
                                const hoverStyle = document.createElement('style');
                                hoverStyle.innerHTML = `
                                  .swal2-confirm:hover {
                                    background-color: #256ab3 !important; /* آبی تیره‌تر روی hover */
                                  }
                                  .swal2-cancel:hover {
                                    background-color: #a00 !important; /* قرمز تیره‌تر روی hover */
                                  }
                                `;
                                document.head.appendChild(hoverStyle);
                              }
                            });

                            if (!confirm.isConfirmed) return;

                            try {

                              const res = await fetch(`http://localhost:3001/products/${item.id}`, {
                                method: 'DELETE',
                              });

                              if (!res.ok) {
                                throw new Error('حذف محصول ناموفق بود');
                              }

                              Swal.fire({
                                position: "center",
                                icon: "success",
                                title: "حذف محصول با موفقیت انجام شد",
                                showConfirmButton: false,
                                timer: 1500
                              });
                              const resolt = await fetch('http://localhost:3001/products');
                              const data = await resolt.json();
                              setProductsData(data);
                            } catch (err) {
                              Swal.fire('خطا!', err.message, 'error');
                            }


                          }}
                          aria-label="حذف"
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-dark shadow-md 
                          opacity-0 transition-all duration-200 transform translate-y-4 
                          group-hover:opacity-100 group-hover:translate-y-0 delay-100 
                          hover:bg-red-light hover:text-white 
                          dark:bg-gray-700 dark:text-white dark:hover:bg-red"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>

                        {/* دکمه مشاهده سریع */}
                        <button
                          onClick={() => {
                            openModal();
                            dispatch(updateQuickView({ ...item }));
                          }}
                          aria-label="مشاهده سریع"
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-dark shadow-md 
                            opacity-0 transition-all duration-200 transform translate-y-4 
                            group-hover:opacity-100 group-hover:translate-y-0 delay-200 
                            hover:bg-blue hover:text-white 
                            dark:bg-gray-700 dark:text-white dark:hover:bg-blue-dark"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          </svg>
                        </button>

                        {/* دکمه ویرایش */}
                        <Link
                          href={`/panel/editProduct/${item.id}`}
                          aria-label="ویرایش"
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-dark shadow-md 
                            opacity-0 transition-all duration-200 transform translate-y-4 
                            group-hover:opacity-100 group-hover:translate-y-0 delay-300 
                            hover:bg-green hover:text-white 
                            dark:bg-gray-700 dark:text-white dark:hover:bg-green-dark"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                          </svg>
                        </Link>

                      </div>

                    </div>

                    {/* بخش اطلاعات محصول */}
                    <div className="flex flex-1 flex-col p-4">
                      {/* ستاره‌ها و امتیاز */}
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {/* <!-- stars --> */}
                          <div className="flex items-center gap-1">
                            <div style={{ display: "flex", gap: "4px" }}>
                              {[...Array(totalStars)].map((_, i) => {
                                // ستاره پر
                                if (i < Math.floor(safeFilled)) {
                                  return (
                                    <Image
                                      key={i}
                                      src="/images/icons/icon-star.svg"
                                      alt="star icon"
                                      width={15}
                                      height={15}
                                    />
                                  );
                                }
                                // ستاره نیمه پر (مثلاً برای امتیاز 3.5)
                                if (i === Math.floor(safeFilled) && safeFilled % 1 >= 0.5) {
                                  return (
                                    <Image
                                      key={i}
                                      src="/images/icons/icon-star-half.svg"
                                      alt="half star icon"
                                      width={15}
                                      height={15}
                                    />
                                  );
                                }
                                // ستاره خالی (SVG که دادی)
                                return (
                                  <svg
                                    key={i}
                                    className="fill-gray-4"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 18 18"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <g clipPath="url(#clip0_375_9172)">
                                      <path
                                        d="M16.7906 6.72187L11.7 5.93438L9.39377 1.09688C9.22502 0.759375 8.77502 0.759375 8.60627 1.09688L6.30002 5.9625L1.23752 6.72187C0.871891 6.77812 0.731266 7.25625 1.01252 7.50938L4.69689 11.3063L3.82502 16.6219C3.76877 16.9875 4.13439 17.2969 4.47189 17.0719L9.05627 14.5687L13.6125 17.0719C13.9219 17.2406 14.3156 16.9594 14.2313 16.6219L13.3594 11.3063L17.0438 7.50938C17.2688 7.25625 17.1563 6.77812 16.7906 6.72187Z"
                                        fill=""
                                      />
                                    </g>
                                    <defs>
                                      <clipPath id="clip0_375_9172">
                                        <rect width="18" height="18" fill="white" />
                                      </clipPath>
                                    </defs>
                                  </svg>
                                );
                              })}
                            </div>

                          </div>

                          <span>
                            {/* <span className="font-medium text-dark"> 4.7 امتیاز </span> */}
                            <p className="text-custom-sm text-gray-500 dark:text-gray-400">({item.reviews || 0})</p>
                          </span>
                        </div>
                        <span className="text-dark-2"> (5 نظر) </span>
                      </div>

                      {/* عنوان محصول */}
                      <h3 className="mb-2 flex-grow font-medium text-lg text-dark hover:text-blue dark:text-white dark:hover:text-blue-light">
                        <Link href={`/shop-details/${item.slug}`}>{item.title}</Link>
                      </h3>

                      {/* قیمت‌ها */}
                      <div className="mt-auto flex items-end gap-2">
                        {(item.hasDiscount && item.discountedPrice && item.discountedPrice > 0) ? (
                          <>
                            <span className="font-bold text-xl text-blue dark:text-blue-light">
                              ${item.discountedPrice}
                            </span>
                            <span className="text-md font-medium text-gray-400 line-through dark:text-gray-500">
                              ${item.price}
                            </span>
                          </>
                        ) : (
                          <span className="font-bold text-xl text-blue dark:text-blue-light">
                            ${item.price}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
